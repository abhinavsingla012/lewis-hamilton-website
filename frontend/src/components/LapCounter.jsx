import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { CIRCUIT_CHAPTERS } from "../data/circuitRoute";
import { hasChapterStep } from "../lib/spatialInput";
import { isWayfindingLearned } from "../lib/wayfinding";

const IDLE_MS = 6000;
const TOTAL = CIRCUIT_CHAPTERS.length;
const pad = (value) => String(value).padStart(2, "0");
const chapterIndex = (key) => CIRCUIT_CHAPTERS.findIndex((chapter) => chapter.key === key);

/**
 * The nav's live instrument: SECTOR xx / 11, eleven chapter ticks (hover names, click travels,
 * sweep while travelling) and a learned idle cue that names the next chapter.
 * Reads 7× WORLD CHAMPION while the visitor is still on the hero.
 */
export const LapCounter = ({ route, onNavigate }) => {
  const { activeKey = "top", targetKey = "top", isTraveling = false, isCircuitOverview = false } = route || {};
  const index = chapterIndex(activeKey);
  const targetIndex = chapterIndex(targetKey);
  const showInstrument = activeKey !== "top" || (isTraveling && targetKey !== "top");
  const inCircuit = activeKey === "circuit" || isCircuitOverview;
  const current = index >= 0 ? CIRCUIT_CHAPTERS[index] : null;
  const next = index >= 0 ? CIRCUIT_CHAPTERS[index + 1] : (activeKey === "circuit" ? CIRCUIT_CHAPTERS[0] : null);
  const [idle, setIdle] = useState(false);
  const timer = useRef(0);

  useEffect(() => {
    setIdle(false);
    window.clearTimeout(timer.current);
    if (!showInstrument || isTraveling || isCircuitOverview || !next || isWayfindingLearned()) return undefined;
    const arm = () => {
      window.clearTimeout(timer.current);
      setIdle(false);
      timer.current = window.setTimeout(() => setIdle(true), IDLE_MS);
    };
    arm();
    const events = ["wheel", "keydown", "touchstart", "pointerdown"];
    events.forEach((name) => window.addEventListener(name, arm, { passive: true, capture: true }));
    return () => {
      window.clearTimeout(timer.current);
      events.forEach((name) => window.removeEventListener(name, arm, { capture: true }));
    };
  }, [activeKey, isTraveling, isCircuitOverview, showInstrument, next]);

  const sectorText = index >= 0 && !inCircuit ? `SECTOR ${pad(index + 1)} / ${pad(TOTAL)}` : `SECTOR — / ${pad(TOTAL)}`;
  let label = current?.label || "SILVERSTONE";
  if (isTraveling) label = targetIndex >= 0 ? `→ ${pad(targetIndex + 1)} ${CIRCUIT_CHAPTERS[targetIndex].label}` : "→ SILVERSTONE";
  const cueText = current && hasChapterStep(activeKey) ? "SCROLL TO CONTINUE" : `NEXT · ${pad(index + 2)} ${next?.label ?? ""}`;

  return <div className="nav-instrument-slot" data-mode={showInstrument ? "instrument" : "brand"} data-testid="nav-instrument-slot">
    <AnimatePresence mode="wait" initial={false}>
      {showInstrument ? <motion.div
        key="instrument"
        className={`lap-counter${isTraveling ? " is-traveling" : ""}${idle ? " is-idle" : ""}`}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        data-testid="nav-lap-counter"
      >
        <span className="lc-sector" data-testid="nav-sector-index">{sectorText}</span>
        <div className="lc-ticks" role="group" aria-label="Chapter progress">
          {CIRCUIT_CHAPTERS.map((chapter, i) => {
            const isCurrent = i === index && !inCircuit;
            const isTarget = isTraveling && i === targetIndex;
            return <button
              key={chapter.key}
              type="button"
              className={`lc-tick${i < index ? " is-past" : ""}${isCurrent ? " is-current" : ""}${isTarget ? " is-target" : ""}`}
              onClick={() => onNavigate(chapter.key)}
              aria-label={`Go to chapter ${pad(i + 1)} ${chapter.label}`}
              aria-current={isCurrent ? "true" : undefined}
              data-testid={`nav-sector-tick-${chapter.key}`}
            >
              <i aria-hidden="true" />
              <span className="lc-tip">{pad(i + 1)} {chapter.label}</span>
            </button>;
          })}
        </div>
        {idle && next
          ? <button type="button" className="lc-label lc-cue" onClick={() => window.__spatialStep?.(1)} data-testid="nav-next-cue"><ArrowDown size={10} strokeWidth={2.4} />{cueText}</button>
          : <span className="lc-label" data-testid="nav-sector-label">{label}</span>}
      </motion.div>
      : <motion.span
        key="brand"
        className="nav-stat"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.28 }}
        data-testid="navigation-career-stat"
      >7× WORLD CHAMPION</motion.span>}
    </AnimatePresence>
  </div>;
};
