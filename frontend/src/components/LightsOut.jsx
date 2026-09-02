import { useEffect, useRef, useState } from "react";
import { untilTime, withTimeout } from "../lib/boot";

const SESSION_KEY = "hamilton-booted";
const CADENCE_MS = 430;
const FIRST_LIGHT_MS = 420;
const CHECKS = [
  { key: "fonts", label: "TYPEFACES", cap: 3200 },
  { key: "imagery", label: "IMAGERY", cap: 5200 },
  { key: "archive", label: "ARCHIVE", cap: 2600 },
  { key: "circuit", label: "CIRCUIT", cap: 4600 },
  { key: "systems", label: "SYSTEMS", cap: 600 },
];

const hasBooted = () => { try { return window.sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; } };
const markBooted = () => { try { window.sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* storage disabled */ } };
const reducedMotion = () => Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

/**
 * Lights-Out cold start. Five start-light columns illuminate one by one, each tied to a real
 * readiness signal (typefaces, hero imagery, archive, WebGL circuit, systems) with a minimum
 * race-start cadence; then a randomised hold, lights out, and a team-colour curtain lifts to the hero.
 * Full sequence once per session; ~450ms micro-version afterwards; plain fade for reduced motion.
 */
export const LightsOut = ({ signals, onReveal, onDone }) => {
  const [phase, setPhase] = useState("boot");
  const [lit, setLit] = useState(0);
  const [ready, setReady] = useState({});
  const [micro] = useState(() => hasBooted() || reducedMotion());
  const skipRef = useRef(null);
  const doneRef = useRef(false);
  const revealRef = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.booting = "true";
    let cancelled = false;
    const timers = [];
    const later = (fn, ms) => { const id = window.setTimeout(() => { if (!cancelled) fn(); }, ms); timers.push(id); return id; };

    const reveal = () => {
      if (revealRef.current) return;
      revealRef.current = true;
      onReveal?.();
    };
    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      markBooted();
      delete root.dataset.booting;
      reveal();
      onDone?.();
    };

    const run = async () => {
      const start = performance.now();
      const tracked = CHECKS.map((check) => {
        const source = check.key === "systems" ? untilTime(start + 1500) : signals?.[check.key];
        return withTimeout(source ?? Promise.resolve(), check.cap).then(() => {
          if (!cancelled) setReady((current) => ({ ...current, [check.key]: true }));
        });
      });
      if (micro) {
        await withTimeout(tracked[0], 700);
        if (cancelled) return;
        setPhase("reveal");
        later(finish, reducedMotion() ? 260 : 520);
        return;
      }
      const skipped = new Promise((resolve) => { skipRef.current = resolve; });
      /* Cadence is measured from the previous light, so a main-thread stall never lights the gantry all at once. */
      let lastLit = start + FIRST_LIGHT_MS - CADENCE_MS;
      for (let index = 0; index < CHECKS.length; index += 1) {
        await Promise.race([Promise.all([tracked[index], untilTime(lastLit + CADENCE_MS)]), skipped]);
        if (cancelled) return;
        setLit(index + 1);
        lastLit = performance.now();
      }
      setPhase("hold");
      const hold = 300 + Math.random() * 800;
      await Promise.race([untilTime(performance.now() + hold), skipped]);
      if (cancelled) return;
      setPhase("out");
      later(() => {
        setPhase("reveal");
        later(reveal, 380);
        later(finish, 980);
      }, 260);
    };
    run();

    const skip = (event) => {
      if (event.type === "keydown" && (event.metaKey || event.ctrlKey || event.altKey)) return;
      skipRef.current?.();
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      delete root.dataset.booting;
    };
  }, [signals, onReveal, onDone, micro]);

  const current = CHECKS[Math.min(lit, CHECKS.length - 1)];
  const status = phase === "out" || phase === "reveal" ? "LIGHTS OUT." : phase === "hold" ? "ALL SYSTEMS GREEN · HOLD" : `WARMING · ${current.label}`;

  return <div className={`lights-out${micro ? " is-micro" : ""}`} data-phase={phase} role="status" aria-live="polite" aria-label="Loading the archive" data-testid="lights-out">
    <div className="lo-curtain" aria-hidden="true" />
    <div className="lo-stage">
      <div className="lo-grain" aria-hidden="true" />
      {!micro && <>
        <div className="lo-corner lo-corner-tl"><span>STILL WE RISE</span><small>THE DEFINITIVE FAN ARCHIVE</small></div>
        <div className="lo-corner lo-corner-tr"><span>LH44</span><small>2007 — 2025</small></div>
        <div className="lo-gantry" data-testid="lights-out-gantry">
          <div className="lo-bar" aria-hidden="true" />
          <div className="lo-housing">
            {CHECKS.map((check, index) => <div key={check.key} className={`lo-column${index < lit && phase !== "out" && phase !== "reveal" ? " is-lit" : ""}`} data-testid={`lights-out-light-${index + 1}`}>
              <i /><i />
            </div>)}
          </div>
        </div>
        <ul className="lo-checks" data-testid="lights-out-checks">
          {CHECKS.map((check, index) => <li key={check.key} className={`${ready[check.key] ? "is-ready" : ""}${index === lit && phase === "boot" ? " is-current" : ""}`} data-testid={`lights-out-status-${check.key}`}>
            <span>{String(index + 1).padStart(2, "0")}</span><strong>{check.label}</strong><em aria-hidden="true" /><b>{ready[check.key] ? "READY" : "LOADING"}</b>
          </li>)}
        </ul>
        <p className="lo-status" data-testid="lights-out-status">{status}</p>
        <button type="button" className="lo-skip" onClick={() => skipRef.current?.()} data-testid="lights-out-skip">SKIP · PRESS ANY KEY</button>
      </>}
    </div>
  </div>;
};
