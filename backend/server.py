from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
import logging
import os
from pathlib import Path

import requests
from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict
from starlette.concurrency import run_in_threadpool
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")
client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]
app = FastAPI(title="Still We Rise Archive")
api_router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)

JOLPICA_URL = "https://api.jolpi.ca/ergast/f1/drivers/hamilton/results.json"
CUTOFF_SEASON = 2025
CACHE_TTL = timedelta(days=7)
SEASON_FALLBACK = {
    "2007": 4, "2008": 5, "2009": 2, "2010": 3, "2011": 3,
    "2012": 4, "2013": 1, "2014": 11, "2015": 10, "2016": 10,
    "2017": 9, "2018": 11, "2019": 11, "2020": 11, "2021": 8,
    "2022": 0, "2023": 0, "2024": 2, "2025": 0,
}
TRACK_FALLBACK = [
    {"circuit": "Silverstone Circuit", "country": "UK", "wins": 9, "podiums": 15},
    {"circuit": "Hungaroring", "country": "Hungary", "wins": 8, "podiums": 12},
    {"circuit": "Circuit Gilles Villeneuve", "country": "Canada", "wins": 7, "podiums": 10},
    {"circuit": "Circuit de Barcelona-Catalunya", "country": "Spain", "wins": 6, "podiums": 12},
    {"circuit": "Shanghai International Circuit", "country": "China", "wins": 6, "podiums": 9},
]
SEASON_META = {
    2007: (2, 109, "McLaren", "MP4-22"), 2008: (1, 98, "McLaren", "MP4-23"),
    2009: (5, 49, "McLaren", "MP4-24"), 2010: (4, 240, "McLaren", "MP4-25"),
    2011: (5, 227, "McLaren", "MP4-26"), 2012: (4, 190, "McLaren", "MP4-27"),
    2013: (4, 189, "Mercedes", "W04"), 2014: (1, 384, "Mercedes", "W05 Hybrid"),
    2015: (1, 381, "Mercedes", "W06 Hybrid"), 2016: (2, 380, "Mercedes", "W07 Hybrid"),
    2017: (1, 363, "Mercedes", "W08 EQ Power+"), 2018: (1, 408, "Mercedes", "W09 EQ Power+"),
    2019: (1, 413, "Mercedes", "W10 EQ Power+"), 2020: (1, 347, "Mercedes", "W11 EQ Performance"),
    2021: (2, 387.5, "Mercedes", "W12 E Performance"), 2022: (6, 240, "Mercedes", "W13 E Performance"),
    2023: (3, 234, "Mercedes", "W14 E Performance"), 2024: (7, 223, "Mercedes", "W15 E Performance"),
    2025: (6, 156, "Ferrari", "SF-25"),
}


class Archive(BaseModel):
    model_config = ConfigDict(extra="ignore")
    source: str
    cutoff_season: int
    updated_at: str
    stats: dict
    seasons: list[dict]
    tracks: list[dict]
    victories: list[dict]


def fallback_archive() -> dict:
    seasons = []
    for year, wins in SEASON_FALLBACK.items():
        season = int(year)
        position, points, team, car = SEASON_META[season]
        seasons.append({"year": season, "wins": wins, "podiums": 0, "poles": 0, "races": 0, "points": points, "position": position, "team": team, "car": car, "champion": position == 1})
    return {
        "source": "curated", "cutoff_season": CUTOFF_SEASON,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "stats": {"wins": 105, "podiums": 202, "poles": 104, "titles": 7, "win_circuits": 31},
        "seasons": seasons, "tracks": TRACK_FALLBACK, "victories": [],
    }


def fetch_results() -> list[dict]:
    races, offset = [], 0
    while True:
        response = requests.get(
            JOLPICA_URL, params={"limit": 100, "offset": offset}, timeout=20,
            headers={"User-Agent": "Still-We-Rise-Archive/1.0"},
        )
        response.raise_for_status()
        page = response.json()["MRData"]["RaceTable"]["Races"]
        races.extend(page)
        if len(page) < 100:
            return races
        offset += 100


def build_archive(races: list[dict]) -> dict:
    eligible = [race for race in races if int(race["season"]) <= CUTOFF_SEASON]
    podiums = [race for race in eligible if int(race["Results"][0]["position"]) <= 3]
    wins = [race for race in eligible if race["Results"][0]["position"] == "1"]
    wins_by_year = Counter(race["season"] for race in wins)
    podiums_by_year = Counter(race["season"] for race in podiums)
    poles_by_year = Counter(race["season"] for race in eligible if int(race["Results"][0]["grid"]) == 1)
    races_by_year = Counter(race["season"] for race in eligible)
    seasons = []
    for year in range(2007, CUTOFF_SEASON + 1):
        position, points, team, car = SEASON_META[year]
        seasons.append({
            "year": year, "wins": wins_by_year[str(year)], "podiums": podiums_by_year[str(year)],
            "poles": poles_by_year[str(year)], "races": races_by_year[str(year)], "points": points,
            "position": position, "team": team, "car": car, "champion": position == 1,
        })
    track_data = defaultdict(lambda: {"wins": 0, "podiums": 0, "country": ""})
    for race in podiums:
        circuit = race["Circuit"]["circuitName"]
        track_data[circuit]["podiums"] += 1
        track_data[circuit]["country"] = race["Circuit"]["Location"]["country"]
    for race in wins:
        track_data[race["Circuit"]["circuitName"]]["wins"] += 1
    tracks = sorted(
        ({"circuit": circuit, **values} for circuit, values in track_data.items()),
        key=lambda item: (item["wins"], item["podiums"]), reverse=True,
    )
    victories = []
    for race in reversed(wins):
        result = race["Results"][0]
        victories.append({
            "number": len(wins) - len(victories), "year": int(race["season"]),
            "race": race["raceName"].replace(" Grand Prix", ""),
            "circuit": race["Circuit"]["circuitName"],
            "country": race["Circuit"]["Location"]["country"], "date": race["date"],
            "constructor": result["Constructor"]["name"], "grid": int(result["grid"]),
            "points": float(result["points"]), "laps": int(result["laps"]), "round": int(race["round"]),
            "status": result["status"], "time": result.get("Time", {}).get("time", "—"),
            "fastest_lap": result.get("FastestLap", {}).get("rank") == "1", "from_pole": result["grid"] == "1",
        })
    return {
        "source": "Jolpica F1", "cutoff_season": CUTOFF_SEASON,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "stats": {"wins": len(wins), "podiums": len(podiums), "poles": 104, "titles": 7, "win_circuits": len([track for track in tracks if track["wins"]])},
        "seasons": seasons, "tracks": tracks, "victories": victories,
    }


@api_router.get("/")
async def root():
    return {"message": "Still We Rise archive online"}


@api_router.get("/archive", response_model=Archive)
async def get_archive():
    cached = await db.archives.find_one({"key": "hamilton-2025-v3"}, {"_id": 0})
    if cached and datetime.now(timezone.utc) - datetime.fromisoformat(cached["updated_at"]) < CACHE_TTL:
        return cached
    try:
        archive = build_archive(await run_in_threadpool(fetch_results))
        await db.archives.update_one({"key": "hamilton-2025-v3"}, {"$set": {"key": "hamilton-2025-v3", **archive}}, upsert=True)
        return archive
    except Exception as exc:
        logger.warning("Jolpica refresh failed: %s", exc)
        return cached or fallback_archive()


app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","), allow_methods=["*"], allow_headers=["*"])


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()