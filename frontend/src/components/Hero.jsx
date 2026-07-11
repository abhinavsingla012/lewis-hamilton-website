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
  const rotateY = useTransform(smoothX, [-.5, .5], [-3.5, 3.5]);
  const rotateX = useTransform(smoothY, [-.5, .5], [3.5, -3.5]);
  const imageX = useTransform(smoothX, [-.5, .5], [-10, 10]);
  const titleX = useTransform(smoothX, [-.5, .5], [7, -7]);
  const tokenX = useTransform(smoothX, [-.5, .5], [18, -18]);
  const tokenY = useTransform(smoothY, [-.5, .5], [-12, 12]);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, .25, 1], [0, 0, 105]);
  const imageScale = useTransform(scrollYProgress, [0, .25, 1], [1, 1, 1.07]);
  const titleY = useTransform(scrollYProgress, [0, .25, 1], [0, 0, -82]);
  const heroOpacity = useTransform(scrollYProgress, [0, .25, .7, .8], [1, 1, 1, 0]);
  const numberY = useTransform(scrollYProgress, [0, .25, 1], [0, 0, -42]);
  const sceneScale = useTransform(scrollYProgress, [0, .25, .48, .6], [1, 1, .36, .28]);
  const sceneRadius = useTransform(scrollYProgress, [0, .25, .48], [0, 0, 54]);
  const sceneOpacity = useTransform(scrollYProgress, [0, .52, .66, .76], [1, 1, .32, 0]);
  const leftNameX = useTransform(scrollYProgress, [.49, .63, .77], ["-120vw", "-4vw", "12vw"]);
  const rightNameX = useTransform(scrollYProgress, [.49, .63, .77], ["120vw", "4vw", "-12vw"]);
  const transitionOpacity = useTransform(scrollYProgress, [.47, .53, .72, .8], [0, 1, 1, 0]);
  const transitionScale = useTransform(scrollYProgress, [.49, .62, .78], [1.15, 1, .94]);
  const chartOpacity = useTransform(scrollYProgress, [.64, .7, .94, 1], [0, 1, 1, 0]);
  const chartScale = useTransform(scrollYProgress, [.65, .72, .94, 1], [.43, .52, 1.5, 1.8]);
  const chartX = useTransform(scrollYProgress, [.67, .8, .96], ["0vw", "-14vw", "-52vw"]);
  const chartY = useTransform(scrollYProgress, [.67, .8, .96], ["0vh", "-6vh", "-23vh"]);
  const mapPathLength = useTransform(scrollYProgress, [.65, .87], [0, 1]);

  const trackPointer = (event) => {
    pointerX.set(event.clientX / window.innerWidth - .5);
    pointerY.set(event.clientY / window.innerHeight - .5);
    cursorX.set(event.clientX);
    cursorY.set(event.clientY);
  };

  return <section ref={heroRef} id="top" className="hero-sequence-v4" onPointerMove={trackPointer} onPointerLeave={() => { pointerX.set(0); pointerY.set(0); cursorX.set(-100); cursorY.set(-100); }} data-testid="hero-section">
    <div className="hero-sequence-sticky">
    <motion.div className="hero hero-v3" style={{ scale: sceneScale, borderRadius: sceneRadius, opacity: sceneOpacity }} data-testid="hero-3d-scene">
    <div className="hero-v3-ambient" aria-hidden="true"><span/><span/><span/></div>
    <div className="hero-grid hero-v3-grid" aria-hidden="true" />
    <div className="hero-v3-floor" aria-hidden="true" />
    <motion.svg className="hero-v3-track" viewBox="0 0 1000 700" aria-hidden="true" data-testid="hero-animated-track"><motion.path d="M-40 540 C170 390 250 515 386 335 S710 75 1040 180" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: .34 }} transition={{ duration: 2.2, delay: .25, ease: "easeInOut" }}/></motion.svg>
    <div className="hero-v3-marquee" aria-hidden="true"><span>LEWIS HAMILTON · STILL WE RISE · </span><span>LEWIS HAMILTON · STILL WE RISE · </span></div>

    <motion.div className="hero-v3-title" style={{ x: titleX, y: titleY, opacity: heroOpacity }} data-testid="hero-title">
      <motion.span initial={{ x: -130, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: .9, ease: [0.22, 1, 0.36, 1] }}>STILL</motion.span>
      <motion.span initial={{ x: 130, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: .9, delay: .12, ease: [0.22, 1, 0.36, 1] }}><i>WE</i> RISE</motion.span>
    </motion.div>

    <motion.div className="hero-v3-stage" style={{ x: imageX, y: imageY, scale: imageScale, rotateX, rotateY, opacity: heroOpacity }}>
      <span className="hero-v3-depth depth-a"/><span className="hero-v3-depth depth-b"/>
      <motion.div className="hero-v3-card" initial={{ opacity: 0, y: 70, rotateY: -8 }} animate={{ opacity: 1, y: 0, rotateY: 0 }} transition={{ duration: 1.05, delay: .18, ease: [0.22, 1, 0.36, 1] }}>
        <div className="hero-v3-cardbar"><span>LH / 44</span><span className="hero-v3-live" data-testid="hero-era-label"><i/> ARCHIVE LIVE</span></div>
        <div className="hero-v3-window">
          <img src={IMAGES.hero} alt="Lewis Hamilton kissing a victory trophy under the British flag" className="hero-image" data-testid="hero-image" />
          <div className="hero-v3-scan" data-testid="hero-scan-line"/><div className="hero-v3-shine"/>
          <span className="hero-v3-image-index">01 / LEGACY</span>
        </div>
        <div className="hero-v3-cardfoot"><span>THE DEFINITIVE FAN ARCHIVE</span><strong>2007—2025</strong></div>
      </motion.div>
    </motion.div>

    <motion.figure className="hero-v3-token" style={{ x: tokenX, y: tokenY }} initial={{ opacity: 0, scale: .8, rotate: 8 }} animate={{ opacity: 1, scale: 1, rotate: 3 }} transition={{ delay: .85, duration: .7 }} data-testid="hero-helmet-card"><img src={IMAGES.helmet} alt="Lewis Hamilton saluting in his race helmet" data-testid="hero-helmet-image"/><figcaption><span>SECOND PLANE</span><strong>44 / SALUTE</strong></figcaption></motion.figure>

    <motion.div className="hero-v3-number" style={{ y: numberY }} data-testid="hero-car-number"><div><span>44</span><small>HAM</small></div><i data-testid="hero-outer-orbit"/><i data-testid="hero-inner-orbit"/></motion.div>

    <motion.div className="hero-v3-kicker" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .9, duration: .65 }} data-testid="hero-introduction"><span>THE RECORD BEYOND RECORDS</span><p>One driver. Seven titles.<br/>A legacy measured beyond numbers.</p></motion.div>
    <motion.div className="hero-v3-stats" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: .12, delayChildren: .72 } } }} data-testid="hero-statistics">
      {[[stats?.wins ?? 105, "GRAND PRIX WINS", "hero-wins-stat"], [stats?.titles ?? 7, "WORLD TITLES", "hero-titles-stat"], [stats?.poles ?? 104, "POLE POSITIONS", "hero-poles-stat"]].map(([value, label, testId], index) => <motion.div key={label} variants={{ hidden: { opacity: 0, x: 28 }, show: { opacity: 1, x: 0 } }}><span>0{index + 1}</span><AnimatedNumber value={value} testId={testId}/><small>{label}</small></motion.div>)}
    </motion.div>
    <motion.button className="hero-v3-cta" whileHover={{ y: -4 }} whileTap={{ scale: .96 }} onClick={() => document.getElementById("legacy")?.scrollIntoView({ behavior: "smooth" })} data-testid="explore-legacy-button"><span><ArrowDownRight/></span><div><small>SCROLL TO DISCOVER</small><strong>EXPLORE THE LEGACY</strong></div></motion.button>
    <div className="hero-v3-telemetry" data-testid="hero-telemetry"><span>HAM / GBR</span><span>51.5072° N</span><span>2007—2025</span><span><Crosshair size={12}/> PRECISION / PURPOSE / PACE</span></div>
    <motion.div className="hero-v3-pointer" style={{ x: cursorX, y: cursorY }} aria-hidden="true"><span/></motion.div>
    </motion.div>
    <motion.div className="spatial-chart-shell" style={{ opacity: chartOpacity }} data-testid="spatial-racetrack-map">
      <motion.div className="spatial-chart" style={{ scale: chartScale, x: chartX, y: chartY }}>
        <motion.svg className="spatial-route" viewBox="0 0 1800 1100" preserveAspectRatio="none" aria-hidden="true"><path className="route-ghost" d="M900 550 C680 420 570 275 430 250 C700 80 1190 70 1440 205 C1580 350 1480 520 1260 660 C1030 760 690 810 350 850 C690 1060 1150 1030 1440 900"/><motion.path className="route-live" d="M900 550 C680 420 570 275 430 250 C700 80 1190 70 1440 205 C1580 350 1480 520 1260 660 C1030 760 690 810 350 850 C690 1060 1150 1030 1440 900" style={{ pathLength: mapPathLength }}/></motion.svg>
        <div className="map-origin" data-testid="map-origin-node"><span>44</span><small>ORIGIN</small></div>
        <article className="map-node node-timeline" data-testid="map-timeline-node"><img src={IMAGES.season2020} alt="Timeline preview"/><span>02 / TIMELINE</span><strong>19 SEASONS</strong></article>
        <article className="map-node node-cars" data-testid="map-cars-node"><img src={IMAGES.season2008} alt="Cars chapter preview"/><span>03 / CARS</span><strong>MACHINES</strong></article>
        <article className="map-node node-legacy featured" data-testid="map-legacy-node"><img src={IMAGES.portrait} alt="Legacy chapter preview"/><div><span>01 / NEXT CHAPTER</span><strong>LEGACY</strong><small>THE NUMBERS ONLY TELL HALF THE STORY</small></div></article>
        <article className="map-node node-tracks" data-testid="map-tracks-node"><img src={IMAGES.silverstone} alt="Tracks chapter preview"/><span>04 / TRACKS</span><strong>DOMINANCE</strong></article>
        <article className="map-node node-victories" data-testid="map-victories-node"><img src={IMAGES.podium} alt="Victories chapter preview"/><span>05 / VICTORIES</span><strong>105 WINS</strong></article>
      </motion.div>
      <div className="spatial-map-label"><span>THE HAMILTON ARCHIVE</span><small>SCROLLING THE RACING LINE</small></div>
    </motion.div>
    <motion.div className="hero-transition-type" style={{ opacity: transitionOpacity, scale: transitionScale }} data-testid="hero-legacy-transition">
      <motion.span className="transition-lewis" style={{ x: leftNameX }}>LEWIS</motion.span>
      <motion.span className="transition-hamilton" style={{ x: rightNameX }}>HAMILTON</motion.span>
      <motion.small style={{ opacity: transitionOpacity }}>CHAPTER 01 · THE LEGACY</motion.small>
    </motion.div>
    <div className="hero-transition-progress" aria-hidden="true"><motion.span style={{ scaleX: scrollYProgress }}/></div>
    </div>
  </section>;
};