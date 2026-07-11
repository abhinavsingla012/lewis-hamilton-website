import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Marquee from "react-fast-marquee";
import { ArrowUpRight, ChevronLeft, ChevronRight, Flag, Trophy } from "lucide-react";
import { eras, IMAGES, quotes, trackShapes } from "../data/content";
import { SeasonTimeline } from "./SeasonTimeline";
import { VisualGallery } from "./VisualGallery";

const Reveal = ({ children, className = "" }) => <motion.div className={className} initial={{ opacity: 0, y: 55 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-12%" }} transition={{ duration: .8, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
const SectionHead = ({ index, label, title, light = false }) => <div className={`section-head ${light ? "light" : ""}`}><p className="eyebrow" data-testid={`${label.toLowerCase()}-section-label`}>({index}) / {label}</p><h2 data-testid={`${label.toLowerCase()}-section-title`}>{title}</h2></div>;

export const StorySections = ({ archive }) => {
  const [era, setEra] = useState(2);
  const [quote, setQuote] = useState(0);
  const [year, setYear] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const tracks = archive?.tracks?.slice(0, 5) || [];
  const wins = useMemo(() => archive?.victories || [], [archive?.victories]);
  const years = useMemo(() => ["All", ...Array.from(new Set(wins.map((win) => win.year))).sort((a, b) => b - a)], [wins]);
  const filtered = year === "All" ? wins : wins.filter((win) => win.year === Number(year));
  const legacyStats = [
    { value: archive?.stats?.titles || 7, label: "WORLD TITLES", note: "JOINT-MOST IN HISTORY", testId: "legacy-world-titles", featured: true },
    { value: archive?.stats?.wins || 105, label: "RACE WINS", note: "FORMULA 1 RECORD", testId: "legacy-race-wins", featured: true },
    { value: archive?.stats?.podiums || 202, label: "PODIUMS", note: "FORMULA 1 RECORD", testId: "legacy-podiums", featured: true },
    { value: archive?.stats?.poles || 104, label: "POLE POSITIONS", note: "THE ULTIMATE PACE", testId: "legacy-pole-positions" },
    { value: archive?.stats?.win_circuits || 31, label: "WINNING CIRCUITS", note: "ACROSS THE WORLD", testId: "legacy-winning-circuits" },
    { value: 19, label: "SEASONS", note: "2007—2025", testId: "legacy-seasons" },
  ];

  return <>
    <section id="legacy" className="legacy-section legacy-monument" aria-labelledby="legacy-monument-title" data-testid="legacy-section">
      <div className="legacy-grid-field" aria-hidden="true" />
      <div className="legacy-ghost-number" aria-hidden="true">44</div>
      <figure className="legacy-portrait legacy-enter" style={{ "--legacy-delay": ".08s" }}>
        <img src={IMAGES.portrait} alt="Lewis Hamilton celebrating a landmark achievement" data-testid="legacy-portrait-image" />
        <figcaption data-testid="legacy-portrait-caption"><span>STEVENAGE</span><i>→</i><span>THE WORLD</span></figcaption>
      </figure>
      <div className="legacy-narrative">
        <p className="legacy-overline legacy-enter" style={{ "--legacy-delay": ".12s" }} data-testid="legacy-section-label"><span>01 / THE LEGACY</span><span>2007—2025</span></p>
        <h2 id="legacy-monument-title" className="legacy-title legacy-enter" style={{ "--legacy-delay": ".18s" }} data-testid="legacy-section-title"><span>THE RECORD</span><span>BEYOND</span><span>RECORDS.</span></h2>
        <p className="legacy-statement legacy-enter" style={{ "--legacy-delay": ".28s" }} data-testid="legacy-statement">From Stevenage to seven world titles, Lewis Hamilton did more than redraw Formula 1’s limits. He expanded who could see themselves at the front of the grid—and what a champion could stand for beyond it.</p>
      </div>
      <div className="legacy-era-rail legacy-enter" style={{ "--legacy-delay": ".32s" }} data-testid="legacy-era-rail">
        <div className="is-mclaren" data-testid="legacy-era-mclaren"><span>2007</span><strong>THE ARRIVAL</strong><small>McLAREN</small></div>
        <div className="is-mercedes" data-testid="legacy-era-mercedes"><span>2013</span><strong>THE REINVENTION</strong><small>MERCEDES</small></div>
        <div className="is-ferrari" data-testid="legacy-era-ferrari"><span>2025</span><strong>THE NEW CHAPTER</strong><small>FERRARI</small></div>
      </div>
      <aside className="legacy-cultural legacy-enter" style={{ "--legacy-delay": ".36s" }} data-testid="legacy-cultural-impact"><span>BEYOND THE GRID</span><p>A standard measured in speed, courage and visibility. The record book is only the beginning.</p></aside>
      <div className="legacy-stat-rail" data-testid="legacy-stat-rail">
        {legacyStats.map((stat, index) => <article key={stat.label} className={`legacy-stat legacy-enter ${stat.featured ? "is-featured" : ""}`} style={{ "--legacy-delay": `${.38 + index * .06}s` }} data-testid={`${stat.testId}-stat`}>
          <strong data-testid={stat.testId}>{stat.value}</strong><span>{stat.label}</span><small>{stat.note}</small>
        </article>)}
      </div>
    </section>

    <SeasonTimeline seasons={archive?.seasons} />

    <section id="cars" className="cars-section" data-testid="cars-section">
      <Reveal><SectionHead index="03" label="Cars" title="MACHINES OF DOMINANCE." light /></Reveal>
      <div className="car-stage">
        <motion.img key={eras[era].image} initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .65 }} src={eras[era].image} alt={eras[era].team} data-testid="featured-car-image" />
        <div className="car-overlay" />
        <motion.div key={eras[era].year} className="car-info" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
          <span className="car-year" data-testid="featured-car-year">{eras[era].year}</span><h3 data-testid="featured-car-title">{eras[era].title}</h3><p className="mono" data-testid="featured-car-model">{eras[era].team} / {eras[era].wins}</p><p data-testid="featured-car-description">{eras[era].copy}</p>
        </motion.div>
        <div className="car-controls"><button onClick={() => setEra((era - 1 + eras.length) % eras.length)} data-testid="previous-car-button" aria-label="Previous car"><ChevronLeft /></button><span data-testid="car-slide-counter">0{era + 1} / 0{eras.length}</span><button onClick={() => setEra((era + 1) % eras.length)} data-testid="next-car-button" aria-label="Next car"><ChevronRight /></button></div>
      </div>
      <div className="era-strip">{eras.map((item, index) => <button className={index === era ? "active" : ""} onClick={() => setEra(index)} key={item.year} data-testid={`car-era-${item.year}-button`}><span>{item.year}</span>{item.team}</button>)}</div>
    </section>

    <VisualGallery />

    <section id="tracks" className="tracks-section" data-testid="tracks-section">
      <Reveal><SectionHead index="04" label="Tracks" title="WHERE GREATNESS REPEATED ITSELF." /></Reveal>
      <div className="track-grid">
        {(tracks.length ? tracks : [{circuit:"Silverstone Circuit", country:"UK", wins:9, podiums:15},{circuit:"Hungaroring",country:"Hungary",wins:8,podiums:12},{circuit:"Circuit Gilles Villeneuve",country:"Canada",wins:7,podiums:10},{circuit:"Circuit de Barcelona-Catalunya",country:"Spain",wins:6,podiums:12},{circuit:"Shanghai International Circuit",country:"China",wins:6,podiums:9}]).map((track, index) => <Reveal key={track.circuit} className={`track-card track-${index + 1}`}>
          <div className="track-top"><span>0{index + 1}</span><span>{track.country}</span></div>
          <svg viewBox="0 0 100 82" data-testid={`track-${index + 1}-shape`}><path d={trackShapes[track.circuit] || trackShapes["Silverstone Circuit"]} /></svg>
          <h3 data-testid={`track-${index + 1}-name`}>{track.circuit.replace(" Circuit", "")}</h3>
          <div className="track-numbers"><div><strong data-testid={`track-${index + 1}-wins`}>{track.wins}</strong><span>WINS</span></div><div><strong data-testid={`track-${index + 1}-podiums`}>{track.podiums}</strong><span>PODIUMS</span></div></div>
        </Reveal>)}
      </div>
    </section>

    <section className="moment-section" data-testid="silverstone-moment-section">
      <Marquee className="moment-marquee" speed={55} autoFill><span>HOME. HISTORY. HAMILTON.&nbsp;</span></Marquee>
      <img src={IMAGES.silverstone} alt="Lewis Hamilton at Silverstone" data-testid="silverstone-moment-image" />
      <div className="moment-copy"><p className="eyebrow">SILVERSTONE / 2024</p><h2>“GET IN THERE, LEWIS.”</h2><p data-testid="silverstone-moment-description">Nine wins at one circuit. A record no Formula 1 driver had ever held before.</p></div>
    </section>

    <section className="quote-section" data-testid="quote-section">
      <div className="quote-number" aria-hidden="true">44</div>
      <div className="quote-inner"><p className="eyebrow">IN THEIR WORDS</p><motion.blockquote key={quote} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} data-testid="featured-quote">“{quotes[quote].quote}”</motion.blockquote><div className="quote-credit"><div><strong data-testid="quote-person">{quotes[quote].person}</strong><span data-testid="quote-role">{quotes[quote].role}</span></div><div className="quote-controls"><button onClick={() => setQuote((quote - 1 + quotes.length) % quotes.length)} data-testid="previous-quote-button" aria-label="Previous quote"><ChevronLeft /></button><button onClick={() => setQuote((quote + 1) % quotes.length)} data-testid="next-quote-button" aria-label="Next quote"><ChevronRight /></button></div></div></div>
    </section>

    <section id="victories" className="archive-section" data-testid="victory-archive-section">
      <Reveal><SectionHead index="05" label="Victories" title="EVERY WIN. EVERY CITY. EVERY YEAR." light /></Reveal>
      <div className="archive-toolbar"><div className="year-filter" data-testid="victory-year-filter">{years.map((item) => <button className={year === item ? "active" : ""} onClick={() => setYear(item)} key={item} data-testid={`filter-year-${String(item).toLowerCase()}-button`}>{item}</button>)}</div><span data-testid="filtered-victory-count">{filtered.length || (year === "All" ? 105 : 0)} VICTORIES</span></div>
      <div className="victory-list" data-testid="victory-list">
        {!!wins.length && <div className="victory-table-head" data-testid="victory-table-header"><span>NO.</span><span>DATE</span><span>GRAND PRIX / CIRCUIT</span><span>TEAM</span><span>GRID</span><span>LAPS</span><span>PTS</span><span>FLAGS</span></div>}
        {filtered.slice(0, showAll ? filtered.length : 12).map((win, index) => <motion.article initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} key={`${win.date}-${win.race}`} className="victory-row victory-row-expanded" data-testid={`victory-row-${index + 1}`}><span className="win-number">#{String(win.number).padStart(3, "0")}</span><span className="victory-date"><strong>{win.year}</strong>{win.date?.slice(5)}</span><span className="victory-race"><h3>{win.race}</h3><small>{win.circuit}, {win.country}</small></span><span className="victory-team">{win.constructor}</span><strong>{win.grid}</strong><strong>{win.laps}</strong><strong>{win.points}</strong><span className="victory-flags">{win.from_pole && <em>POLE</em>}{win.fastest_lap && <em>FL</em>}<Flag size={16}/></span></motion.article>)}
        {!wins.length && <div className="archive-loading" data-testid="archive-loading-state"><Trophy /><p>Loading 105 race-winning chapters…</p></div>}
      </div>
      {filtered.length > 12 && <button className="archive-expand" onClick={() => setShowAll(!showAll)} data-testid="toggle-full-archive-button">{showAll ? "COLLAPSE ARCHIVE" : `OPEN ALL ${filtered.length} VICTORIES`}<ArrowUpRight /></button>}
    </section>

    <footer data-testid="site-footer"><div className="footer-title"><span>STILL</span><span>WE RISE</span></div><div className="footer-bottom"><p data-testid="fan-site-disclaimer">An independent, fan-made celebration of Sir Lewis Hamilton. Not affiliated with Lewis Hamilton, Formula 1, Mercedes-AMG Petronas, McLaren, or Ferrari.</p><button onClick={() => window.__spatialGo?.("top")} data-testid="back-to-top-button">BACK TO TOP <ArrowUpRight /></button></div></footer>
  </>;
};