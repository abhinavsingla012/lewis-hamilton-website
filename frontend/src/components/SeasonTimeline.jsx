import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Crown, Flag, MapPin, Radio } from "lucide-react";
import { IMAGES } from "../data/content";
import { TimelineTelemetry } from "./TimelineTelemetry";

const seasonImages = {
  2007: IMAGES.season2007, 2008: IMAGES.season2008, 2009: IMAGES.season2009, 2010: IMAGES.season2010,
  2011: IMAGES.season2011, 2012: IMAGES.night, 2013: IMAGES.china, 2014: IMAGES.season2014,
  2015: IMAGES.season2015, 2016: IMAGES.season2016, 2017: IMAGES.season2017, 2018: IMAGES.season2018,
  2019: IMAGES.season2019, 2020: IMAGES.season2020, 2021: IMAGES.podium, 2022: IMAGES.garage,
  2023: IMAGES.helmet, 2024: IMAGES.silverstone, 2025: IMAGES.ferrari,
};
const imagePositions = {
  2007: "50% 26%", 2008: "50% 22%", 2009: "50% 28%", 2010: "50% 24%",
  2011: "50% 24%", 2014: "50% 28%", 2015: "50% 24%", 2016: "52% 27%",
  2017: "50% 22%", 2018: "50% 24%", 2019: "50% 25%", 2020: "50% 26%",
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
  const active = data[Math.min(activeIndex, data.length - 1)];
  const achievements = active?.achievements?.[achievementType] || [];
  const positionColor = positionColors[active.position] || "#777b80";
  const winConversion = active.races ? Math.round((active.wins / active.races) * 100) : 0;
  const campaignLabel = active.champion ? "TITLE CAMPAIGN" : active.wins ? "VICTORY CAMPAIGN" : "RELENTLESS PURSUIT";
  const moveTo = (nextIndex) => {
    const next = Math.max(0, Math.min(data.length - 1, nextIndex));
    setActiveIndex(next);
  };

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
      <AnimatePresence initial={false} mode="sync">
        <motion.figure
          key={`image-${active.year}`}
          className="timeline-v3-portrait"
          initial={reduceMotion ? false : { opacity: 0, scale: 1.035 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: .99 }}
          transition={{ duration: reduceMotion ? .01 : .55, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={seasonImages[active.year]}
            alt={`${active.year} ${active.team} season`}
            style={{ objectPosition: imagePositions[active.year] || "50% 30%" }}
            decoding="async"
            draggable="false"
            data-testid="timeline-active-image"
          />
        </motion.figure>
      </AnimatePresence>
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={`echo-${active.year}`}
          className="timeline-v4-image-echo"
          style={{ backgroundImage: `url(${seasonImages[active.year]})`, backgroundPosition: imagePositions[active.year] || "50% 30%" }}
          initial={reduceMotion ? false : { opacity: 0, x: -16 }}
          animate={{ opacity: .22, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? .01 : .58, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        />
      </AnimatePresence>
      <div className="timeline-v3-image-scrim" aria-hidden="true" />
      <div className="timeline-v4-dissolve" aria-hidden="true" />
      <div className="timeline-v3-grid" aria-hidden="true" />
      <TimelineTelemetry activeIndex={activeIndex} activeYear={active.year} reduceMotion={reduceMotion} />
      <span className="timeline-v4-year-outline" aria-hidden="true">{active.year}</span>

      <header className="timeline-v3-heading">
        <p data-testid="timeline-section-label"><span>02</span> THE ASCENT</p>
        <h2 data-testid="timeline-section-title">NINETEEN SEASONS.<br/>ONE STANDARD.</h2>
      </header>

      <div className="timeline-v3-year-lockup">
        <span data-testid="timeline-active-year">{active.year}</span>
        <div className="timeline-v3-team-line">
          <strong data-testid="timeline-active-team">{active.team}</strong>
          <i aria-hidden="true" />
          <small data-testid="timeline-active-car">{active.car}</small>
        </div>
      </div>

      <AnimatePresence initial={false} mode="sync">
        <motion.article
          key={`data-${active.year}`}
          className="timeline-v3-data"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
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
            <div className="timeline-v3-place-list" role="tabpanel" data-testid="timeline-achievement-list">
              {achievements.map((place, index) => <div key={`${place.round}-${place.circuit}`} data-testid={`timeline-${achievementType}-place-${slug(place.circuit)}-${index + 1}`}>
                <span>{String(place.round).padStart(2, "0")}</span>
                <p><strong>{place.circuit.replace(" Circuit", "")}</strong><small>{place.locality || place.race} · {place.country}</small></p>
              </div>)}
              {!achievements.length && <p className="timeline-v3-empty" data-testid="timeline-achievement-empty-state">NO {achievementType.toUpperCase()} RECORDED THIS SEASON</p>}
            </div>
          </div>
        </motion.article>
      </AnimatePresence>

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