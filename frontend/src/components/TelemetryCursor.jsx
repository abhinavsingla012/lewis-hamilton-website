import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Telemetry cursor — a team-coloured dot that snaps to the pointer and a hairline ring that lags
 * behind it on a spring. The ring reads context: it docks onto pills and buttons like a pit-board
 * frame, becomes a DRAG chip over the vault and the reactor dial, PREV/NEXT over the gallery,
 * a crosshair over hero hotspots and a numbered chip over circuit markers.
 * Pointer-fine devices only; hidden for touch and for reduced-motion preferences.
 */
const INTERACTIVE = "a,button,[role='button'],summary,label,input,select,textarea,[data-cursor]";
const SIZES = { default: 30, link: 42, drag: 62, prev: 62, next: 62, chip: 48, cross: 42 };
const DOT_SPRING = { stiffness: 1100, damping: 70, mass: 0.35 };
const RING_SPRING = { stiffness: 380, damping: 36, mass: 0.75 };
const DOCK_MAX = { width: 300, height: 80 };

const parseRadius = (element, fallback) => {
  const raw = parseFloat(window.getComputedStyle(element).borderTopLeftRadius);
  return Number.isFinite(raw) ? raw : fallback;
};

const resolve = (target, x, y) => {
  const element = target?.closest?.(INTERACTIVE);
  if (!element) return { mode: "default" };
  const explicit = element.dataset?.cursor;
  if (explicit === "none") return { mode: "default" };
  if (explicit === "drag" || element.matches?.("input[type='range']")) return { mode: "drag", label: "DRAG" };
  if (explicit === "split") {
    const rect = element.getBoundingClientRect();
    return x < rect.left + rect.width / 2 ? { mode: "prev", label: "PREV" } : { mode: "next", label: "NEXT" };
  }
  if (explicit === "cross") return { mode: "cross" };
  if (element.classList.contains("circuit-pin")) return { mode: "chip", label: element.querySelector("b")?.textContent || "" };
  const rect = element.getBoundingClientRect();
  if (rect.width > 0 && rect.width <= DOCK_MAX.width && rect.height <= DOCK_MAX.height) {
    return { mode: "link", dock: rect, radius: Math.min(parseRadius(element, 8) + 7, (rect.height + 14) / 2) };
  }
  return { mode: "link" };
};

export const TelemetryCursor = () => {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState("default");
  const [label, setLabel] = useState("");
  const [docked, setDocked] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [down, setDown] = useState(false);

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const dotX = useSpring(x, DOT_SPRING);
  const dotY = useSpring(y, DOT_SPRING);
  const cx = useMotionValue(-200);
  const cy = useMotionValue(-200);
  const w = useMotionValue(SIZES.default);
  const h = useMotionValue(SIZES.default);
  const r = useMotionValue(SIZES.default / 2);
  const ringX = useSpring(cx, RING_SPRING);
  const ringY = useSpring(cy, RING_SPRING);
  const ringW = useSpring(w, RING_SPRING);
  const ringH = useSpring(h, RING_SPRING);
  const ringR = useSpring(r, RING_SPRING);
  const ringLeft = useTransform([ringX, ringW], ([centre, width]) => centre - width / 2);
  const ringTop = useTransform([ringY, ringH], ([centre, height]) => centre - height / 2);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const hover = window.matchMedia("(hover: hover)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    /* A real mouse/pen move is the only trustworthy proof a pointer exists: touch devices,
       emulators and hybrids never mount the cursor until one arrives. */
    let mouseSeen = false;
    const update = () => setEnabled(mouseSeen && fine.matches && hover.matches && !reduced.matches);
    const onFirstMouse = (event) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      mouseSeen = true;
      window.removeEventListener("pointermove", onFirstMouse, { capture: true });
      update();
    };
    window.addEventListener("pointermove", onFirstMouse, { passive: true, capture: true });
    fine.addEventListener?.("change", update);
    hover.addEventListener?.("change", update);
    reduced.addEventListener?.("change", update);
    return () => {
      window.removeEventListener("pointermove", onFirstMouse, { capture: true });
      fine.removeEventListener?.("change", update);
      hover.removeEventListener?.("change", update);
      reduced.removeEventListener?.("change", update);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (!enabled) {
      delete root.dataset.cursorMode;
      return undefined;
    }
    root.dataset.cursorMode = "custom";
    let frame = 0;
    let last = null;

    const place = (clientX, clientY, target) => {
      x.set(clientX);
      y.set(clientY);
      const info = resolve(target, clientX, clientY);
      setMode(info.mode);
      setLabel(info.label || "");
      if (info.dock) {
        const rect = info.dock;
        cx.set(rect.left + rect.width / 2);
        cy.set(rect.top + rect.height / 2);
        w.set(rect.width + 14);
        h.set(rect.height + 14);
        r.set(info.radius);
        setDocked(true);
      } else {
        const size = SIZES[info.mode] || SIZES.default;
        cx.set(clientX);
        cy.set(clientY);
        w.set(size);
        h.set(size);
        r.set(size / 2);
        setDocked(false);
      }
    };
    const apply = () => {
      frame = 0;
      if (last) place(last.clientX, last.clientY, last.target);
    };
    const onMove = (event) => {
      if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") {
        setHidden(true);
        return;
      }
      last = { clientX: event.clientX, clientY: event.clientY, target: event.target };
      setHidden(false);
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onDown = (event) => { if (event.pointerType !== "touch") setDown(true); };
    const onUp = () => setDown(false);
    const onOut = (event) => { if (!event.relatedTarget) setHidden(true); };
    /* The world can move under a still pointer (chapter travel, slides) — re-read context. */
    const refresh = window.setInterval(() => {
      if (!last) return;
      const target = document.elementFromPoint(last.clientX, last.clientY);
      if (target) place(last.clientX, last.clientY, target);
    }, 450);

    window.addEventListener("pointermove", onMove, { passive: true, capture: true });
    window.addEventListener("pointerdown", onDown, { passive: true, capture: true });
    window.addEventListener("pointerup", onUp, { passive: true, capture: true });
    window.addEventListener("pointercancel", onUp, { passive: true, capture: true });
    document.addEventListener("mouseout", onOut);
    return () => {
      delete root.dataset.cursorMode;
      cancelAnimationFrame(frame);
      window.clearInterval(refresh);
      window.removeEventListener("pointermove", onMove, { capture: true });
      window.removeEventListener("pointerdown", onDown, { capture: true });
      window.removeEventListener("pointerup", onUp, { capture: true });
      window.removeEventListener("pointercancel", onUp, { capture: true });
      document.removeEventListener("mouseout", onOut);
    };
  }, [enabled, x, y, cx, cy, w, h, r]);

  if (!enabled) return null;
  return <div className="tcur" data-mode={mode} data-docked={docked ? "true" : "false"} data-hidden={hidden ? "true" : "false"} data-down={down ? "true" : "false"} aria-hidden="true" data-testid="telemetry-cursor">
    <motion.div className="tcur-ring" style={{ left: ringLeft, top: ringTop, width: ringW, height: ringH, borderRadius: ringR }}>
      <span className="tcur-label" data-testid="telemetry-cursor-label">{label}</span>
    </motion.div>
    <motion.div className="tcur-dot" style={{ x: dotX, y: dotY }} />
  </div>;
};
