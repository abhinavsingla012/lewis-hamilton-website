import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowDownRight, ChevronLeft, ChevronRight, Crosshair } from "lucide-react";

const Counter = ({ value, testId }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => { let frame; const start = performance.now(); const tick = (time) => { const p = Math.min(1, (time - start) / 1200); setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3)))); if (p < 1) frame = requestAnimationFrame(tick); }; frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame); }, [value]);
  return <strong data-testid={testId}>{display}</strong>;
};

const HOTSPOT_CONTENT = {
  head: { tag: "01 / THE MENTALITY", title: "STILL I RISE", copy: "It isn't a slogan — it's an operating system. Attack first, turn pressure into pole laps and chaos into masterclasses." },
  shoulders: { tag: "02 / THE RECORDS", title: "SEVEN CROWNS", copy: "Shoulders that carry history — 7 world championships and more career points than any driver who has ever raced." },
  heart: { tag: "03 / THE LOVES", title: "HIS PEOPLE", copy: "Dad Anthony worked four jobs to fund the karting. Mum Carmen kept him grounded. And Roscoe — the paddock's most famous bulldog." },
  hand: { tag: "04 / THE SILVERWARE", title: "105 TROPHIES", copy: "Hands that have lifted more winner's trophies than anyone in Formula 1 history — across 200+ podium visits." },
  helmet: { tag: "05 / THE ARMOURY", title: "MANY LIDS", copy: "A collector of identities — childhood yellow, championship purple, Senna tributes. Every helmet tells a chapter of the journey." },
  shoes: { tag: "06 / THE FOOTWORK", title: "104 POLES", copy: "Footwork tuned to dance on 5G brake zones — 104 pole positions, the greatest single-lap qualifier the sport has seen." },
};

const LAYOUTS = {
  ferrari: {
    img: "/images/lewis-ferrari.png",
    ratio: "536 / 1139",
    spots: [
      { id: "head", top: "3%", left: "37%", side: "left", line: [[0, 0], [-52, -26], [-150, -26]] },
      { id: "shoulders", top: "17%", left: "63%", side: "right", line: [[0, 0], [52, -14], [150, -14]] },
      { id: "heart", top: "27%", left: "40%", side: "left", line: [[0, 0], [-60, 10], [-165, 10]] },
      { id: "hand", top: "49%", left: "76%", side: "right", line: [[0, 0], [46, -18], [140, -18]] },
      { id: "helmet", top: "62%", left: "80%", side: "right", line: [[0, 0], [42, 20], [132, 20]] },
      { id: "shoes", top: "90%", left: "40%", side: "left", line: [[0, 0], [-50, 14], [-145, 14]] },
    ],
  },
  mclaren: {
    img: "/images/lewis-mclaren.png",
    ratio: "751 / 1222",
    spots: [
      { id: "head", top: "5%", left: "41%", side: "right", line: [[0, 0], [50, -30], [150, -30]] },
      { id: "shoulders", top: "19%", left: "63%", side: "right", line: [[0, 0], [48, -8], [145, -8]] },
      { id: "heart", top: "28%", left: "42%", side: "right", line: [[0, 0], [58, 16], [158, 16]] },
      { id: "hand", top: "37%", left: "27%", side: "left", line: [[0, 0], [-46, -34], [-138, -34]] },
      { id: "helmet", top: "44%", left: "15%", side: "left", line: [[0, 0], [-40, 16], [-125, 16]] },
      { id: "shoes", top: "92%", left: "42%", side: "left", line: [[0, 0], [-50, 12], [-145, 12]] },
    ],
  },
  mercedes: {
    img: "/images/lewis-mercedes.png",
    ratio: "538 / 1186",
    spots: [
      { id: "head", top: "3.5%", left: "38%", side: "left", line: [[0, 0], [-52, -26], [-150, -26]] },
      { id: "shoulders", top: "17%", left: "65%", side: "right", line: [[0, 0], [50, -14], [148, -14]] },
      { id: "heart", top: "27%", left: "44%", side: "left", line: [[0, 0], [-60, 10], [-165, 10]] },
      { id: "hand", top: "51%", left: "73%", side: "right", line: [[0, 0], [46, -18], [140, -18]] },
      { id: "helmet", top: "63%", left: "79%", side: "right", line: [[0, 0], [42, 20], [132, 20]] },
      { id: "shoes", top: "90%", left: "42%", side: "left", line: [[0, 0], [-50, 14], [-145, 14]] },
    ],
  },
};

export const HeroStage = ({ stats, teamTheme = "ferrari", setTeamTheme }) => {
  const layout = LAYOUTS[teamTheme] || LAYOUTS.ferrari;
  const [activeSpot, setActiveSpot] = useState(null);
  const touchRef = useRef(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 90, damping: 20 });
  const smoothY = useSpring(pointerY, { stiffness: 90, damping: 20 });
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-5, 5]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [2.5, -2.5]);
  const ghostX = useTransform(smoothX, [-0.5, 0.5], [22, -22]);
  const shadowX = useTransform(smoothX, [-0.5, 0.5], [-16, 16]);

  const trackPointer = (event) => {
    pointerX.set(event.clientX / window.innerWidth - 0.5);
    pointerY.set(event.clientY / window.innerHeight - 0.5);
  };

  const THEME_ORDER = ["ferrari", "mercedes", "mclaren"];
  const switchTeam = (dir) => {
    if (!setTeamTheme) return;
    const index = THEME_ORDER.indexOf(teamTheme);
    setTeamTheme(THEME_ORDER[(index + dir + THEME_ORDER.length) % THEME_ORDER.length]);
    setActiveSpot(null);
  };
  const onTouchStart = (event) => {
    const touch = event.touches[0];
    touchRef.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  };
  const onTouchEnd = (event) => {
    const start = touchRef.current;
    touchRef.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.4) switchTeam(dx < 0 ? 1 : -1);
  };

  return <section id="top" className="hero-white spatial-hero-stage" onPointerMove={trackPointer} onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} data-testid="hero-section">
    <div className="hw-tint" aria-hidden="true" />
    <div className="hw-grain" aria-hidden="true" />
    <motion.div className="hw-ghost-name" style={{ x: ghostX }} aria-hidden="true"><span>HAMILTON</span></motion.div>

    <div className="hw-title" data-testid="hero-title">
      <motion.small initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>THE DEFINITIVE FAN ARCHIVE / 2007—2025</motion.small>
      <motion.span initial={{ x: -70, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}>STILL</motion.span>
      <motion.span initial={{ x: -70, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}><i>WE</i> RISE</motion.span>
    </div>

    <div className="hw-side-meta" aria-hidden="true"><span>LH44</span><i /><span>GBR / STEVENAGE</span><i /><span>51.5072° N</span></div>

    <div className="hw-figure-zone">
      <motion.div key={teamTheme} className="hw-figure" style={{ rotateX, rotateY, aspectRatio: layout.ratio }} initial={{ opacity: 0, y: 90, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1.15, delay: 0.25, ease: [0.22, 1, 0.36, 1] }} data-testid="hero-lewis-cutout">
        <motion.span className="hw-floor-shadow" style={{ x: shadowX }} aria-hidden="true" />
        <span className="hw-contact-shadow" aria-hidden="true" />
        <img src={layout.img} alt="Lewis Hamilton in race suit holding his helmet" className="hw-lewis" data-testid="hero-image" draggable="false" />
        {layout.spots.map((spot, index) => {
          const content = HOTSPOT_CONTENT[spot.id];
          const [, elbow, end] = spot.line;
          return <motion.div
            key={spot.id}
            className={`hw-spot side-${spot.side} ${activeSpot === spot.id ? "is-active" : ""}`}
            style={{ top: spot.top, left: spot.left }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 + index * 0.16, duration: 0.55 }}
          >
            <button type="button" className="hw-spot-dot" onClick={() => setActiveSpot((current) => (current === spot.id ? null : spot.id))} aria-label={`${content.title} — details`} aria-expanded={activeSpot === spot.id} data-testid={`hero-hotspot-${spot.id}`}><i /></button>
            <svg className="hw-spot-svg" aria-hidden="true">
              <polyline points={spot.line.map(([x, y]) => `${x},${y}`).join(" ")} pathLength="1" style={{ animationDelay: `${1.2 + index * 0.16}s` }} />
              <circle cx={elbow[0]} cy={elbow[1]} r="1.6" />
            </svg>
            <div className="hw-spot-card" style={{ "--card-x": `${end[0]}px`, "--card-y": `${end[1]}px` }} data-testid={`hero-hotspot-card-${spot.id}`}>
              <span>{content.tag}</span>
              <strong>{content.title}</strong>
              <p>{content.copy}</p>
            </div>
          </motion.div>;
        })}
      </motion.div>
    </div>

    <motion.div className="hw-stats" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.75 } } }} data-testid="hero-statistics">
      {[[stats?.wins ?? 105, "GRAND PRIX WINS", "hero-wins-stat"], [stats?.titles ?? 7, "WORLD TITLES", "hero-titles-stat"], [stats?.poles ?? 104, "POLE POSITIONS", "hero-poles-stat"]].map(([value, label, testId], index) => <motion.div key={label} variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}><span>0{index + 1}</span><Counter value={value} testId={testId} /><small>{label}</small></motion.div>)}
    </motion.div>

    <motion.button className="hw-cta" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.6 }} whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }} onClick={() => window.__spatialGo?.("circuit")} data-testid="explore-legacy-button"><span><ArrowDownRight /></span><div><small>ENTER THE SPATIAL ARCHIVE</small><strong>EXPLORE THE LEGACY</strong></div></motion.button>

    <div className="hw-swipe-hint" aria-hidden="true" data-testid="hero-swipe-hint"><ChevronLeft size={11} /><span>SWIPE TO SWITCH TEAM</span><ChevronRight size={11} /></div>

    <div className="hw-telemetry" data-testid="hero-telemetry"><span>HAM / GBR</span><span>HOVER THE POINTS — READ THE DRIVER</span><span><Crosshair size={11} /> PRECISION / PURPOSE / PACE</span></div>
  </section>;
};
