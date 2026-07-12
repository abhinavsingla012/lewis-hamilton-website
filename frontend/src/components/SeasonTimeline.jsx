import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Crown, Flag, MapPin, Radio } from "lucide-react";
import { IMAGES } from "../data/content";
import { seasonStories } from "../data/seasonStories";
import { TimelineEraSpine } from "./TimelineEraSpine";
import { TimelineStory } from "./TimelineStory";
import { TimelineTelemetry } from "./TimelineTelemetry";

const seasonImages = {
  2007: IMAGES.season2007, 2008: IMAGES.season2008, 2009: IMAGES.season2009, 2010: IMAGES.season2010,
  2011: IMAGES.season2011, 2012: IMAGES.night, 2013: IMAGES.china, 2014: IMAGES.season2014,
  2015: IMAGES.season2015, 2016: IMAGES.season2016, 2017: IMAGES.season2017, 2018: IMAGES.season2018,
  2019: IMAGES.season2019, 2020: IMAGES.season2020, 2021: IMAGES.podium, 2022: IMAGES.garage,
  2023: IMAGES.helmet, 2024: IMAGES.silverstone, 2025: IMAGES.ferrari,
};
const imageFrames = {
  2007: { fit: "contain", position: "50% 100%" }, 2008: { fit: "contain", position: "50% 100%" },
  2009: { fit: "contain", position: "50% 100%" }, 2010: { fit: "contain", position: "50% 100%" },
  2011: { fit: "contain", position: "50% 100%" }, 2012: { fit: "contain", position: "50% 100%" },
  2013: { fit: "contain", position: "50% 100%" }, 2014: { fit: "cover", position: "62% 50%" },
  2015: { fit: "cover", position: "62% 50%" }, 2016: { fit: "cover", position: "70% 50%" },
  2017: { fit: "contain", position: "50% 100%" }, 2018: { fit: "cover", position: "60% 50%" },
  2019: { fit: "cover", position: "48% 50%" }, 2020: { fit: "cover", position: "48% 52%" },
  2021: { fit: "contain", position: "50% 100%" }, 2022: { fit: "contain", position: "50% 100%" },
  2023: { fit: "contain", position: "50% 100%" }, 2024: { fit: "contain", position: "50% 100%" },
  2025: { fit: "contain", position: "50% 100%" },
};
const positionColors = {
  1: "#d6b34a", 2: "#d9dde2", 3: "#b8794a", 4: "#8fa3b8",
  5: "#78889a", 6: "#67717d", 7: "#575f69",
};
const achievementOptions = [
  { key: "wins", label: "Wins", icon: Flag },
  { key: "podiums", label: "Podiums", icon: MapPin },
  { key: "poles", label: "Poles", icon: Radio },
];
const ordinal = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  const teen = number % 100;
  const suffix = teen >= 11 && teen <= 13 ? "TH" : number % 10 === 1 ? "ST" : number % 10 === 2 ? "ND" : number % 10 === 3 ? "RD" : "TH";
  return `${number}${suffix}`;
};
const slug = (value = "") => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const SeasonTimeline = ({ seasons = [] }) => {
  const timelineRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const fallback = useMemo(() => Array.from({ length: 19 }, (_, index) => ({
    year: 2007 + index, wins: 0, podiums: 0, poles: 0, points: "—", position: "—",
    team: index < 6 ? "McLaren" : index < 18 ? "Mercedes" : "Ferrari", car: "Formula One",
    achievements: { wins: [], podiums: [], poles: [] },
  })), []);
  const data = seasons.length ? seasons : fallback;
  const [activeIndex, setActiveIndex] = useState(0);
  const [achievementType, setAchievementType] = useState("wins");
  const [signalIndex, setSignalIndex] = useState(0);
  const active = data[Math.min(activeIndex, data.length - 1)];
  const achievements = active?.achievements?.[achievementType] || [];
  const activePlace = achievements[Math.min(signalIndex, Math.max(0, achievements.length - 1))];
  const activeFrame = imageFrames[active.year] || { fit: "cover", position: "50% 50%" };
  const positionColor = positionColors[active.position] || "#777b80";
  const winConversion = active.races ? Math.round((active.wins / active.races) * 100) : 0;
  const campaignLabel = active.champion ? "TITLE CAMPAIGN" : active.wins ? "VICTORY CAMPAIGN" : "RELENTLESS PURSUIT";
  const peaks = useMemo(() => ["wins", "podiums", "poles"].reduce((result, key) => ({ ...result, [key]: Math.max(...data.map((season) => Number(season[key]) || 0), 1) }), {}), [data]);
  const titlesToDate = data.slice(0, activeIndex + 1).filter((season) => season.champion).length;
  let activeStreak = 0;
  for (let index = activeIndex; index >= 0 && data[index]?.champion; index -= 1) activeStreak += 1;
  const titleContext = activeStreak > 1 ? `TITLE STREAK ×${activeStreak}` : `${titlesToDate} ${titlesToDate === 1 ? "TITLE" : "TITLES"} BANKED`;
  const moveTo = (nextIndex) => {
    const next = Math.max(0, Math.min(data.length - 1, nextIndex));
    setActiveIndex(next);
  };

  useEffect(() => {
    setSignalIndex(0);
  }, [activeIndex, achievementType]);

  useEffect(() => {
    [activeIndex - 1, activeIndex + 1].forEach((index) => {
      const year = data[index]?.year;
      if (!year || !seasonImages[year]) return;
      const image = new Image();
      image.src = seasonImages[year];
    });
  }, [activeIndex, data]);

  useEffect(() => {
    const handleKeys = (event) => {
      const viewport = timelineRef.current?.closest(".circuit-viewport");
      if (viewport?.dataset.active !== "timeline" || viewport?.dataset.traveling === "true") return;
      if (event.key === "ArrowRight") { event.preventDefault(); setActiveIndex((current) => Math.min(data.length - 1, current + 1)); }
      if (event.key === "ArrowLeft") { event.preventDefault(); setActiveIndex((current) => Math.max(0, current - 1)); }
    };
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [data.length]);

  return <section
    ref={timelineRef}
    id="timeline"
    className="timeline-section timeline-v3 timeline-arrow-only"
    style={{ "--position-color": positionColor }}
    data-position={active.position}
    data-testid="season-timeline-section"
  >
    <div className="timeline-v3-stage" data-testid="timeline-scroll-runway">
      <div className="timeline-v3-image-field" aria-hidden="true" />
      <motion.figure
        key={`image-${active.year}`}
        className={`timeline-v3-portrait fit-${activeFrame.fit}`}
        initial={reduceMotion ? false : { opacity: 0, scale: 1.035 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduceMotion ? .01 : .55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="timeline-v3-portrait-backdrop" style={{ backgroundImage: `url(${seasonImages[active.year]})`, backgroundPosition: activeFrame.position }} aria-hidden="true" />
        <img
          src={seasonImages[active.year]}
          alt={`${active.year} ${active.team} season`}
          style={{ objectFit: activeFrame.fit, objectPosition: activeFrame.position }}
          decoding="async"
          draggable="false"
          data-testid="timeline-active-image"
        />
      </motion.figure>
      <motion.div
        key={`echo-${active.year}`}
        className="timeline-v4-image-echo"
        style={{ backgroundImage: `url(${seasonImages[active.year]})`, backgroundPosition: activeFrame.position }}
        initial={reduceMotion ? false : { opacity: 0, x: -16 }}
        animate={{ opacity: .22, x: 0 }}
        transition={{ duration: reduceMotion ? .01 : .58, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      />
      <div className="timeline-v3-image-scrim" aria-hidden="true" />
      <div className="timeline-v4-dissolve" aria-hidden="true" />
      <div className="timeline-v3-grid" aria-hidden="true" />
      <TimelineTelemetry activeIndex={activeIndex} activeYear={active.year} reduceMotion={reduceMotion} signalIndex={signalIndex} />
      <span className="timeline-v4-year-outline" aria-hidden="true">{active.year}</span>

      <header className="timeline-v3-heading">
        <h2 data-testid="timeline-section-title">19 SEASONS. <span>ONE STANDARD.</span></h2>
      </header>

      <div className="timeline-v3-year-lockup">
        <span data-testid="timeline-active-year">{active.year}</span>
        <div className="timeline-v3-team-line">
          <strong data-testid="timeline-active-team">{active.team}</strong>
          <i aria-hidden="true" />
          <small data-testid="timeline-active-car">{active.car}</small>
        </div>
      </div>
      <TimelineStory active={active} peaks={peaks} story={seasonStories[active.year]} titleContext={titleContext} reduceMotion={reduceMotion} />

      <motion.article
        key={`data-${active.year}`}
        className="timeline-v3-data"
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? .01 : .34, ease: [0.22, 1, 0.36, 1] }}
        aria-live="polite"
        data-testid={`season-card-${active.year}`}
      >
          <div className="timeline-v3-result">
            <div>
              <span data-testid="timeline-championship-label">DRIVERS&apos; CHAMPIONSHIP</span>
              <strong data-testid="timeline-position-value">{active.position === "—" ? "—" : ordinal(active.position)}</strong>
            </div>
            {active.champion && <span className="timeline-v3-crown" data-testid="timeline-champion-badge"><Crown aria-hidden="true"/> WORLD CHAMPION</span>}
          </div>

          <div className="timeline-v4-campaign" data-testid="timeline-campaign-signal">
            <span data-testid="timeline-campaign-label">{campaignLabel}</span>
            <i><b style={{ transform: `scaleX(${winConversion / 100})` }} /></i>
            <small data-testid="timeline-win-conversion">{winConversion}% WIN CONVERSION</small>
          </div>

          <div className="timeline-v3-stats" data-testid="timeline-season-stat-grid">
            <div data-testid="season-active-wins"><strong>{active.wins}</strong><span>WINS</span></div>
            <div data-testid="season-active-podiums"><strong>{active.podiums}</strong><span>PODIUMS</span></div>
            <div data-testid="season-active-poles"><strong>{active.poles}</strong><span>POLES</span></div>
            <div data-testid="season-active-points"><strong>{active.points}</strong><span>POINTS</span></div>
          </div>

          <div className="timeline-v3-achievements">
            <div className="timeline-v4-location-heading" data-testid="timeline-location-heading">
              <span>GLOBAL PERFORMANCE SIGNAL</span>
              <strong>{String(achievements.length).padStart(2, "0")} LOCATIONS / {achievementType.toUpperCase()}</strong>
            </div>
            <div className="timeline-v3-tabs" role="tablist" aria-label="Season achievement locations" data-testid="timeline-achievement-selector">
              {achievementOptions.map(({ key, label, icon: Icon }) => <button
                key={key}
                type="button"
                role="tab"
                aria-selected={achievementType === key}
                className={achievementType === key ? "is-active" : ""}
                onClick={() => setAchievementType(key)}
                data-testid={`timeline-${key}-tab-button`}
              ><Icon aria-hidden="true"/><span>{label}</span><strong>{active[key]}</strong></button>)}
            </div>
            <div className="timeline-v5-circuit-signal" data-testid="timeline-circuit-signal">
              <span>ACTIVE CIRCUIT SIGNAL</span>
              <strong data-testid="timeline-signal-circuit">{activePlace?.circuit?.replace(" Circuit", "") || "NO SIGNAL"}</strong>
              <small data-testid="timeline-signal-round">{activePlace ? `ROUND ${String(activePlace.round).padStart(2, "0")} / ${String(active.races).padStart(2, "0")} · ${activePlace.race}` : "NO RECORDED EVENT"}</small>
              <i><b style={{ transform: `scaleX(${activePlace && active.races ? activePlace.round / active.races : 0})` }} /></i>
            </div>
            <div className="timeline-v3-place-list" role="tabpanel" data-testid="timeline-achievement-list">
              {achievements.map((place, index) => <button type="button" className={index === signalIndex ? "is-signaled" : ""} aria-pressed={index === signalIndex} onPointerEnter={() => setSignalIndex(index)} onFocus={() => setSignalIndex(index)} onClick={() => setSignalIndex(index)} key={`${place.round}-${place.circuit}`} data-testid={`timeline-${achievementType}-place-${slug(place.circuit)}-${index + 1}`}>
                <span>{String(place.round).padStart(2, "0")}</span>
                <p><strong>{place.circuit.replace(" Circuit", "")}</strong><small>{place.locality || place.race} · {place.country}</small></p>
              </button>)}
              {!achievements.length && <p className="timeline-v3-empty" data-testid="timeline-achievement-empty-state">NO {achievementType.toUpperCase()} RECORDED THIS SEASON</p>}
            </div>
          </div>
      </motion.article>

      <TimelineEraSpine activeIndex={activeIndex} data={data} onSelect={moveTo} />
      <nav className="timeline-v3-navigation" aria-label="Season timeline controls" data-testid="timeline-season-navigation">
        <button type="button" onClick={() => moveTo(activeIndex - 1)} disabled={activeIndex === 0} data-testid="timeline-previous-year-button" aria-label="Previous season"><ChevronLeft/></button>
        <div className="timeline-v3-rail" data-testid="timeline-season-progress">
          {data.map((season, index) => <button
            type="button"
            key={season.year}
            className={index === activeIndex ? "is-active" : ""}
            onClick={() => moveTo(index)}
            aria-label={`View ${season.year} season`}
            aria-current={index === activeIndex ? "step" : undefined}
            data-testid={`timeline-year-${season.year}-button`}
          ><span>{season.year}</span></button>)}
        </div>
        <span className="timeline-v3-counter" data-testid="timeline-year-counter">{String(activeIndex + 1).padStart(2, "0")} / {String(data.length).padStart(2, "0")}</span>
        <button type="button" onClick={() => moveTo(activeIndex + 1)} disabled={activeIndex === data.length - 1} data-testid="timeline-next-year-button" aria-label="Next season"><ChevronRight/></button>
      </nav>
      <div className="timeline-v3-key-hint" data-testid="timeline-keyboard-hint">← → / CHANGE SEASON</div>
    </div>
  </section>;
};