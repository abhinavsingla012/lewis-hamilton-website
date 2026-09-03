import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
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
const SCROLL_GAIN = 2;
const TOUCH_GAIN = 2.2;
const DRIVE_LERP = 12;
const TEAM_ACCENTS = { ferrari: "#e10600", mercedes: "#00d2be", mclaren: "#ff6200" };

/** Distance-aware camera travel for explicit navigation (pins, menu, keyboard). */
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

/** The gate next to `key` in `dir`; the hero is never a gate. */
const neighbourGate = (key, dir) => {
  const next = SPATIAL_ROUTE[(ROUTE_INDEX.get(key) ?? 0) + dir];
  return next && next.key !== "top" ? next : null;
};

export const SpatialExperience = ({ archive, teamTheme = "ferrari", setTeamTheme, onRouteChange, onCircuitReady, revealed = true }) => {
  const runway = useRef(null);
  const travelRef = useRef({ progress: 0, follow: 0, coverage: 0, visible: false, dragging: false, overviewToken: 0 });

  const activeRef = useRef("top");
  const overviewRef = useRef(false);
  const travelingRef = useRef(false);
  const drivingRef = useRef(false);
  const parkedDirRef = useRef(1);
  const coverageRef = useRef(0);
  const targetRef = useRef({ key: "top", stop: 0, top: 0 });
  const tokenRef = useRef(0);
  const timersRef = useRef({ fallback: 0, prune: 0, resync: 0, watchdog: 0 });
  const cooldownRef = useRef(0);
  const driveRef = useRef({ moving: false, running: false, pos: 0, target: 0, dir: 1, frame: 0, lastTick: 0, offsetTop: 0, denominator: 1, lower: null, upper: null, lowerPx: 0, upperPx: 0, touchBase: 0, touchAnchor: 0 });

  const [activeKey, setActiveKey] = useState("top");
  const [targetKey, setTargetKey] = useState("top");
  const [mounted, setMounted] = useState([]);
  const [direction, setDirection] = useState(1);
  const [isTraveling, setIsTraveling] = useState(false);
  const [isCircuitOverview, setIsCircuitOverview] = useState(false);
  const [driveState, setDriveState] = useState("none");
  const [parkedDir, setParkedDir] = useState(1);
  const [coverage, setCoverage] = useState(0);

  /** Publishes the route state to the shell (nav lap counter, cursor, sound). */
  useEffect(() => {
    onRouteChange?.({ activeKey, targetKey, isTraveling: isTraveling || driveState !== "none", isCircuitOverview });
  }, [activeKey, targetKey, isTraveling, driveState, isCircuitOverview, onRouteChange]);

  const { scrollYProgress } = useScroll({ target: runway, offset: ["start start", "end end"] });
  const approach = useMotionValue(0);
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

  const measureRunway = useCallback(() => {
    const runwayEl = runway.current;
    const drive = driveRef.current;
    drive.denominator = Math.max(1, runwayEl.offsetHeight - window.innerHeight);
    drive.offsetTop = runwayEl.offsetTop;
    return (stop) => Math.round(drive.offsetTop + stop * drive.denominator);
  }, []);

  /** The car has reached a gate: it waits there, page closed, until one more scroll in `dir`. */
  const park = useCallback((item, dir) => {
    const drive = driveRef.current;
    drive.moving = false;
    drive.running = false;
    cancelAnimationFrame(drive.frame);
    const toPx = measureRunway();
    activeRef.current = item.key;
    targetRef.current = { key: item.key, stop: item.stop, top: toPx(item.stop) };
    parkedDirRef.current = dir;
    const gate = item.key !== "circuit";
    drivingRef.current = gate;
    setActiveKey(item.key);
    setTargetKey(item.key);
    setParkedDir(dir);
    setDriveState(gate ? "parked" : "none");
    mountChapter(item.key);
    window.history.replaceState(null, "", `#route-${item.key}`);
    cooldownRef.current = performance.now() + 450;
    requestAnimationFrame(() => updateCamera(item.stop));
  }, [measureRunway, mountChapter, updateCamera]);

  /** Single owner of every animated scroll movement (pins, menu, keyboard, deep links). */
  const goTo = useCallback((key, options = {}) => {
    const item = SPATIAL_ROUTE.find((route) => route.key === key);
    const runwayEl = runway.current;
    if (!item || !runwayEl) return;
    const drive = driveRef.current;
    drive.moving = false;
    drive.running = false;
    cancelAnimationFrame(drive.frame);
    const toPx = measureRunway();
    const top = toPx(item.stop);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const immediate = Boolean(options.immediate) || reduced;
    const fromIndex = ROUTE_INDEX.get(activeRef.current) ?? 0;
    const toIndex = ROUTE_INDEX.get(key) ?? 0;
    const duration = options.duration ?? travelDuration(SPATIAL_ROUTE[fromIndex]?.stop ?? 0, item.stop);
    const parkDir = options.park && key !== "circuit" && key !== "top" ? options.park : 0;

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
    window.clearTimeout(timersRef.current.watchdog);

    const land = () => {
      const lenis = window.__hamiltonLenis;
      if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
      else window.scrollTo(0, top);
      travelingRef.current = false;
      setIsTraveling(false);
      if (parkDir) {
        park(item, parkDir);
        return;
      }
      drivingRef.current = false;
      activeRef.current = key;
      setActiveKey(key);
      setDriveState("none");
      if (window.location.hash !== `#route-${key}`) window.history.replaceState(null, "", `#route-${key}`);
      cooldownRef.current = performance.now() + 240;
      requestAnimationFrame(() => updateCamera(item.stop));
    };

    const distance = Math.abs(window.scrollY - top);
    const animated = !immediate && distance > 6;
    if (animated) {
      travelingRef.current = true;
      setIsTraveling(true);
      timersRef.current.watchdog = window.setTimeout(() => {
        if (!travelingRef.current || tokenRef.current !== token) return;
        land();
      }, duration * 1000 + 1100);
    }

    const arrive = () => {
      if (tokenRef.current !== token) return;
      window.clearTimeout(timersRef.current.fallback);
      window.clearTimeout(timersRef.current.watchdog);
      land();
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
  }, [measureRunway, mountChapter, park, updateCamera]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const covered = value <= CIRCUIT_HUB.stop ? 0 : clamp(getPathProgress(value) / finalPathPosition, 0, 1);
    const nextCoverage = Math.round(covered * 100);
    if (nextCoverage !== coverageRef.current) {
      coverageRef.current = nextCoverage;
      setCoverage(nextCoverage);
    }
    updateCamera(value);
    const drive = driveRef.current;
    if (drive.moving && drive.upper && drive.lower) {
      const gate = drive.dir > 0 ? drive.upper : drive.lower;
      approach.set(clamp(1 - Math.abs(gate.stop - value) / (CHAPTER_GAP * 0.38), 0, 1));
    } else {
      approach.set(drivingRef.current ? 1 : 0);
    }
    if (travelingRef.current || overviewRef.current || drivingRef.current) return;
    const target = targetRef.current;
    if (Math.abs(value - target.stop) < 0.004) return;
    window.clearTimeout(timersRef.current.resync);
    timersRef.current.resync = window.setTimeout(() => {
      if (travelingRef.current || overviewRef.current || drivingRef.current) return;
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
   * Gesture navigation. The car is bound to the scroll: wheel and touch drive it along the racing
   * line between two gates and it stops wherever the scroll stops. Reaching a gate parks the car;
   * one more scroll in the same direction opens that chapter, scrolling on from a page drives away.
   * Keyboard uses the same intents with an animated drive. Chapter-owned steps (gallery slides,
   * the Legacy vault) are consumed first, as before.
   */
  useEffect(() => {
    const drive = driveRef.current;

    const tick = () => {
      if (!drive.running) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - drive.lastTick) / 1000);
      drive.lastTick = now;
      drive.pos += (drive.target - drive.pos) * Math.min(1, dt * DRIVE_LERP);
      if (Math.abs(drive.target - drive.pos) < 0.5) drive.pos = drive.target;
      const lenis = window.__hamiltonLenis;
      if (lenis) lenis.scrollTo(drive.pos, { immediate: true, force: true });
      else window.scrollTo(0, drive.pos);
      if (drive.pos === drive.target) {
        drive.running = false;
        if (!drive.moving) return;
        if (drive.pos === drive.lowerPx) park(drive.lower, -1);
        else if (drive.pos === drive.upperPx) park(drive.upper, 1);
        return;
      }
      drive.frame = requestAnimationFrame(tick);
    };
    const run = () => {
      if (drive.running) return;
      drive.running = true;
      drive.lastTick = performance.now();
      drive.frame = requestAnimationFrame(tick);
    };
    const driveTo = (target) => {
      if (!drive.moving) return;
      const next = clamp(target, drive.lowerPx, drive.upperPx);
      if (next !== drive.target) drive.dir = next > drive.target ? 1 : -1;
      drive.target = next;
      run();
    };
    const driveBy = (px) => driveTo(drive.target + px);

    /** Leaves the current gate (or page) and hands the car to the scroll. */
    const beginDrive = (dir) => {
      const key = activeRef.current;
      const here = SPATIAL_ROUTE.find((route) => route.key === key);
      const ahead = neighbourGate(key, dir);
      if (!here || !ahead) return false;
      const toPx = measureRunway();
      drive.lower = dir > 0 ? here : ahead;
      drive.upper = dir > 0 ? ahead : here;
      drive.lowerPx = toPx(drive.lower.stop);
      drive.upperPx = toPx(drive.upper.stop);
      drive.pos = window.scrollY;
      drive.target = drive.pos;
      drive.dir = dir;
      drive.moving = true;
      drivingRef.current = true;
      setDriveState("moving");
      setTargetKey(ahead.key);
      setDirection(dir);
      return true;
    };

    const openPage = () => {
      drivingRef.current = false;
      drive.moving = false;
      setDriveState("none");
      noteWayfindingStep();
      cooldownRef.current = performance.now() + 520;
    };

    const intent = (dir, animated = false) => {
      if (travelingRef.current || drive.moving) return false;
      if (document.documentElement.dataset.booting === "true") return false;
      if (overviewRef.current) {
        overviewRef.current = false;
        setIsCircuitOverview(false);
        requestAnimationFrame(() => updateCamera(scrollYProgress.get()));
        return true;
      }
      const key = activeRef.current;
      if (key === "top") {
        if (dir < 0) return false;
        noteWayfindingStep();
        window.history.replaceState(null, "", "#route-circuit");
        goTo("circuit");
        return true;
      }
      if (key === "circuit" && dir < 0) {
        window.history.replaceState(null, "", "#route-top");
        goTo("top");
        return true;
      }
      if (drivingRef.current) {
        if (dir === parkedDirRef.current) {
          openPage();
          return true;
        }
      } else if (key !== "circuit" && consumeChapterStep(key, dir)) {
        return true;
      }
      const ahead = neighbourGate(key, dir);
      if (!ahead) return false;
      noteWayfindingStep();
      if (animated) {
        drivingRef.current = true;
        setDriveState("moving");
        goTo(ahead.key, { park: dir });
        return true;
      }
      return beginDrive(dir) ? "drive" : false;
    };
    const keyboardStep = (dir) => intent(dir, true);
    window.__spatialStep = keyboardStep;

    let wheelTotal = 0;
    let wheelReset = 0;
    let touchStart = null;
    let touchHandled = false;
    let touchDriving = false;

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
      if (drive.moving) {
        driveBy(px * SCROLL_GAIN);
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
      const accumulated = wheelTotal;
      wheelTotal = 0;
      if (intent(dir) === "drive") driveBy(accumulated * SCROLL_GAIN);
      else cooldownRef.current = now + 520;
    };

    const onTouchStart = (event) => {
      const touch = event.touches[0];
      touchStart = touch ? { x: touch.clientX, y: touch.clientY } : null;
      touchHandled = false;
      touchDriving = false;
      if (drive.moving && touch) {
        touchDriving = true;
        drive.touchBase = drive.target;
        drive.touchAnchor = touch.clientY;
      }
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
      if (touchDriving) {
        event.stopPropagation();
        if (!drive.moving) {
          touchDriving = false;
          touchHandled = true;
          return;
        }
        driveTo(drive.touchBase + (drive.touchAnchor - touch.clientY) * TOUCH_GAIN);
        return;
      }
      if (horizontal > Math.abs(delta)) return;
      event.stopPropagation();
      if (touchHandled || travelingRef.current || performance.now() < cooldownRef.current) return;
      if (Math.abs(delta) < 52) return;
      const dir = delta > 0 ? 1 : -1;
      if (intent(dir) === "drive") {
        touchDriving = true;
        drive.touchBase = drive.pos;
        drive.touchAnchor = touch.clientY;
        return;
      }
      touchHandled = true;
      cooldownRef.current = performance.now() + 520;
    };
    const onTouchEnd = () => {
      touchStart = null;
      touchDriving = false;
    };

    const onKeyDown = (event) => {
      if (isEditable(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      const down = ["ArrowDown", "PageDown", " ", "Spacebar"].includes(event.key);
      const up = ["ArrowUp", "PageUp"].includes(event.key);
      if (!down && !up) return;
      if (nativeScrollTarget(event.target, down ? 1 : -1)) return;
      event.preventDefault();
      keyboardStep(down ? 1 : -1);
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true, capture: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true, capture: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(wheelReset);
      drive.running = false;
      cancelAnimationFrame(drive.frame);
      if (window.__spatialStep === keyboardStep) delete window.__spatialStep;
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
      window.removeEventListener("touchend", onTouchEnd, { capture: true });
      window.removeEventListener("touchcancel", onTouchEnd, { capture: true });
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [goTo, measureRunway, park, scrollYProgress, updateCamera]);

  useEffect(() => () => {
    const timers = timersRef.current;
    window.clearTimeout(timers.fallback);
    window.clearTimeout(timers.prune);
    window.clearTimeout(timers.resync);
    window.clearTimeout(timers.watchdog);
  }, []);

  /** Pin click: the camera dives to the car and drives to that gate, then waits for one scroll. */
  const navigate = (key) => {
    window.history.replaceState(null, "", `#route-${key}`);
    goTo(key, { park: 1 });
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
  const isParked = driveState === "parked" && !isTraveling && !isCircuitOverview;
  const pageOpen = driveState === "none" && !isTraveling && !isCircuitOverview;
  const showJourneyHud = isCircuitOverview || isTraveling || driveState !== "none" || activeKey === "circuit";
  const isSceneIdle = !isTraveling && !isCircuitOverview && driveState === "none" && activeKey !== "circuit";
  const circuitPaused = isSceneIdle || (activeKey === "top" && !isTraveling);
  const orbitable = isCircuitOverview || (activeKey === "circuit" && !isTraveling && driveState === "none");
  const targetLabel = SPATIAL_ROUTE.find(({ key }) => key === targetKey)?.label || currentLabel;
  const hudHint = displayKey === "circuit" ? `CURRENT POSITION · ${currentLabel}` : isParked ? `SCROLL ${parkedDir > 0 ? "DOWN" : "UP"} TO OPEN · ${currentLabel}` : driveState === "moving" ? `APPROACHING · ${targetLabel}` : "FOLLOW THE RACING LINE";

  return <section ref={runway} className="circuit-runway" data-testid="unified-spatial-experience">
    <div
      className="circuit-viewport"
      data-active={displayKey}
      data-overview={isCircuitOverview ? "true" : "false"}
      data-traveling={isTraveling ? "true" : "false"}
      data-driving={driveState}
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
          isActive={key === activeKey && pageOpen}
        />)}
      </div>

      <ChapterFlair activeKey={displayKey} traveling={isTraveling || driveState !== "none"} />

      {chapterKeys.has(activeKey) && pageOpen && <div className="chapter-sweep" key={`sweep-${activeKey}`} aria-hidden="true">
        <motion.i initial={{ y: "-40vh", opacity: 0 }} animate={{ y: "110vh", opacity: [0, .85, 0] }} transition={{ duration: .95, ease: [0.22, 1, 0.36, 1] }} />
      </div>}
      {chapterKeys.has(activeKey) && !isCircuitOverview && !isTraveling && driveState !== "moving" && <BackToCircuitButton onClick={openCircuitOverview} />}
      {chapterMarker && pageOpen && <ChapterMarker {...chapterMarker} className="global-chapter-marker" />}
      {isParked && <div className={`circuit-park-hint ${parkedDir > 0 ? "" : "is-up"}`} data-testid="circuit-park-hint" aria-live="polite">
        <span className="cph-gate">{chapterMarker ? `${chapterMarker.number} · ` : ""}{currentLabel}</span>
        <ChevronDown size={14} strokeWidth={1.8} />
        <span>SCROLL {parkedDir > 0 ? "DOWN" : "UP"} TO OPEN</span>
      </div>}
      {showJourneyHud && <>
        <div className="circuit-hud" data-testid="circuit-journey-hud">
          <span>{String(routeIndex + 1).padStart(2, "0")} / {String(SPATIAL_ROUTE.length).padStart(2, "0")}</span>
          <strong>{hudLabel}</strong>
          <small>{hudHint}</small>
          <i className="circuit-approach" data-testid="circuit-approach-meter" aria-hidden="true"><motion.b style={{ scaleX: approach }} /></i>
        </div>
        <div className="circuit-progress" data-testid="circuit-journey-progress"><motion.span style={{ scaleX: scrollYProgress }} /></div>
      </>}
    </div>
  </section>;
};
