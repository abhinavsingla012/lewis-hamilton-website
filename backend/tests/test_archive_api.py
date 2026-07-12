import os

import pytest
import requests


# Archive API regression tests for Hamilton stats, seasons/tracks, and victory records
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")


@pytest.fixture(scope="session")
def api_base_url():
    if not BASE_URL:
        pytest.skip("REACT_APP_BACKEND_URL not set; skipping external API tests")
    return BASE_URL.rstrip("/")


@pytest.fixture(scope="session")
def archive_payload(api_base_url):
    response = requests.get(f"{api_base_url}/api/archive", timeout=30)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    return data


def test_api_root_health_message(api_base_url):
    response = requests.get(f"{api_base_url}/api/", timeout=20)
    assert response.status_code == 200
    payload = response.json()
    assert payload["message"] == "Still We Rise archive online"


def test_archive_response_structure(archive_payload):
    for key in ["source", "cutoff_season", "updated_at", "stats", "seasons", "tracks", "victories"]:
        assert key in archive_payload


def test_archive_hero_stat_values(archive_payload):
    stats = archive_payload["stats"]
    assert stats["wins"] == 105
    assert stats["titles"] == 7
    assert stats["poles"] == 104
    assert stats["podiums"] == 202


def test_archive_seasons_include_latest_finished_season(archive_payload):
    seasons = archive_payload["seasons"]
    assert isinstance(seasons, list)
    assert any(item["year"] == 2025 for item in seasons)


def test_archive_seasons_span_2007_to_2025_and_include_required_fields(archive_payload):
    seasons = archive_payload["seasons"]
    assert len(seasons) == 19
    years = [season["year"] for season in seasons]
    assert years == list(range(2007, 2026))

    required = {"year", "wins", "podiums", "poles", "races", "points", "position", "team", "car", "champion", "achievements"}
    for season in seasons:
        assert required.issubset(set(season.keys()))
        assert set(season["achievements"]) == {"wins", "podiums", "poles"}


def test_archive_2020_season_values_exact(archive_payload):
    season_2020 = next((s for s in archive_payload["seasons"] if s["year"] == 2020), None)
    assert season_2020 is not None
    assert season_2020["wins"] == 11
    assert season_2020["podiums"] == 14
    assert season_2020["poles"] == 10
    assert season_2020["points"] == 347
    assert season_2020["position"] == 1
    assert season_2020["team"] == "Mercedes"
    assert season_2020["car"] == "W11 EQ Performance"
    assert len(season_2020["achievements"]["wins"]) == 11
    assert len(season_2020["achievements"]["podiums"]) == 14
    assert len(season_2020["achievements"]["poles"]) == 10
    achievement_fields = {"round", "race", "circuit", "locality", "country"}
    assert achievement_fields.issubset(season_2020["achievements"]["wins"][0])


def test_archive_tracks_include_silverstone_record(archive_payload):
    tracks = archive_payload["tracks"]
    silverstone = next((t for t in tracks if t["circuit"] == "Silverstone Circuit"), None)
    assert silverstone is not None
    assert silverstone["wins"] == 9
    assert silverstone["podiums"] == 15


def test_archive_victories_total_count(archive_payload):
    victories = archive_payload["victories"]
    assert isinstance(victories, list)
    assert len(victories) == 105


def test_archive_victory_fields_and_numbering(archive_payload):
    victories = archive_payload["victories"]
    required = {
        "number", "year", "race", "circuit", "country", "date", "constructor",
        "grid", "points", "laps", "round", "status", "time", "fastest_lap", "from_pole",
    }
    assert required.issubset(set(victories[0].keys()))

    numbers = sorted(v["number"] for v in victories)
    assert numbers == list(range(1, 106))


def test_archive_latest_victory_is_number_105_belgian_2024(archive_payload):
    victories = archive_payload["victories"]
    belgian = next(
        (
            v for v in victories
            if v["number"] == 105 and v["year"] == 2024 and "Belgian" in v["race"]
        ),
        None,
    )
    assert belgian is not None
    assert isinstance(belgian["grid"], int)
    assert isinstance(belgian["laps"], int)
    assert isinstance(belgian["points"], float)
    assert isinstance(belgian["from_pole"], bool)
    assert isinstance(belgian["fastest_lap"], bool)
