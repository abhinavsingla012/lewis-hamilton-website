import { useEffect, useRef, useState } from "react";
import { EraEnvironment } from "./EraEnvironment";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowDownRight, ChevronLeft, ChevronRight, Crosshair } from "lucide-react";
import { SILVERSTONE_PATH } from "../data/circuitRoute";

const Counter = ({ value, testId, active = true }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => { if (!active) { setDisplay(0); return undefined; } let frame; const start = performance.now(); const from = 0; const tick = (time) => { const p = Math.min(1, (time - start) / 1200); setDisplay(Math.round(from + (value - from) * (1 - Math.pow(1 - p, 3)))); if (p < 1) frame = requestAnimationFrame(tick); }; frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame); }, [value, active]);
  return <strong data-testid={testId}>{display}</strong>;
};

/* Same left-to-right order as the team switcher, so arrows, swipes and the wipe all agree on direction. */
const THEME_ORDER = ["mclaren", "mercedes", "ferrari"];

const ERA_STATS = {
  mclaren: { wins: 21, titles: 1, poles: 26, tag: "MCLAREN ERA · 2007—2012" },
  mercedes: { wins: 84, titles: 6, poles: 78, tag: "MERCEDES ERA · 2013—2024" },
  ferrari: { wins: 105, titles: 7, poles: 104, tag: "CAREER TOTAL · 2007—2025" },
};

const ERA_CONTENT = {
  mclaren: {
    head: { tag: "01 / THE MENTALITY", title: "FEARLESS ROOKIE", copy: "Three podiums in his first three races. The 22-year-old who out-qualified a double world champion teammate from day one." },
    shoulders: { tag: "02 / THE RECORDS", title: "YOUNGEST CHAMPION", copy: "2008 — champion at 23, won at the very last corner in the Brazil rain. The title that stopped Britain's heart." },
    heart: { tag: "03 / THE LOVES", title: "DAD'S SACRIFICE", copy: "Anthony worked four jobs and knocked on every paddock door. This suit is the receipt for every one of those shifts." },
    hand: { tag: "04 / THE SILVERWARE", title: "FIRST TROPHIES", copy: "21 wins in silver and rocket-red — the first at Montreal 2007, arms aloft before he could even believe it." },
    helmet: { tag: "05 / THE ARMOURY", title: "THE YELLOW LID", copy: "The same bright yellow he wore in karts — chosen by his dad so he'd always be visible from the back of the grid." },
    shoes: { tag: "06 / THE FOOTWORK", title: "RAW SPEED", copy: "26 poles before turning 28. Silverstone 2008 in the rain — won by 68 seconds. Footwork you can't teach." },
  },
  mercedes: {
    head: { tag: "01 / THE MENTALITY", title: "THE GAMBLE", copy: "Everyone said leaving McLaren was madness. He saw the turbo era coming before anyone — the smartest move in modern F1." },
    shoulders: { tag: "02 / THE RECORDS", title: "THE DYNASTY", copy: "Six championships in eight years. 84 wins in silver and black — the most dominant partnership the sport has ever seen." },
    heart: { tag: "03 / THE LOVES", title: "STILL WE RISE", copy: "Taking the knee on every grid, Roscoe in the motorhome, and a fanbase that turned Abu Dhabi heartbreak into fuel." },
    hand: { tag: "04 / THE SILVERWARE", title: "RECORD BREAKER", copy: "Win 92 at Portimão passed Schumacher. These hands rewrote every number the sport thought was permanent." },
    helmet: { tag: "05 / THE ARMOURY", title: "PURPLE REIGN", copy: "Championship purple lids, Senna-yellow tributes, pride flags — every design a statement louder than an engine." },
    shoes: { tag: "06 / THE FOOTWORK", title: "THE STANDARD", copy: "78 poles in silver. Qualifying laps so pure that engineers replayed the telemetry just to watch them again." },
  },
  ferrari: {
    head: { tag: "01 / THE MENTALITY", title: "THE NEW CHAPTER", copy: "Every child who ever dreamed of F1 dreamed in red. At 40, he chose the boldest lap of his life — Maranello." },
    shoulders: { tag: "02 / THE RECORDS", title: "SEVEN CROWNS", copy: "Seven championships carried into the scarlet suit — still chasing the eighth that history owes him." },
    heart: { tag: "03 / THE LOVES", title: "HIS PEOPLE", copy: "Dad Anthony, mum Carmen, and the memory of Roscoe — the paddock's most famous bulldog — travel in every red suitcase." },
    hand: { tag: "04 / THE SILVERWARE", title: "105 TROPHIES", copy: "More winner's silver than anyone in Formula 1 history — and hands still hungry for the tifosi's first." },
    helmet: { tag: "05 / THE ARMOURY", title: "MANY LIDS", copy: "Childhood yellow, championship purple, Senna tributes — now reimagined in giallo modena for the Scuderia." },
    shoes: { tag: "06 / THE FOOTWORK", title: "104 POLES", copy: "The greatest single-lap qualifier the sport has seen, now dancing on Ferrari brakes at 5G." },
  },
};

const LAYOUTS = {
  ferrari: {
    img: "/images/lewis-ferrari.webp",
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
    img: "/images/lewis-mclaren.webp",
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
    img: "/images/lewis-mercedes.webp",
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

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 71 + 13) % 100}%`,
  size: 2 + (i % 3),
  delay: `${(i * 1.7) % 9}s`,
  duration: `${11 + (i % 5) * 3}s`,
}));

const themeIndex = (theme) => Math.max(0, THEME_ORDER.indexOf(theme));

/** `revealed` gates every entrance animation until the Lights-Out cold start hands over. */
export const HeroStage = ({ stats, teamTheme = "ferrari", setTeamTheme, revealed = true }) => {
  const layout = LAYOUTS[teamTheme] || LAYOUTS.ferrari;
  const content = ERA_CONTENT[teamTheme] || ERA_CONTENT.ferrari;
  const era = ERA_STATS[teamTheme] || ERA_STATS.ferrari;
  /* Hover previews a point; click pins it. A pinned point survives the pointer leaving. */
  const [hoverSpot, setHoverSpot] = useState(null);
  const [pinnedSpot, setPinnedSpot] = useState(null);
  const activeSpot = pinnedSpot ?? hoverSpot;
  const touchRef = useRef(null);
  const prevThemeRef = useRef(teamTheme);

  let dir = themeIndex(teamTheme) - themeIndex(prevThemeRef.current);
  if (dir === 2) dir = -1;
  if (dir === -2) dir = 1;
  if (dir === 0) dir = 1;
  useEffect(() => { prevThemeRef.current = teamTheme; }, [teamTheme]);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 90, damping: 20 });
  const smoothY = useSpring(pointerY, { stiffness: 90, damping: 20 });
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-5, 5]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [2.5, -2.5]);
  const ghostX = useTransform(smoothX, [-0.5, 0.5], [22, -22]);
  const shadowX = useTransform(smoothX, [-0.5, 0.5], [-16, 16]);
  /* The pointer is the key light: rim, sheen and cast shadow all derive from this vector. */
  const lightX = useTransform(smoothX, [-0.5, 0.5], [-1, 1]);
  const lightY = useTransform(smoothY, [-0.5, 0.5], [-1, 1]);
  const spotX = useTransform(smoothX, [-0.5, 0.5], [-9, 9]);
  const spotY = useTransform(smoothY, [-0.5, 0.5], [-6, 6]);

  const trackPointer = (event) => {
    pointerX.set(event.clientX / window.innerWidth - 0.5);
    pointerY.set(event.clientY / window.innerHeight - 0.5);
  };

  const switchTeam = (step) => {
    if (!setTeamTheme) return;
    setTeamTheme(THEME_ORDER[(themeIndex(teamTheme) + step + THEME_ORDER.length) % THEME_ORDER.length]);
    setHoverSpot(null);
    setPinnedSpot(null);
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

  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (event.target?.closest?.("input, textarea, select, [contenteditable='true']")) return;
      const viewport = document.querySelector(".circuit-viewport");
      if (viewport && viewport.dataset.active !== "top") return;
      switchTeam(event.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const unpinOutside = (event) => { if (pinnedSpot && !event.target.closest?.(".hw-spot")) setPinnedSpot(null); };

  return <motion.section id="top" className="hero-white spatial-hero-stage" style={{ "--lx": lightX, "--ly": lightY }} data-spotlight={activeSpot ? "on" : "off"} onPointerMove={trackPointer} onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }} onPointerDown={unpinOutside} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} data-testid="hero-section">
    <EraEnvironment teamTheme={teamTheme} />
    <div className="hw-tint" aria-hidden="true" />
    <div className="hw-grain" aria-hidden="true" />
    <div className="hw-particles" aria-hidden="true">{PARTICLES.map((particle, index) => <span key={index} style={{ left: particle.left, width: particle.size, height: particle.size, animationDelay: particle.delay, animationDuration: particle.duration }} />)}</div>
    <motion.div className="hw-ghost-name" style={{ x: ghostX }} aria-hidden="true">
      <div className="hw-ghost-stack">
        <span className="hw-ghost-echo">HAMILTON</span>
        <span className="hw-ghost-main">HAMILTON</span>
        <span className="hw-ghost-sub">EST. 1985 — STEVENAGE / SEVEN-TIME WORLD CHAMPION — No. 44</span>
      </div>
    </motion.div>

    <div className="hw-title" data-testid="hero-title">
      <motion.small initial={{ opacity: 0, y: 14 }} animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }} transition={{ delay: 0.2, duration: 0.6 }}>THE DEFINITIVE FAN ARCHIVE / 2007—2025</motion.small>
      <motion.span initial={{ x: -70, opacity: 0 }} animate={revealed ? { x: 0, opacity: 1 } : { x: -70, opacity: 0 }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}>STILL</motion.span>
      <motion.span initial={{ x: -70, opacity: 0 }} animate={revealed ? { x: 0, opacity: 1 } : { x: -70, opacity: 0 }} transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}><i>WE</i> RISE</motion.span>
    </div>

    <div className="hw-side-meta" aria-hidden="true"><span>LH44</span><i /><span>GBR / STEVENAGE</span><i /><span>51.5072° N</span></div>

    <div className="hw-figure-zone">
      <div className="hw-ground-track" aria-hidden="true" data-testid="hero-ground-track">
        <svg viewBox="87 -5 326 511" preserveAspectRatio="xMidYMid meet">
          <path className="hw-ground-track-halo" d={SILVERSTONE_PATH} />
          <path className="hw-ground-track-echo" d={SILVERSTONE_PATH} />
          <path className="hw-ground-track-line" d={SILVERSTONE_PATH} />
          <path className="hw-ground-track-pulse" d={SILVERSTONE_PATH} />
        </svg>
      </div>
      <div className="hw-floor-fx" aria-hidden="true" />
      <AnimatePresence mode="popLayout" custom={dir}>
        <motion.div
          key={teamTheme}
          className="hw-figure"
          style={{ rotateX, rotateY, aspectRatio: layout.ratio }}
          custom={dir}
          variants={{
            enter: (direction) => ({ x: direction * 150, opacity: 0, scale: 0.97 }),
            center: { x: 0, opacity: 1, scale: 1 },
            exit: (direction) => ({ x: direction * -150, opacity: 0, scale: 0.97 }),
          }}
          initial="enter"
          animate={revealed ? "center" : "enter"}
          exit="exit"
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          data-testid="hero-lewis-cutout"
        >
          <motion.span className="hw-floor-shadow" style={{ x: shadowX }} aria-hidden="true" />
          <span className="hw-contact-shadow" aria-hidden="true" />
          <div className="hw-body" data-testid="hero-figure-rig">
            <img src={layout.img} alt="" className="hw-lewis-layer hw-lewis-cast" aria-hidden="true" draggable="false" decoding="sync" />
            <img src={layout.img} alt="" className="hw-lewis-layer hw-lewis-reflection" aria-hidden="true" draggable="false" decoding="sync" />
            <img src={layout.img} alt="" className="hw-lewis-layer hw-lewis-wrap" aria-hidden="true" draggable="false" decoding="sync" />
            <img src={layout.img} alt="" className="hw-lewis-layer hw-lewis-rim" aria-hidden="true" draggable="false" decoding="sync" />
            <img src={layout.img} alt="Lewis Hamilton in race suit holding his helmet" className="hw-lewis" data-testid="hero-image" draggable="false" decoding="sync" />
            <span className="hw-lewis-sheen" style={{ "--figure": `url(${layout.img})` }} aria-hidden="true" />
          </div>
          {layout.spots.map((spot, index) => {
            const spotContent = content[spot.id];
            const [, elbow, end] = spot.line;
            return <motion.div
              key={spot.id}
              className={`hw-spot side-${spot.side} ${activeSpot === spot.id ? "is-active" : ""} ${pinnedSpot === spot.id ? "is-pinned" : ""}`}
              style={{ top: spot.top, left: spot.left, x: spotX, y: spotY }}
              initial={{ opacity: 0 }}
              animate={{ opacity: revealed ? 1 : 0 }}
              transition={{ delay: 0.75 + index * 0.12, duration: 0.5 }}
              onPointerEnter={(event) => { if (event.pointerType !== "touch") setHoverSpot(spot.id); }}
              onPointerLeave={() => setHoverSpot((current) => (current === spot.id ? null : current))}
            >
              <span className="hw-spot-glow" aria-hidden="true" />
              {activeSpot === spot.id && <span key={`${spot.id}-${pinnedSpot === spot.id}`} className="hw-spot-ping" aria-hidden="true" />}
              <button type="button" className="hw-spot-dot" data-cursor="cross" onClick={() => setPinnedSpot((current) => (current === spot.id ? null : spot.id))} aria-label={`${spotContent.title} — details`} aria-expanded={activeSpot === spot.id} data-testid={`hero-hotspot-${spot.id}`}><i /></button>
              <svg key={revealed ? "drawn" : "held"} className="hw-spot-svg" aria-hidden="true">
                <polyline points={spot.line.map(([x, y]) => `${x},${y}`).join(" ")} pathLength="1" style={{ animationDelay: `${0.85 + index * 0.12}s` }} />
                <circle cx={elbow[0]} cy={elbow[1]} r="1.6" />
              </svg>
              <div className="hw-spot-card" style={{ "--card-x": `${end[0]}px`, "--card-y": `${end[1]}px` }} data-testid={`hero-hotspot-card-${spot.id}`}>
                <span>{spotContent.tag}</span>
                <strong>{spotContent.title}</strong>
                <p>{spotContent.copy}</p>
              </div>
            </motion.div>;
          })}
        </motion.div>
      </AnimatePresence>
    </div>

    <motion.div className="hw-stats" initial="hidden" animate={revealed ? "show" : "hidden"} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.75 } } }} data-testid="hero-statistics">
      <div className="hw-stats-era" data-testid="hero-era-tag">{era.tag}</div>
      {[[era.wins ?? stats?.wins ?? 105, "GRAND PRIX WINS", "hero-wins-stat"], [era.titles ?? stats?.titles ?? 7, "WORLD TITLES", "hero-titles-stat"], [era.poles ?? stats?.poles ?? 104, "POLE POSITIONS", "hero-poles-stat"]].map(([value, label, testId], index) => <motion.div key={label} variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}><span>0{index + 1}</span><Counter value={value} testId={testId} active={revealed} /><small>{label}</small></motion.div>)}
    </motion.div>

    <motion.button className="hw-cta" initial={{ opacity: 0, y: 20 }} animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ delay: 1, duration: 0.6 }} whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }} onClick={() => window.__spatialGo?.("circuit")} data-testid="explore-legacy-button"><span><ArrowDownRight /></span><div><small>ENTER THE SPATIAL ARCHIVE</small><strong>EXPLORE THE LEGACY</strong></div></motion.button>

    <div className="hw-swipe-hint" aria-hidden="true" data-testid="hero-swipe-hint"><ChevronLeft size={11} /><span>SWIPE TO SWITCH TEAM</span><ChevronRight size={11} /></div>

    <div className="hw-telemetry" data-testid="hero-telemetry"><span>HAM / GBR</span><span>← → SWITCH ERA — HOVER THE POINTS</span><span><Crosshair size={11} /> PRECISION / PURPOSE / PACE</span></div>
  </motion.section>;
};
