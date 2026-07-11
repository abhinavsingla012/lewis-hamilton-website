import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { BackToCircuitButton } from "./BackToCircuitButton";
import { HeroStage } from "./HeroStage";
import { SilverstoneMap } from "./SilverstoneMap";
import { StorySections } from "./StorySections";
import { CIRCUIT_CHAPTERS, CIRCUIT_HUB, SPATIAL_ROUTE } from "../data/circuitRoute";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const chapterKeys = new Set(CIRCUIT_CHAPTERS.map(({ key }) => key));

const getPathProgress = (value) => {
  const points = [{ stop: CIRCUIT_HUB.stop, path: CIRCUIT_CHAPTERS[0].path }, ...CIRCUIT_CHAPTERS];
  if (value <= points[0].stop) return points[0].path;
  for (let index = 1; index < points.length; index += 1) {
    if (value <= points[index].stop) {
      const previous = points[index - 1];
      const local = (value - previous.stop) / (points[index].stop - previous.stop);
      return previous.path + (points[index].path - previous.path) * local;
    }
  }
  return points[points.length - 1].path;
};

const getActiveKey = (value) => {
  if (value < 0.105) return "top";
  if (value < 0.205) return "circuit";
  let nearest = CIRCUIT_CHAPTERS[0];
  CIRCUIT_CHAPTERS.forEach((chapter) => {
    if (Math.abs(chapter.stop - value) < Math.abs(nearest.stop - value)) nearest = chapter;
  });
  return Math.abs(nearest.stop - value) <= 0.029 ? nearest.key : "transit";
};

export const SpatialExperience = ({ archive }) => {
  const runway = useRef(null);
  const pathRef = useRef(null);
  const cameraRef = useRef(null);
  const racerRef = useRef(null);
  const racerCoreRef = useRef(null);
  const activeRef = useRef("top");
  const [activeKey, setActiveKey] = useState("top");
  const { scrollYProgress } = useScroll({ target: runway, offset: ["start start", "end end"] });
  const heroScale = useTransform(scrollYProgress, [0, 0.06, 0.135, 0.17], [1, 1, 0.28, 0.18]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.105, 0.155, 0.18], [1, 1, 0.72, 0]);
  const mapOpacity = useTransform(scrollYProgress, [0.085, 0.135], [0, 1]);
  const pathProgress = useTransform(scrollYProgress, [CIRCUIT_HUB.stop, CIRCUIT_CHAPTERS.at(-1).stop], [0, 1]);
  const hubCopyOpacity = useTransform(scrollYProgress, [0.105, 0.14, 0.185, 0.21], [0, 1, 1, 0]);

  const updateCamera = useCallback((value) => {
    const path = pathRef.current;
    const camera = cameraRef.current;
    if (!path || !camera) return;
    const total = path.getTotalLength();
    const progress = getPathProgress(value);
    const distance = total * progress;
    const point = path.getPointAtLength(distance);
    const ahead = path.getPointAtLength(Math.min(total, distance + 2));
    const angle = Math.atan2(ahead.y - point.y, ahead.x - point.x);
    const follow = clamp((value - CIRCUIT_HUB.stop) / 0.045, 0, 1);
    const scale = 1 + follow * 2.15;
    const cosine = Math.cos(-angle);
    const sine = Math.sin(-angle);
    const desired = {
      a: scale * cosine,
      b: scale * sine,
      c: -scale * sine,
      d: scale * cosine,
      e: 250 - scale * (cosine * point.x - sine * point.y),
      f: 250 - scale * (sine * point.x + cosine * point.y),
    };
    const matrix = {
      a: 1 + (desired.a - 1) * follow,
      b: desired.b * follow,
      c: desired.c * follow,
      d: 1 + (desired.d - 1) * follow,
      e: desired.e * follow,
      f: desired.f * follow,
    };
    camera.setAttribute("transform", `matrix(${matrix.a} ${matrix.b} ${matrix.c} ${matrix.d} ${matrix.e} ${matrix.f})`);
    [racerRef.current, racerCoreRef.current].forEach((racer) => {
      racer?.setAttribute("cx", point.x);
      racer?.setAttribute("cy", point.y);
    });
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = getActiveKey(value);
    if (next !== activeRef.current) {
      activeRef.current = next;
      setActiveKey(next);
    }
    updateCamera(value);
  });

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => updateCamera(scrollYProgress.get()));
    window.__spatialGo = (key, options = {}) => {
      const item = SPATIAL_ROUTE.find((route) => route.key === key);
      if (!item || !runway.current) return;
      const top = runway.current.offsetTop + item.stop * (runway.current.offsetHeight - window.innerHeight);
      if (window.__hamiltonLenis) window.__hamiltonLenis.scrollTo(top, options.immediate ? { immediate: true, force: true } : { duration: 1.65, force: true });
      else window.scrollTo({ top, behavior: options.immediate ? "auto" : "smooth" });
    };
    const handleHash = () => {
      const key = window.location.hash.replace("#route-", "");
      if (SPATIAL_ROUTE.some((route) => route.key === key)) window.__spatialGo(key, { immediate: true });
    };
    window.addEventListener("hashchange", handleHash);
    handleHash();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", handleHash);
      delete window.__spatialGo;
    };
  }, [scrollYProgress, updateCamera]);

  useEffect(() => {
    if (activeKey !== "timeline") return undefined;
    let total = 0;
    let reset;
    const hold = (event) => {
      event.preventDefault();
      event.stopPropagation();
      total += event.deltaY;
      clearTimeout(reset);
      reset = setTimeout(() => { total = 0; }, 650);
      if (Math.abs(total) > 520) {
        const target = total > 0 ? "cars" : "legacy";
        total = 0;
        window.__spatialGo?.(target);
      }
    };
    window.addEventListener("wheel", hold, { passive: false, capture: true });
    return () => {
      clearTimeout(reset);
      window.removeEventListener("wheel", hold, { capture: true });
    };
  }, [activeKey]);

  const navigate = (key) => {
    window.history.replaceState(null, "", `#route-${key}`);
    window.__spatialGo?.(key);
  };
  const routeIndex = Math.max(0, SPATIAL_ROUTE.findIndex(({ key }) => key === activeKey));
  const hudLabel = activeKey === "transit" ? "RACING LINE" : (SPATIAL_ROUTE[routeIndex]?.label || "RACING LINE");

  return <section ref={runway} className="circuit-runway" data-testid="unified-spatial-experience">
    <div className="circuit-viewport" data-active={activeKey} data-testid="circuit-spatial-viewport">
      <motion.div className="circuit-map-layer" style={{ opacity: mapOpacity }} data-testid="circuit-map-layer">
        <SilverstoneMap activeKey={activeKey} cameraRef={cameraRef} onSelect={navigate} pathProgress={pathProgress} pathRef={pathRef} racerCoreRef={racerCoreRef} racerRef={racerRef} />
        <motion.div className="circuit-hub-copy" style={{ opacity: hubCopyOpacity }} data-testid="circuit-hub-copy">
          <span>THE HOME CIRCUIT / 52.0786° N</span>
          <h2>SILVERSTONE</h2>
          <p>Choose a chapter on the circuit or keep scrolling.</p>
        </motion.div>
        <a className="circuit-attribution" href="https://github.com/julesr0y/f1-circuits-svg" target="_blank" rel="noreferrer" data-testid="circuit-map-attribution-link">Circuit geometry: Jules Roy / CC BY 4.0 · adapted</a>
      </motion.div>
      <motion.div className="circuit-hero-shell" style={{ scale: heroScale, opacity: heroOpacity }}><HeroStage stats={archive?.stats} /></motion.div>
      <div className="circuit-chapters"><StorySections archive={archive} /></div>
      {chapterKeys.has(activeKey) && <BackToCircuitButton onClick={() => navigate("circuit")} />}
      <div className="circuit-hud" data-testid="circuit-journey-hud"><span>{String(routeIndex + 1).padStart(2, "0")} / {String(SPATIAL_ROUTE.length).padStart(2, "0")}</span><strong>{hudLabel}</strong><small>{activeKey === "circuit" ? "SELECT A GLOWING MARKER" : "FOLLOW THE RACING LINE"}</small></div>
      <div className="circuit-progress" data-testid="circuit-journey-progress"><motion.span style={{ scaleX: scrollYProgress }} /></div>
    </div>
  </section>;
};