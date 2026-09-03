import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { BackToCircuitButton } from "./BackToCircuitButton";
import { HeroStage } from "./HeroStage";
import { CircuitStage } from "./CircuitStage";
import { ChapterView } from "./Chapters";
import { ChapterMarker } from "./ChapterMarker";
import { ChapterFlair } from "./ChapterFlair";
import { CIRCUIT_CHAPTERS, CIRCUIT_HUB, SILVERSTONE_PATH, SPATIAL_ROUTE } from "../data/circuitRoute";
import { canElementScroll, consumeChapterStep } from "../lib/spatialInput";
import { noteWayfindingStep } from "../lib/wayfinding";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const chapterKeys = new Set(CIRCUIT_CHAPTERS.map(({ key }) => key));
const finalPathPosition = CIRCUIT_CHAPTERS.at(-1).path;
const ROUTE_INDEX = new Map(SPATIAL_ROUTE.map((route, index) => [route.key, index]));
const WHEEL_THRESHOLD = 46;
const CHAPTER_GAP = 0.065;
const SCRUB_GAIN = 1.5;
const TOUCH_SCRUB_GAIN = 2.2;
const SCRUB_IDLE_MS = 150;
const SCRUB_LERP = 9;
const TEAM_ACCENTS = { ferrari: "#e10600", mercedes: "#00d2be", mclaren: "#ff6200" };

/** Slow, distance-aware camera travel: one chapter ≈ 2.1s, capped for cross-circuit jumps. */
const travelDuration = (fromStop, toStop) => {
  if (fromStop === 0 || toStop === 0) return 1.6;
  return clamp(0.6 + (Math.abs(toStop - fromStop) / CHAPTER_GAP) * 1.5, 0.6, 3.6);
};

const chapterMarkers = {
  legacy: { number: "01", label: "THE LEGACY", testId: "legacy-section-label" },
  timeline: { number: "02", label: "THE ASCENT", testId: "timeline-section-label" },
  cars: { number: "03", label: "CARS", testId: "cars-section-label" },
  gallery: { number: "04", label: "GALLERY", testId: "gallery-section-label" },
  records: { number: "05", label: "RECORDS", testId: "records-section-label" },
  milestones: { number: "06", label: "MILESTONES", testId: "milestones-section-label" },
  tracks: { number: "07", label: "TRACKS", testId: "tracks-section-label" },
  moment: { number: "08", label: "SILVERSTONE 2024", testId: "moment-section-label" },
  quotes: { number: "09", label: "VOICES", testId: "voices-section-label" },
  victories: { number: "10", label: "VICTORIES", testId: "victories-section-label" },
  footer: { number: "11", label: "STILL WE RISE", testId: "footer-section-label" },
};

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

const nearestRoute = (value) => SPATIAL_ROUTE.reduce((nearest, route) => (
  Math.abs(route.stop - value) < Math.abs(nearest.stop - value) ? route : nearest
), SPATIAL_ROUTE[0]);

export const SpatialExperience = ({ archive, teamTheme = "ferrari", setTeamTheme, onRouteChange, onCircuitReady, revealed = true }) => {
  const runway = useRef(null);
  const travelRef = useRef({ progress: 0, follow: 0, coverage: 0, visible: false, dragging: false, overviewToken: 0 });

  const activeRef = useRef("top");
  const overviewRef = useRef(false);
  const travelingRef = useRef(false);
  const coverageRef = useRef(0);
  const targetRef = useRef({ key: "top", stop: 0, top: 0 });
  const tokenRef = useRef(0);
  const timersRef = useRef({ fallback: 0, prune: 0, resync: 0 });
  const cooldownRef = useRef(0);
  const stepRef = useRef(null);
  const scrubRef = useRef({ active: false, held: false, pos: 0, target: 0, min: 0, max: 0, dir: 1, frame: 0, lastInput: 0, lastTick: 0, offsetTop: 0, denominator: 1, touchBase: 0, touchOffset: 0 });

  const [activeKey, setActiveKey] = useState("top");
  const [targetKey, setTargetKey] = useState("top");
  const [mounted, setMounted] = useState([]);
  const [direction, setDirection] = useState(1);
  const [isTraveling, setIsTraveling] = useState(false);
  const [isCircuitOverview, setIsCircuitOverview] = useState(false);
  const [coverage, setCoverage] = useState(0);

  /** Publishes the route state to the shell (nav lap counter, cursor, sound). */
  useEffect(() => {
    onRouteChange?.({ activeKey, targetKey, isTraveling, isCircuitOverview });
  }, [activeKey, targetKey, isTraveling, isCircuitOverview, onRouteChange]);

  const { scrollYProgress } = useScroll({ target: runway, offset: ["start start", "end end"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.045, 0.125], [1, 1, 0]);
  const mapOpacity = useTransform(scrollYProgress, [0.1, 0.16], [0, 1]);
  const bridgeOpacity = useTransform(scrollYProgress, [0.02, 0.05, 0.16, 0.19], [0, 1, 1, 0]);
  const hubCopyOpacity = useTransform(scrollYProgress, [0.105, 0.14, 0.185, 0.21], [0, 1, 1, 0]);

  /** Feeds the WebGL circuit: position along the racing line + how close the camera is to the car. */
  const updateCamera = useCallback((value) => {
    const travel = travelRef.current;
    travel.progress = getPathProgress(value);
    travel.follow = overviewRef.current ? 0 : clamp((value - CIRCUIT_HUB.stop) / 0.05, 0, 1);
    travel.coverage = value <= CIRCUIT_HUB.stop ? 0 : clamp(getPathProgress(value) / finalPathPosition, 0, 1);
    travel.visible = value > 0.09;
  }, []);

  const mountChapter = useCallback((key) => {
    if (!chapterKeys.has(key)) return;
    setMounted((current) => (current.includes(key) ? current : [...current, key]));
  }, []);

  /** Single owner of every scroll movement in the experience. */
  const goTo = useCallback((key, options = {}) => {
    const item = SPATIAL_ROUTE.find((route) => route.key === key);
    const runwayEl = runway.current;
    if (!item || !runwayEl) return;
    if (scrubRef.current.active) {
      scrubRef.current.active = false;
      cancelAnimationFrame(scrubRef.current.frame);
    }
    const denominator = Math.max(1, runwayEl.offsetHeight - window.innerHeight);
    const top = Math.round(runwayEl.offsetTop + item.stop * denominator);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const immediate = Boolean(options.immediate) || reduced;
    const fromIndex = ROUTE_INDEX.get(activeRef.current) ?? 0;
    const toIndex = ROUTE_INDEX.get(key) ?? 0;
    const duration = options.duration ?? travelDuration(SPATIAL_ROUTE[fromIndex]?.stop ?? 0, item.stop);

    if (overviewRef.current) {
      overviewRef.current = false;
      setIsCircuitOverview(false);
    }
    setDirection(toIndex >= fromIndex ? 1 : -1);
    mountChapter(key);
    targetRef.current = { key, stop: item.stop, top };
    setTargetKey(key);

    const token = tokenRef.current + 1;
    tokenRef.current = token;
    window.clearTimeout(timersRef.current.fallback);
    window.clearTimeout(timersRef.current.prune);
    window.clearTimeout(timersRef.current.resync);

    const distance = Math.abs(window.scrollY - top);
    const animated = !immediate && distance > 6;
    if (animated) {
      travelingRef.current = true;
      setIsTraveling(true);
      window.clearTimeout(timersRef.current.watchdog);
      timersRef.current.watchdog = window.setTimeout(() => {
        if (!travelingRef.current) return;
        const target = targetRef.current;
        const lenisNow = window.__hamiltonLenis;
        if (lenisNow) lenisNow.scrollTo(target.top, { immediate: true, force: true });
        else window.scrollTo(0, target.top);
        travelingRef.current = false;
        activeRef.current = target.key;
        setIsTraveling(false);
        setActiveKey(target.key);
        cooldownRef.current = performance.now() + 240;
        requestAnimationFrame(() => updateCamera(target.stop));
      }, duration * 1000 + 1100);
    }

    const arrive = () => {
      if (tokenRef.current !== token) return;
      window.clearTimeout(timersRef.current.fallback);
      window.clearTimeout(timersRef.current.watchdog);
      const lenis = window.__hamiltonLenis;
      if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
      else window.scrollTo(0, top);
      travelingRef.current = false;
      activeRef.current = key;
      setIsTraveling(false);
      setActiveKey(key);
      cooldownRef.current = performance.now() + 240;
      requestAnimationFrame(() => updateCamera(item.stop));
      timersRef.current.prune = window.setTimeout(() => {
        if (tokenRef.current !== token) return;
        setMounted((current) => (current.length <= 1 && current[0] === key ? current : current.filter((entry) => entry === key)));
      }, 700);
    };

    const lenis = window.__hamiltonLenis;
    if (!animated) {
      if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
      else window.scrollTo(0, top);
      requestAnimationFrame(arrive);
      return;
    }
    if (lenis) {
      lenis.scrollTo(top, {
        duration,
        force: true,
        lock: true,
        easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
        onComplete: arrive,
      });
      timersRef.current.fallback = window.setTimeout(arrive, duration * 1000 + 260);
    } else {
      window.scrollTo({ top, behavior: "smooth" });
      timersRef.current.fallback = window.setTimeout(arrive, 760);
    }
  }, [mountChapter, updateCamera]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const covered = value <= CIRCUIT_HUB.stop ? 0 : clamp(getPathProgress(value) / finalPathPosition, 0, 1);
    const nextCoverage = Math.round(covered * 100);
    if (nextCoverage !== coverageRef.current) {
      coverageRef.current = nextCoverage;
      setCoverage(nextCoverage);
    }
    updateCamera(value);
    if (travelingRef.current || overviewRef.current) return;
    const target = targetRef.current;
    if (Math.abs(value - target.stop) < 0.004) return;
    window.clearTimeout(timersRef.current.resync);
    timersRef.current.resync = window.setTimeout(() => {
      if (travelingRef.current || overviewRef.current) return;
      const current = scrollYProgress.get();
      if (Math.abs(current - targetRef.current.stop) < 0.004) return;
      goTo(nearestRoute(current).key, { immediate: true });
    }, 220);
  });

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => updateCamera(scrollYProgress.get()));
    window.__spatialGo = (key, options) => goTo(key, options);
    const handleHash = () => {
      const key = window.location.hash.replace("#route-", "");
      if (SPATIAL_ROUTE.some((route) => route.key === key)) goTo(key, { immediate: true });
    };
    window.addEventListener("hashchange", handleHash);
    handleHash();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", handleHash);
      delete window.__spatialGo;
    };
  }, [goTo, scrollYProgress, updateCamera]);

  /**
   * Gesture navigation. Wheel and touch scrub the camera along the racing line in real time so
   * the car moves with the scroll; when the gesture rests, the journey eases onto the nearest
   * chapter. Keyboard, the hero handoff and chapter-owned steps (gallery, vault) stay quantised.
   */
  useEffect(() => {
    const scrub = scrubRef.current;

    const scrubTo = (target) => {
      const next = clamp(target, scrub.min, scrub.max);
      if (next !== scrub.target) scrub.dir = next > scrub.target ? 1 : -1;
      scrub.target = next;
      scrub.lastInput = performance.now();
    };
    const scrubBy = (px) => scrubTo(scrub.target + px);

    const finishScrub = () => {
      scrub.active = false;
      cancelAnimationFrame(scrub.frame);
      const value = (scrub.pos - scrub.offsetTop) / scrub.denominator;
      const biased = clamp(value + scrub.dir * CHAPTER_GAP * 0.32, CIRCUIT_HUB.stop, 1);
      const route = nearestRoute(biased).key === "top" ? SPATIAL_ROUTE[1] : nearestRoute(biased);
      travelingRef.current = false;
      if (route.key !== activeRef.current) {
        noteWayfindingStep();
        window.history.replaceState(null, "", `#route-${route.key}`);
      }
      goTo(route.key, { duration: travelDuration(value, route.stop) });
    };

    const tick = () => {
      if (!scrub.active) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - scrub.lastTick) / 1000);
      scrub.lastTick = now;
      scrub.pos += (scrub.target - scrub.pos) * Math.min(1, dt * SCRUB_LERP);
      if (Math.abs(scrub.target - scrub.pos) < 0.5) scrub.pos = scrub.target;
      const lenis = window.__hamiltonLenis;
      if (lenis) lenis.scrollTo(scrub.pos, { immediate: true, force: true });
      else window.scrollTo(0, scrub.pos);
      const settled = scrub.pos === scrub.target && now - scrub.lastInput > SCRUB_IDLE_MS;
      if (settled && !scrub.held) {
        finishScrub();
        return;
      }
      scrub.frame = requestAnimationFrame(tick);
    };

    const beginScrub = (dir) => {
      const runwayEl = runway.current;
      const key = activeRef.current;
      if (!runwayEl || key === "top" || (key === "circuit" && dir < 0)) return false;
      scrub.denominator = Math.max(1, runwayEl.offsetHeight - window.innerHeight);
      scrub.offsetTop = runwayEl.offsetTop;
      scrub.min = Math.round(scrub.offsetTop + CIRCUIT_HUB.stop * scrub.denominator);
      scrub.max = Math.round(scrub.offsetTop + SPATIAL_ROUTE.at(-1).stop * scrub.denominator);
      scrub.pos = window.scrollY;
      scrub.target = scrub.pos;
      scrub.dir = dir;
      scrub.held = false;
      scrub.lastInput = performance.now();
      scrub.lastTick = scrub.lastInput;
      scrub.active = true;
      travelingRef.current = true;
      const next = SPATIAL_ROUTE[(ROUTE_INDEX.get(key) ?? 0) + dir];
      if (next) setTargetKey(next.key);
      setIsTraveling(true);
      scrub.frame = requestAnimationFrame(tick);
      return true;
    };

    const step = (dir, allowScrub = false) => {
      if (travelingRef.current || scrub.active) return false;
      if (document.documentElement.dataset.booting === "true") return false;
      if (overviewRef.current) {
        overviewRef.current = false;
        setIsCircuitOverview(false);
        requestAnimationFrame(() => updateCamera(scrollYProgress.get()));
        return true;
      }
      if (consumeChapterStep(activeRef.current, dir)) return true;
      if (allowScrub && beginScrub(dir)) return "scrub";
      const index = ROUTE_INDEX.get(activeRef.current) ?? 0;
      const next = SPATIAL_ROUTE[index + dir];
      if (!next) return false;
      noteWayfindingStep();
      window.history.replaceState(null, "", `#route-${next.key}`);
      goTo(next.key);
      return true;
    };
    const quantisedStep = (dir) => step(dir);
    stepRef.current = quantisedStep;
    window.__spatialStep = quantisedStep;

    let wheelTotal = 0;
    let wheelReset = 0;
    let touchStart = null;
    let touchHandled = false;
    let touchScrubbing = false;

    const isEditable = (target) => Boolean(target?.closest?.("input, textarea, select, [contenteditable='true']"));
    const nativeScrollTarget = (target, delta) => {
      const scrollable = target?.closest?.("[data-chapter-scroll]");
      return scrollable && canElementScroll(scrollable, delta) ? scrollable : null;
    };

    const onWheel = (event) => {
      if (event.ctrlKey) return;
      if (event.target?.closest?.(".menu-panel")) return;
      if (nativeScrollTarget(event.target, event.deltaY)) {
        event.stopPropagation();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const now = performance.now();
      const px = event.deltaY * (event.deltaMode === 1 ? 16 : 1);
      if (scrub.active) {
        scrubBy(px * SCRUB_GAIN);
        return;
      }
      if (travelingRef.current || now < cooldownRef.current) {
        wheelTotal = 0;
        return;
      }
      wheelTotal += px;
      window.clearTimeout(wheelReset);
      wheelReset = window.setTimeout(() => { wheelTotal = 0; }, 220);
      if (Math.abs(wheelTotal) < WHEEL_THRESHOLD) return;
      const dir = wheelTotal > 0 ? 1 : -1;
      wheelTotal = 0;
      if (step(dir, true) === "scrub") scrubBy(dir * CHAPTER_GAP * scrub.denominator * 0.2);
      else cooldownRef.current = now + 520;
    };

    const onTouchStart = (event) => {
      const touch = event.touches[0];
      touchStart = touch ? { x: touch.clientX, y: touch.clientY } : null;
      touchHandled = false;
    };
    const onTouchMove = (event) => {
      const touch = event.touches[0];
      if (touchStart === null || !touch) return;
      if (travelRef.current.dragging) {
        event.preventDefault();
        return;
      }
      const delta = touchStart.y - touch.clientY;
      const horizontal = Math.abs(touch.clientX - touchStart.x);
      if (event.target?.closest?.(".menu-panel")) return;
      if (nativeScrollTarget(event.target, delta)) {
        event.stopPropagation();
        return;
      }
      event.preventDefault();
      if (touchScrubbing) {
        event.stopPropagation();
        scrubTo(scrub.touchBase + (delta - scrub.touchOffset) * TOUCH_SCRUB_GAIN);
        return;
      }
      if (horizontal > Math.abs(delta)) return;
      event.stopPropagation();
      if (touchHandled || travelingRef.current || performance.now() < cooldownRef.current) return;
      if (Math.abs(delta) < 52) return;
      const dir = delta > 0 ? 1 : -1;
      if (step(dir, true) === "scrub") {
        touchScrubbing = true;
        scrub.held = true;
        scrub.touchBase = scrub.pos;
        scrub.touchOffset = delta - dir * 26;
        scrubTo(scrub.touchBase + dir * 26 * TOUCH_SCRUB_GAIN);
        return;
      }
      touchHandled = true;
      cooldownRef.current = performance.now() + 520;
    };
    const onTouchEnd = () => {
      touchStart = null;
      if (touchScrubbing) {
        touchScrubbing = false;
        scrub.held = false;
        scrub.lastInput = performance.now();
      }
    };

    const onKeyDown = (event) => {
      if (isEditable(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      const down = ["ArrowDown", "PageDown", " ", "Spacebar"].includes(event.key);
      const up = ["ArrowUp", "PageUp"].includes(event.key);
      if (!down && !up) return;
      if (nativeScrollTarget(event.target, down ? 1 : -1)) return;
      event.preventDefault();
      step(down ? 1 : -1);
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true, capture: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true, capture: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(wheelReset);
      cancelAnimationFrame(scrub.frame);
      scrub.active = false;
      if (window.__spatialStep === quantisedStep) delete window.__spatialStep;
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
      window.removeEventListener("touchend", onTouchEnd, { capture: true });
      window.removeEventListener("touchcancel", onTouchEnd, { capture: true });
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [goTo, scrollYProgress, updateCamera]);

  useEffect(() => () => {
    const timers = timersRef.current;
    window.clearTimeout(timers.fallback);
    window.clearTimeout(timers.prune);
    window.clearTimeout(timers.resync);
  }, []);

  const navigate = (key) => {
    window.history.replaceState(null, "", `#route-${key}`);
    goTo(key);
  };
  const openCircuitOverview = () => {
    overviewRef.current = true;
    travelRef.current.overviewToken += 1;
    setIsCircuitOverview(true);
    updateCamera(scrollYProgress.get());
  };

  const displayKey = isCircuitOverview ? "circuit" : activeKey;
  const routeIndex = Math.max(0, SPATIAL_ROUTE.findIndex(({ key }) => key === activeKey));
  const currentLabel = SPATIAL_ROUTE[routeIndex]?.label || "RACING LINE";
  const hudLabel = isCircuitOverview ? `${coverage}% COMPLETE` : currentLabel;
  const chapterMarker = chapterMarkers[activeKey];
  const showJourneyHud = isCircuitOverview || isTraveling || activeKey === "circuit";
  const isSceneIdle = !isTraveling && !isCircuitOverview && activeKey !== "circuit";
  const circuitPaused = isSceneIdle || (activeKey === "top" && !isTraveling);
  const orbitable = isCircuitOverview || (activeKey === "circuit" && !isTraveling);

  return <section ref={runway} className="circuit-runway" data-testid="unified-spatial-experience">
    <div
      className="circuit-viewport"
      data-active={displayKey}
      data-overview={isCircuitOverview ? "true" : "false"}
      data-traveling={isTraveling ? "true" : "false"}
      data-scene-idle={isSceneIdle ? "true" : "false"}
      data-testid="circuit-spatial-viewport"
    >
      <motion.div className="circuit-map-layer" style={{ opacity: mapOpacity }} data-testid="circuit-map-layer">
        <CircuitStage accent={TEAM_ACCENTS[teamTheme] || TEAM_ACCENTS.ferrari} activeKey={displayKey} onSelect={navigate} paused={circuitPaused} travelRef={travelRef} onReady={onCircuitReady} orbitable={orbitable} />
        <motion.div className="circuit-hub-copy" style={{ opacity: isCircuitOverview ? 1 : hubCopyOpacity }} data-testid="circuit-hub-copy">
          <span>THE HOME CIRCUIT / 52.0786° N</span>
          <h2>SILVERSTONE</h2>
          <p data-testid="circuit-coverage-label">{isCircuitOverview ? `TRACK COVERED · ${coverage}% · CURRENT POSITION / ${currentLabel}` : "Choose a chapter on the circuit or keep scrolling."}</p>
        </motion.div>
        <a className="circuit-attribution" href="https://github.com/julesr0y/f1-circuits-svg" target="_blank" rel="noreferrer" data-testid="circuit-map-attribution-link">Circuit geometry: Jules Roy / CC BY 4.0 · adapted</a>
      </motion.div>

      <motion.div className="circuit-hero-shell" style={{ scale: heroScale, opacity: heroOpacity }}><HeroStage stats={archive?.stats} teamTheme={teamTheme} setTeamTheme={setTeamTheme} revealed={revealed} /></motion.div>

      <motion.div className="circuit-ground-bridge" style={{ opacity: bridgeOpacity }} aria-hidden="true" data-testid="circuit-ground-bridge">
        <div className="cgb-pos">
          <div className="cgb-scale">
            <svg className="cgb-svg" viewBox="87 -5 326 511" preserveAspectRatio="xMidYMid meet">
              <path className="hw-ground-track-halo" d={SILVERSTONE_PATH} />
              <path className="hw-ground-track-echo" d={SILVERSTONE_PATH} />
              <path className="hw-ground-track-line" d={SILVERSTONE_PATH} />
            </svg>
          </div>
        </div>
      </motion.div>

      <div className="circuit-chapters">
        {mounted.map((key) => <ChapterView
          key={key}
          chapterKey={key}
          archive={archive}
          direction={direction}
          teamTheme={teamTheme}
          isActive={key === activeKey && !isTraveling && !isCircuitOverview}
        />)}
      </div>

      <ChapterFlair activeKey={displayKey} traveling={isTraveling} />

      {chapterKeys.has(activeKey) && !isCircuitOverview && !isTraveling && <div className="chapter-sweep" key={`sweep-${activeKey}`} aria-hidden="true">
        <motion.i initial={{ y: "-40vh", opacity: 0 }} animate={{ y: "110vh", opacity: [0, .85, 0] }} transition={{ duration: .95, ease: [0.22, 1, 0.36, 1] }} />
      </div>}
      {chapterKeys.has(activeKey) && !isCircuitOverview && !isTraveling && <BackToCircuitButton onClick={openCircuitOverview} />}
      {chapterMarker && !isCircuitOverview && !isTraveling && <ChapterMarker {...chapterMarker} className="global-chapter-marker" />}
      {showJourneyHud && <>
        <div className="circuit-hud" data-testid="circuit-journey-hud">
          <span>{String(routeIndex + 1).padStart(2, "0")} / {String(SPATIAL_ROUTE.length).padStart(2, "0")}</span>
          <strong>{hudLabel}</strong>
          <small>{displayKey === "circuit" ? `CURRENT POSITION · ${currentLabel}` : "FOLLOW THE RACING LINE"}</small>
        </div>
        <div className="circuit-progress" data-testid="circuit-journey-progress"><motion.span style={{ scaleX: scrollYProgress }} /></div>
      </>}
    </div>
  </section>;
};
