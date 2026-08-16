import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowDownRight, Crosshair, Plus } from "lucide-react";

const Counter = ({ value, testId }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => { let frame; const start = performance.now(); const tick = (time) => { const p = Math.min(1, (time - start) / 1200); setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3)))); if (p < 1) frame = requestAnimationFrame(tick); }; frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame); }, [value]);
  return <strong data-testid={testId}>{display}</strong>;
};

const HOTSPOTS = [
  { id: "head", top: "3.2%", left: "54%", side: "right", tag: "THE MIND", title: "RACECRAFT IQ", copy: "104 pole positions — the most in Formula 1 history. A mind that maps a race three corners ahead of everyone else." },
  { id: "heart", top: "24%", left: "57%", side: "right", tag: "THE HEART", title: "STILL WE RISE", copy: "From a Stevenage sofa-bed to seven world championships. Knocked down in Abu Dhabi 2021 — never knocked out." },
  { id: "arm", top: "41%", left: "79%", side: "right", tag: "THE HANDS", title: "PRECISION", copy: "105 Grand Prix victories. Overtakes measured in millimetres, executed at 320 km/h." },
  { id: "helmet", top: "62%", left: "23%", side: "left", tag: "THE ARMOUR", title: "NO. 44", copy: "The number from his very first childhood kart. Now the most iconic digits on any grid in the world." },
  { id: "legs", top: "82%", left: "60%", side: "right", tag: "THE ENGINE", title: "ENDURANCE", copy: "19 seasons. 350+ race starts. 5G braking zones, lap after lap — an athlete built for war at 300 km/h." },
];

export const HeroStage = ({ stats }) => {
  const [activeSpot, setActiveSpot] = useState(null);
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

  return <section id="top" className="hero-white spatial-hero-stage" onPointerMove={trackPointer} onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }} data-testid="hero-section">
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
      <motion.div className="hw-figure" style={{ rotateX, rotateY }} initial={{ opacity: 0, y: 90, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1.15, delay: 0.25, ease: [0.22, 1, 0.36, 1] }} data-testid="hero-lewis-cutout">
        <motion.span className="hw-floor-shadow" style={{ x: shadowX }} aria-hidden="true" />
        <span className="hw-contact-shadow" aria-hidden="true" />
        <img src="/images/lewis-hero.png" alt="Lewis Hamilton in race suit holding his helmet" className="hw-lewis" data-testid="hero-image" draggable="false" />
        {HOTSPOTS.map((spot, index) => <motion.div
          key={spot.id}
          className={`hw-spot side-${spot.side} ${activeSpot === spot.id ? "is-active" : ""}`}
          style={{ top: spot.top, left: spot.left }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.15 + index * 0.14, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          onMouseEnter={() => setActiveSpot(spot.id)}
          onMouseLeave={() => setActiveSpot((current) => (current === spot.id ? null : current))}
        >
          <button type="button" className="hw-spot-dot" onClick={() => setActiveSpot((current) => (current === spot.id ? null : spot.id))} aria-label={`${spot.title} — details`} aria-expanded={activeSpot === spot.id} data-testid={`hero-hotspot-${spot.id}`}><i /><Plus size={11} strokeWidth={2.6} /></button>
          <span className="hw-spot-line" aria-hidden="true" />
          <div className="hw-spot-card" role="tooltip" data-testid={`hero-hotspot-card-${spot.id}`}>
            <span>{spot.tag}</span>
            <strong>{spot.title}</strong>
            <p>{spot.copy}</p>
          </div>
        </motion.div>)}
      </motion.div>
    </div>

    <motion.div className="hw-stats" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.75 } } }} data-testid="hero-statistics">
      {[[stats?.wins ?? 105, "GRAND PRIX WINS", "hero-wins-stat"], [stats?.titles ?? 7, "WORLD TITLES", "hero-titles-stat"], [stats?.poles ?? 104, "POLE POSITIONS", "hero-poles-stat"]].map(([value, label, testId], index) => <motion.div key={label} variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}><span>0{index + 1}</span><Counter value={value} testId={testId} /><small>{label}</small></motion.div>)}
    </motion.div>

    <motion.button className="hw-cta" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.6 }} whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }} onClick={() => window.__spatialGo?.("circuit")} data-testid="explore-legacy-button"><span><ArrowDownRight /></span><div><small>ENTER THE SPATIAL ARCHIVE</small><strong>EXPLORE THE LEGACY</strong></div></motion.button>

    <div className="hw-telemetry" data-testid="hero-telemetry"><span>HAM / GBR</span><span>HOVER THE POINTS — READ THE DRIVER</span><span><Crosshair size={11} /> PRECISION / PURPOSE / PACE</span></div>
  </section>;
};
