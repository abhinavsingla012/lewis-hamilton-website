import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDownRight, Crosshair } from "lucide-react";
import { IMAGES } from "../data/content";

const AnimatedNumber = ({ value, testId }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame;
    const started = performance.now();
    const tick = (time) => {
      const progress = Math.min(1, (time - started) / 1250);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <strong data-testid={testId}>{display}</strong>;
};

export const Hero = ({ stats }) => {
  const heroRef = useRef(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const smoothX = useSpring(pointerX, { stiffness: 120, damping: 22 });
  const smoothY = useSpring(pointerY, { stiffness: 120, damping: 22 });
  const rotateY = useTransform(smoothX, [-.5, .5], [-5, 5]);
  const rotateX = useTransform(smoothY, [-.5, .5], [5, -5]);
  const imageX = useTransform(smoothX, [-.5, .5], [-18, 18]);
  const titleX = useTransform(smoothX, [-.5, .5], [12, -12]);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const heroOpacity = useTransform(scrollYProgress, [.72, 1], [1, 0]);

  const trackPointer = (event) => {
    const rect = heroRef.current.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - .5);
    pointerY.set((event.clientY - rect.top) / rect.height - .5);
    cursorX.set(event.clientX - rect.left);
    cursorY.set(event.clientY - rect.top);
  };

  return <section ref={heroRef} id="top" className="hero hero-v2" onPointerMove={trackPointer} onPointerLeave={() => { pointerX.set(0); pointerY.set(0); cursorX.set(-100); cursorY.set(-100); }} data-testid="hero-section">
    <div className="hero-grid" aria-hidden="true" />
    <motion.svg className="hero-trackline" viewBox="0 0 1000 700" aria-hidden="true"><motion.path d="M-30 560 C130 420 235 520 348 355 S610 88 1030 156" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: .28 }} transition={{ duration: 2.1, delay: .35, ease: "easeInOut" }}/></motion.svg>
    <motion.div className="hero-v2-title" style={{ x: titleX, y: titleY, opacity: heroOpacity }} data-testid="hero-title">
      {["STILL", "WE", "RISE"].map((word, index) => <motion.span key={word} className={word === "WE" ? "stroke" : ""} initial={{ x: index % 2 ? 120 : -120, clipPath: "inset(0 100% 0 0)" }} animate={{ x: 0, clipPath: "inset(0 0% 0 0)" }} transition={{ duration: .95, delay: .18 + index * .13, ease: [0.22, 1, 0.36, 1] }}>{word}</motion.span>)}
    </motion.div>
    <motion.div className="hero-v2-portrait" style={{ x: imageX, y: imageY, scale: imageScale, rotateX, rotateY, opacity: heroOpacity }} initial={{ opacity: 0, scale: .88, rotate: 3 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1.15, delay: .25, ease: [0.22, 1, 0.36, 1] }}>
      <img src={IMAGES.hero} alt="Cinematic Lewis Hamilton motorsport portrait" className="hero-image" data-testid="hero-image" />
      <div className="hero-v2-scan"/><span className="frame-corner corner-a"/><span className="frame-corner corner-b"/>
      <div className="hero-live-tag" data-testid="hero-era-label"><span/> LEGACY MODE / ACTIVE</div>
    </motion.div>
    <motion.figure className="hero-float-card helmet-card" style={{ x: useTransform(smoothX, [-.5, .5], [28, -28]), y: useTransform(smoothY, [-.5, .5], [-18, 18]) }} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: .7 }}><img src={IMAGES.helmet} alt="Purple racing helmet"/><figcaption>44 / ICON</figcaption></motion.figure>
    <motion.div className="hero-v2-number" style={{ y: useTransform(scrollYProgress, [0, 1], [0, -55]) }} data-testid="hero-car-number"><span>44</span><i/><i/></motion.div>
    <motion.div className="hero-kicker hero-v2-kicker" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05, duration: .65 }} data-testid="hero-introduction"><span>THE DEFINITIVE FAN ARCHIVE</span><p>One driver. Seven titles.<br/>A legacy measured beyond numbers.</p></motion.div>
    <motion.div className="hero-stat-rail" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: .14, delayChildren: .8 } } }} data-testid="hero-statistics">
      {[[stats?.wins ?? 105, "GRAND PRIX WINS", "hero-wins-stat"], [stats?.titles ?? 7, "WORLD TITLES", "hero-titles-stat"], [stats?.poles ?? 104, "POLE POSITIONS", "hero-poles-stat"]].map(([value, label, testId]) => <motion.div key={label} variants={{ hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0 } }}><AnimatedNumber value={value} testId={testId}/><span>{label}</span><b/></motion.div>)}
    </motion.div>
    <motion.button className="scroll-cue hero-v2-cta" whileHover={{ x: 7 }} whileTap={{ scale: .96 }} onClick={() => document.getElementById("legacy")?.scrollIntoView({ behavior: "smooth" })} data-testid="explore-legacy-button"><span><ArrowDownRight/></span> EXPLORE THE LEGACY</motion.button>
    <div className="hero-telemetry" data-testid="hero-telemetry"><span>HAM / GBR</span><span>51.5072° N</span><span>2007—2025</span><span><Crosshair size={12}/> PRECISION / PURPOSE / PACE</span></div>
    <motion.div className="hero-pointer" style={{ x: cursorX, y: cursorY }} aria-hidden="true"><span/></motion.div>
  </section>;
};