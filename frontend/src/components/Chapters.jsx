import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Marquee from "react-fast-marquee";
import { ArrowUpRight, ChevronLeft, ChevronRight, Crown, Flag, Trophy } from "lucide-react";
import { IMAGES, quotes, trackShapes } from "../data/content";
import { CAREER_SEASONS, CAREER_TOTALS } from "../data/careerRaces";
import { SeasonTimeline } from "./SeasonTimeline";
import { VisualGallery } from "./VisualGallery";
import { CareerCars } from "./CareerCars";
import { RecordsMonument } from "./RecordsMonument";

const Reveal = ({ children, className = "" }) => <motion.div className={className} initial={{ opacity: 0, y: 42 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
const SectionHead = ({ label, title, light = false }) => <div className={`section-head ${light ? "light" : ""}`}><span className="section-head-marker-slot" aria-hidden="true" /><h2 data-testid={`${label.toLowerCase()}-section-title`}>{title}</h2></div>;

const milestones = [
  { number: "001", year: "2007", race: "CANADA", label: "THE FIRST", note: "Victory in only his sixth Formula 1 start." },
  { number: "009", year: "2008", race: "CHAMPION", label: "BY ONE POINT", note: "The title secured at the final corner in Brazil." },
  { number: "092", year: "2020", race: "PORTUGAL", label: "RECORD BROKEN", note: "Past Schumacher. Alone at the top of the wins list." },
  { number: "100", year: "2021", race: "RUSSIA", label: "THE CENTURY", note: "The first driver in Formula 1 history to reach 100 wins." },
  { number: "104", year: "2024", race: "BRITAIN", label: "HOME AGAIN", note: "945 days of waiting ended at Silverstone." },
  { number: "105", year: "2024", race: "BELGIUM", label: "THE LATEST", note: "A fifth victory through Spa-Francorchamps." },
];

const fallbackTracks = [
  { circuit: "Silverstone Circuit", country: "UK", wins: 9, podiums: 15 },
  { circuit: "Hungaroring", country: "Hungary", wins: 8, podiums: 12 },
  { circuit: "Circuit Gilles Villeneuve", country: "Canada", wins: 7, podiums: 10 },
  { circuit: "Circuit de Barcelona-Catalunya", country: "Spain", wins: 6, podiums: 12 },
  { circuit: "Shanghai International Circuit", country: "China", wins: 6, podiums: 9 },
];

const ERA_LABEL = { mclaren: "McLAREN", mercedes: "MERCEDES", ferrari: "FERRARI" };

const LegacyChapter = () => {
  const [hovered, setHovered] = useState(null);
  return <section id="legacy" className="legacy-section legacy-monument cathedral" aria-labelledby="legacy-cathedral-title" data-testid="legacy-section">
    <div className="cath-scan" aria-hidden="true" />
    <div className="cath-ghost" aria-hidden="true">44</div>
    <header className="cath-head legacy-enter" style={{ "--legacy-delay": ".06s" }}>
      <p className="cath-kicker">ONE LIGHT PER GRAND PRIX — 2007→2025</p>
      <h2 id="legacy-cathedral-title" data-testid="legacy-section-title">EVERY RACE<br /><span>HE EVER STARTED.</span></h2>
      <p className="cath-sub" data-testid="legacy-statement">Each light is one grand prix. <b>The gold ones he won.</b> Nineteen seasons, three teams, one heartbeat — run your cursor across a career.</p>
    </header>
    <div className="cath-stats legacy-enter" style={{ "--legacy-delay": ".16s" }} data-testid="cathedral-stats">
      <div data-testid="cathedral-starts"><strong>{CAREER_TOTALS.starts}</strong><span>LIGHTS / STARTS</span></div>
      <div className="is-gold" data-testid="cathedral-wins"><strong>{CAREER_TOTALS.wins}</strong><span>BURN GOLD / WINS</span></div>
      <div data-testid="cathedral-podiums"><strong>{CAREER_TOTALS.podiums}</strong><span>ROSE HIGH / PODIUMS</span></div>
      <div data-testid="cathedral-titles"><strong>{CAREER_TOTALS.titles}</strong><span>CROWNED SEASONS</span></div>
    </div>
    <div className="cath-field legacy-enter" style={{ "--legacy-delay": ".2s" }} data-testid="cathedral-field" onMouseLeave={() => setHovered(null)}>
      <div className="cath-sweep" aria-hidden="true" />
      {CAREER_SEASONS.map((season) => <div key={season.year} className={`cath-season ${season.title ? "is-title" : ""}`} style={{ "--flex": season.races }} data-testid={`cathedral-season-${season.year}`}>
        <div className="cath-bars">
          {season.racesData.map((race) => <div
            key={race.round}
            className={`cath-bar era-${race.team} ${race.win ? "is-win" : ""} ${race.podium && !race.win ? "is-podium" : ""} ${race.pos === 0 ? "is-dnf" : ""}`}
            style={{ "--h": `${race.pos === 0 ? 7 : Math.max(12, 97 - (race.pos - 1) * 5.4)}%`, "--d": `${race.index * 2.6}ms` }}
            onMouseEnter={(event) => setHovered({ race, x: event.clientX })}
            data-testid={race.index === 1 ? "cathedral-first-bar" : undefined}
          />)}
        </div>
        <span className="cath-year">’{String(season.year).slice(2)}</span>
        {season.title && <i className="cath-crown" title={`${season.year} World Champion`}><Crown /></i>}
      </div>)}
    </div>
    {hovered && <div className="cath-tip" style={{ left: hovered.x }} data-testid="cathedral-tooltip">
      <strong>{hovered.race.year} — ROUND {hovered.race.round}</strong>
      <span className={hovered.race.win ? "" : "is-plain"}>{hovered.race.pos === 0 ? "DNF — RETIRED" : hovered.race.win ? "P1 — VICTORY" : `P${hovered.race.pos}${hovered.race.podium ? " — PODIUM" : ""}`}</span>
      <em>{ERA_LABEL[hovered.race.team]}{CAREER_SEASONS.find((s) => s.year === hovered.race.year)?.title ? " — CHAMPIONSHIP SEASON" : ""}</em>
    </div>}
    <div className="cath-legend legacy-enter" style={{ "--legacy-delay": ".3s" }} data-testid="cathedral-legend">
      <span><i className="lg-gold" />VICTORY</span>
      <span><i className="lg-mcl" />McLAREN 07—12</span>
      <span><i className="lg-mer" />MERCEDES 13—24</span>
      <span><i className="lg-fer" />FERRARI 25</span>
      <span><i className="lg-dnf" />DNF</span>
      <span><b><Crown /></b>TITLE SEASON</span>
    </div>
  </section>;
};

const MilestonesChapter = () => <section className="milestones-section" data-chapter-scroll="true" data-testid="milestone-victories-section">
  <div className="milestones-title">
    <span className="milestones-kicker">THE TURNING POINTS</span>
    <h2>SIX MOMENTS<br />THAT MOVED<br /><i>the limit.</i></h2>
    <p className="milestones-note">From a rookie winning in Montreal to a homecoming that ended 945 days of waiting — the six races that redrew what was possible.</p>
    <div className="milestones-meta"><div><strong>2007</strong><span>FIRST WIN</span></div><div><strong>2020</strong><span>RECORD BROKEN</span></div><div><strong>2024</strong><span>HOME AGAIN</span></div></div>
  </div>
  <div className="milestone-grid">{milestones.map((item, index) => <article key={item.number} data-testid={`milestone-card-${index + 1}`}><span className="milestone-number">#{item.number}</span><div><span>{item.year} / {item.race}</span><h3>{item.label}</h3><p>{item.note}</p></div></article>)}</div>
</section>;

const TracksChapter = ({ archive }) => {
  const tracks = archive?.tracks?.slice(0, 5) || [];
  const dominance = (tracks.length ? tracks : fallbackTracks).reduce((total, track) => total + (track.wins || 0), 0);
  return <section id="tracks" className="tracks-section tracks-world" data-testid="tracks-section">
    <span className="tracks-ghost" aria-hidden="true">31</span>
    <div className="tracks-intro">
      <SectionHead index="07" label="TRACKS" title="WHERE GREATNESS REPEATED ITSELF." />
      <p className="tracks-note" data-testid="tracks-narrative">Thirty-one circuits have watched Lewis Hamilton win. These five learned his name by heart — the corners he mastered, the crowds he owned, the records he left behind.</p>
      <div className="tracks-summary" data-testid="tracks-summary">
        <div><strong>31</strong><span>WINNING CIRCUITS</span></div>
        <div><strong>{dominance}</strong><span>WINS AT THE TOP FIVE</span></div>
        <div><strong>9</strong><span>SILVERSTONE RECORD</span></div>
      </div>
      <p className="tracks-rail" aria-hidden="true">MONTREAL · BUDAPEST · SPA · MONZA · SHANGHAI · AUSTIN · SÃO PAULO · SAKHIR · SUZUKA</p>
    </div>
    <div className="track-grid">
      {(tracks.length ? tracks : fallbackTracks).map((track, index) => <div key={track.circuit} className={`track-card track-${index + 1}`}>
        <div className="track-top"><span>0{index + 1}</span><span>{track.country}</span></div>
        <svg viewBox="0 0 100 82" data-testid={`track-${index + 1}-shape`}><path d={trackShapes[track.circuit] || trackShapes["Silverstone Circuit"]} /></svg>
        <h3 data-testid={`track-${index + 1}-name`}>{track.circuit.replace(" Circuit", "")}</h3>
        <div className="track-numbers"><div><strong data-testid={`track-${index + 1}-wins`}>{track.wins}</strong><span>WINS</span></div><div><strong data-testid={`track-${index + 1}-podiums`}>{track.podiums}</strong><span>PODIUMS</span></div></div>
      </div>)}
    </div>
  </section>;
};

const SILVERSTONE_WINS = [
  { year: "2008", note: "IN THE RAIN" }, { year: "2014", note: "SILVER ERA BEGINS" }, { year: "2015", note: "BACK TO BACK" },
  { year: "2016", note: "THE HAT-TRICK" }, { year: "2017", note: "RECORD EQUALLED" }, { year: "2019", note: "CROWD-SURF DAY" },
  { year: "2020", note: "THREE-WHEEL WIN" }, { year: "2021", note: "THE COMEBACK" }, { year: "2024", note: "945 DAYS ENDED" },
];

const MomentChapter = () => <section className="moment-section moment-world" data-testid="silverstone-moment-section">
  <Marquee className="moment-marquee" speed={55} autoFill><span>HOME. HISTORY. HAMILTON.&nbsp;</span></Marquee>
  <img src={IMAGES.silverstone} alt="Lewis Hamilton at Silverstone" data-testid="silverstone-moment-image" />
  <div className="moment-shade" aria-hidden="true" />
  <span className="moment-side-label" aria-hidden="true">SILVERSTONE / 52.0733° N — THE HOME FORTRESS</span>
  <div className="moment-copy">
    <span className="moment-kicker">CH. 08 / THE HOME FORTRESS</span>
    <h2>“GET IN THERE, LEWIS.”</h2>
    <p data-testid="silverstone-moment-description">Nine wins at one circuit. A record no Formula 1 driver had ever held before.</p>
    <div className="moment-stats" data-testid="moment-stats">
      <div><strong>9</strong><span>HOME WINS</span></div>
      <div><strong>7</strong><span>HOME POLES</span></div>
      <div><strong>15</strong><span>HOME PODIUMS</span></div>
      <div><strong>480K</strong><span>FANS / WEEKEND</span></div>
    </div>
  </div>
  <aside className="moment-years" data-testid="moment-years-rail">
    <span className="moment-years-head">NINE WINS AT HOME</span>
    {SILVERSTONE_WINS.map((win, index) => <div key={win.year} className="moment-year" style={{ "--my-delay": `${index * 0.06}s` }} data-testid={`moment-year-${win.year}`}>
      <span>{String(index + 1).padStart(2, "0")}</span><strong>{win.year}</strong><small>{win.note}</small>
    </div>)}
  </aside>
</section>;

const QuotesChapter = () => {
  const [quote, setQuote] = useState(0);
  return <section className="quote-section quotes-world" data-testid="quote-section">
    <div className="quote-number" aria-hidden="true">44</div>
    <div className="quotes-aside">
      <span className="quotes-kicker">CH. 09 / THE VOICES</span>
      <h3 className="quotes-heading">WHAT THE PADDOCK<br />SAYS ABOUT HIM.</h3>
      <ul className="quotes-list" data-testid="quotes-speaker-list">
        {quotes.map((item, index) => <li key={item.person}>
          <button type="button" className={index === quote ? "is-active" : ""} onClick={() => setQuote(index)} aria-pressed={index === quote} data-testid={`quote-speaker-${index + 1}`}>
            <span>{String(index + 1).padStart(2, "0")}</span><strong>{item.person}</strong><small>{item.role}</small>
          </button>
        </li>)}
      </ul>
      <span className="quotes-counter" data-testid="quote-counter">{String(quote + 1).padStart(2, "0")} / {String(quotes.length).padStart(2, "0")}</span>
    </div>
    <div className="quote-inner">
      <motion.blockquote key={quote} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} data-testid="featured-quote">“{quotes[quote].quote}”</motion.blockquote>
      <div className="quote-credit">
        <div><strong data-testid="quote-person">{quotes[quote].person}</strong><span data-testid="quote-role">{quotes[quote].role}</span></div>
        <div className="quote-controls"><button onClick={() => setQuote((quote - 1 + quotes.length) % quotes.length)} data-testid="previous-quote-button" aria-label="Previous quote"><ChevronLeft /></button><button onClick={() => setQuote((quote + 1) % quotes.length)} data-testid="next-quote-button" aria-label="Next quote"><ChevronRight /></button></div>
      </div>
    </div>
      <figure className="quotes-media" data-testid="quotes-media">
        <img src={IMAGES.podium} alt="Lewis Hamilton acknowledging the crowd" loading="lazy" />
        <figcaption><span>THE PADDOCK VIEW</span><strong>RESPECT EARNED ON TRACK</strong></figcaption>
      </figure>
  </section>;
};

const VictoriesChapter = ({ archive }) => {
  const [year, setYear] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const wins = useMemo(() => archive?.victories || [], [archive?.victories]);
  const years = useMemo(() => ["All", ...Array.from(new Set(wins.map((win) => win.year))).sort((a, b) => b - a)], [wins]);
  const filtered = year === "All" ? wins : wins.filter((win) => win.year === Number(year));
  return <section id="victories" className="archive-section" data-chapter-scroll="true" data-testid="victory-archive-section">
    <Reveal><SectionHead index="10" label="VICTORIES" title="EVERY WIN. EVERY CITY. EVERY YEAR." light /></Reveal>
    <div className="archive-toolbar"><div className="year-filter" data-testid="victory-year-filter">{years.map((item) => <button className={year === item ? "active" : ""} onClick={() => setYear(item)} key={item} data-testid={`filter-year-${String(item).toLowerCase()}-button`}>{item}</button>)}</div><span data-testid="filtered-victory-count">{filtered.length || (year === "All" ? 105 : 0)} VICTORIES</span></div>
    <div className="victory-list" data-testid="victory-list">
      {!!wins.length && <div className="victory-table-head" data-testid="victory-table-header"><span>NO.</span><span>DATE</span><span>GRAND PRIX / CIRCUIT</span><span>TEAM</span><span>GRID</span><span>LAPS</span><span>PTS</span><span>FLAGS</span></div>}
      {filtered.slice(0, showAll ? filtered.length : 12).map((win, index) => <article key={`${win.date}-${win.race}`} className="victory-row victory-row-expanded" data-testid={`victory-row-${index + 1}`}><span className="win-number">#{String(win.number).padStart(3, "0")}</span><span className="victory-date"><strong>{win.year}</strong>{win.date?.slice(5)}</span><span className="victory-race"><h3>{win.race}</h3><small>{win.circuit}, {win.country}</small></span><span className="victory-team">{win.constructor}</span><strong>{win.grid}</strong><strong>{win.laps}</strong><strong>{win.points}</strong><span className="victory-flags">{win.from_pole && <em>POLE</em>}{win.fastest_lap && <em>FL</em>}<Flag size={16} /></span></article>)}
      {!wins.length && <div className="archive-loading" data-testid="archive-loading-state"><Trophy /><p>Loading 105 race-winning chapters…</p></div>}
    </div>
    {filtered.length > 12 && <button className="archive-expand" onClick={() => setShowAll(!showAll)} data-testid="toggle-full-archive-button">{showAll ? "COLLAPSE ARCHIVE" : `OPEN ALL ${filtered.length} VICTORIES`}<ArrowUpRight /></button>}
  </section>;
};

const FooterChapter = () => <footer className="footer-world" data-testid="site-footer">
  <span className="footer-kicker">CH. 11 / THE CLOSING STATEMENT</span>
  <div className="footer-title"><span>STILL</span><span>WE RISE</span></div>
  <p className="footer-statement">Nineteen seasons. Three teams. One standard. The archive closes here, but the story keeps moving forward.</p>
  <div className="footer-legend" data-testid="footer-legend">
    <div><strong>7</strong><span>WORLD TITLES</span></div>
    <div><strong>105</strong><span>GRAND PRIX WINS</span></div>
    <div><strong>202</strong><span>PODIUMS</span></div>
    <div><strong>104</strong><span>POLE POSITIONS</span></div>
  </div>
  <nav className="footer-links" aria-label="Jump to a chapter">
    {[["legacy", "LEGACY"], ["timeline", "TIMELINE"], ["cars", "CARS"], ["gallery", "GALLERY"], ["records", "RECORDS"], ["victories", "VICTORIES"]].map(([key, label]) => <button key={key} type="button" onClick={() => window.__spatialGo?.(key)} data-testid={`footer-link-${key}`}>{label}</button>)}
  </nav>
  <div className="footer-bottom"><p data-testid="fan-site-disclaimer">An independent, fan-made celebration of Sir Lewis Hamilton. Not affiliated with Lewis Hamilton, Formula 1, Mercedes-AMG Petronas, McLaren, or Ferrari.</p><button onClick={() => window.__spatialGo?.("top")} data-testid="back-to-top-button">BACK TO TOP <ArrowUpRight /></button></div>
</footer>;

export const ChapterView = ({ chapterKey, archive, isActive, direction }) => {
  switch (chapterKey) {
    case "legacy": return <LegacyChapter archive={archive} />;
    case "timeline": return <SeasonTimeline seasons={archive?.seasons} isActive={isActive} />;
    case "cars": return <CareerCars seasons={archive?.seasons} isActive={isActive} />;
    case "gallery": return <VisualGallery isActive={isActive} direction={direction} />;
    case "records": return <RecordsMonument isActive={isActive} />;
    case "milestones": return <MilestonesChapter />;
    case "tracks": return <TracksChapter archive={archive} />;
    case "moment": return <MomentChapter />;
    case "quotes": return <QuotesChapter />;
    case "victories": return <VictoriesChapter archive={archive} />;
    case "footer": return <FooterChapter />;
    default: return null;
  }
};
