import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { IMAGES } from "../data/content";

const imageForSeason = (year) => year <= 2012 ? IMAGES.mclaren : year === 2025 ? IMAGES.ferrari : year >= 2019 ? IMAGES.w11 : IMAGES.china;
const ordinal = (value) => `${value}${value === 1 ? "ST" : value === 2 ? "ND" : value === 3 ? "RD" : "TH"}`;

export const SeasonTimeline = ({ seasons = [] }) => {
  const fallback = useMemo(() => Array.from({ length: 19 }, (_, index) => ({ year: 2007 + index, wins: 0, podiums: 0, poles: 0, points: "—", position: "—", team: index < 6 ? "McLaren" : index < 18 ? "Mercedes" : "Ferrari", car: "Formula One" })), []);
  const data = seasons.length ? seasons : fallback;
  const [active, setActive] = useState(data.find((season) => season.year === 2020) || data[0]);
  return <section id="timeline" className="timeline-section" data-testid="season-timeline-section">
    <div className="timeline-intro"><p className="eyebrow" data-testid="timeline-section-label">(02) / THE JOURNEY</p><h2 data-testid="timeline-section-title">NINETEEN<br/><i>seasons.</i><br/>ONE STANDARD.</h2></div>
    <div className="timeline-layout">
      <aside className={`timeline-sticky theme-${active.year === 2025 ? "red" : active.champion ? "purple" : "dark"}`} data-testid="timeline-active-panel">
        <div className="timeline-year" data-testid="timeline-active-year">{active.year}</div>
        <div className="timeline-media"><motion.img key={active.year} initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} src={imageForSeason(active.year)} alt={`${active.year} ${active.team} season`} data-testid="timeline-active-image" />{active.champion && <span className="champion-stamp"><Crown/> WORLD CHAMPION</span>}</div>
        <div className="timeline-team"><span data-testid="timeline-active-team">{active.team}</span><strong data-testid="timeline-active-car">{active.car}</strong></div>
      </aside>
      <div className="timeline-years" data-testid="timeline-season-list">{data.map((season) => <motion.article key={season.year} className={`season-card ${season.champion ? "champion" : ""}`} onViewportEnter={() => setActive(season)} viewport={{ margin: "-35% 0px -45% 0px" }} data-testid={`season-card-${season.year}`}>
        <div className="season-card-head"><span>{season.year}</span><span>{season.team}</span>{season.champion && <Crown size={18}/>}</div>
        <div className="season-result"><strong>{season.position === "—" ? "—" : ordinal(season.position)}</strong><span>DRIVERS' CHAMPIONSHIP</span></div>
        <div className="season-data"><div><strong>{season.wins}</strong><span>WINS</span></div><div><strong>{season.podiums}</strong><span>PODIUMS</span></div><div><strong>{season.poles}</strong><span>POLES</span></div><div><strong>{season.points}</strong><span>POINTS</span></div></div>
        <div className="season-progress"><span style={{ width: `${Math.max(4, (season.wins / 11) * 100)}%` }} /></div>
      </motion.article>)}</div>
    </div>
  </section>;
};