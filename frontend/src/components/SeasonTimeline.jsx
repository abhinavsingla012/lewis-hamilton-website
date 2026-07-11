import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { IMAGES } from "../data/content";

const seasonImages = {
  2007: IMAGES.season2007, 2008: IMAGES.season2008, 2009: IMAGES.season2009, 2010: IMAGES.season2010,
  2011: IMAGES.season2011, 2012: IMAGES.night, 2013: IMAGES.china, 2014: IMAGES.season2014,
  2015: IMAGES.season2015, 2016: IMAGES.season2016, 2017: IMAGES.season2017, 2018: IMAGES.season2018,
  2019: IMAGES.night, 2020: IMAGES.w11, 2021: IMAGES.podium, 2022: IMAGES.garage,
  2023: IMAGES.helmet, 2024: IMAGES.silverstone, 2025: IMAGES.ferrari,
};
const ordinal = (value) => `${value}${value === 1 ? "ST" : value === 2 ? "ND" : value === 3 ? "RD" : "TH"}`;

export const SeasonTimeline = ({ seasons = [] }) => {
  const runwayRef = useRef(null);
  const fallback = useMemo(() => Array.from({ length: 19 }, (_, index) => ({ year: 2007 + index, wins: 0, podiums: 0, poles: 0, points: "—", position: "—", team: index < 6 ? "McLaren" : index < 18 ? "Mercedes" : "Ferrari", car: "Formula One" })), []);
  const data = seasons.length ? seasons : fallback;
  const [activeIndex, setActiveIndex] = useState(0);
  const active = data[Math.min(activeIndex, data.length - 1)];
  const { scrollYProgress } = useScroll({ target: runwayRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    setActiveIndex(Math.min(data.length - 1, Math.round(progress * (data.length - 1))));
  });

  const moveTo = (nextIndex) => {
    const next = Math.max(0, Math.min(data.length - 1, nextIndex));
    setActiveIndex(next);
    if (!runwayRef.current) return;
    const travel = runwayRef.current.offsetHeight - window.innerHeight;
    window.scrollTo({ top: runwayRef.current.offsetTop + (next / (data.length - 1)) * travel, behavior: "smooth" });
  };

  useEffect(() => {
    const handleKeys = (event) => {
      const bounds = runwayRef.current?.getBoundingClientRect();
      if (!bounds || bounds.top > window.innerHeight || bounds.bottom < 0) return;
      if (event.key === "ArrowRight") { event.preventDefault(); moveTo(activeIndex + 1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); moveTo(activeIndex - 1); }
    };
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  });

  return <section id="timeline" className="timeline-section timeline-v2" data-testid="season-timeline-section">
    <div className="timeline-intro"><p className="eyebrow" data-testid="timeline-section-label">(02) / THE JOURNEY</p><h2 data-testid="timeline-section-title">NINETEEN<br/><i>seasons.</i><br/>ONE STANDARD.</h2></div>
    <div ref={runwayRef} className="timeline-runway" style={{ height: `${data.length * 58}vh` }} data-testid="timeline-scroll-runway">
      <div className={`timeline-stage theme-${active.year === 2025 ? "red" : active.champion ? "purple" : "dark"}`} data-testid="timeline-active-panel">
        <aside className="timeline-visual">
          <div className="timeline-year" data-testid="timeline-active-year">{active.year}</div>
          <div className="timeline-media"><motion.img key={active.year} initial={{ opacity: .65, scale: 1.05, x: 22 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: .28 }} src={seasonImages[active.year]} alt={`${active.year} ${active.team} season`} data-testid="timeline-active-image" />{active.champion && <span className="champion-stamp"><Crown/> WORLD CHAMPION</span>}</div>
          <div className="timeline-team"><span data-testid="timeline-active-team">{active.team}</span><strong data-testid="timeline-active-car">{active.car}</strong></div>
        </aside>
        <motion.article key={active.year} className="season-single-card" initial={{ opacity: .72, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .22 }} data-testid={`season-card-${active.year}`}>
          <div className="season-card-head"><span>{active.year}</span><span>{active.team}</span>{active.champion && <Crown size={18}/>}</div>
          <div className="season-result"><strong>{active.position === "—" ? "—" : ordinal(active.position)}</strong><span>DRIVERS&apos; CHAMPIONSHIP</span></div>
          <div className="season-data"><div data-testid="season-active-wins"><strong>{active.wins}</strong><span>WINS</span></div><div data-testid="season-active-podiums"><strong>{active.podiums}</strong><span>PODIUMS</span></div><div data-testid="season-active-poles"><strong>{active.poles}</strong><span>POLES</span></div><div data-testid="season-active-points"><strong>{active.points}</strong><span>POINTS</span></div></div>
          <div className="season-progress"><span style={{ width: `${Math.max(4, (active.wins / 11) * 100)}%` }} /></div>
          <div className="timeline-controls"><button onClick={() => moveTo(activeIndex - 1)} disabled={activeIndex === 0} data-testid="timeline-previous-year-button" aria-label="Previous season"><ChevronLeft/></button><span data-testid="timeline-year-counter">{String(activeIndex + 1).padStart(2, "0")} / {String(data.length).padStart(2, "0")}</span><button onClick={() => moveTo(activeIndex + 1)} disabled={activeIndex === data.length - 1} data-testid="timeline-next-year-button" aria-label="Next season"><ChevronRight/></button></div>
        </motion.article>
        <div className="timeline-key-hint" data-testid="timeline-keyboard-hint">SCROLL OR USE ← →</div>
        <div className="timeline-master-progress"><span style={{ width: `${((activeIndex + 1) / data.length) * 100}%` }}/></div>
      </div>
    </div>
  </section>;
};