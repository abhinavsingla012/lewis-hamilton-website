import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { gallery } from "../data/content";
import { GalleryEditorialSlide } from "./GalleryEditorialSlide";
import { RecordsMonument } from "./RecordsMonument";

const milestones = [
  { number: "001", year: "2007", race: "CANADA", label: "THE FIRST", note: "Victory in only his sixth Formula 1 start." },
  { number: "009", year: "2008", race: "CHAMPION", label: "BY ONE POINT", note: "The title secured at the final corner in Brazil." },
  { number: "092", year: "2020", race: "PORTUGAL", label: "RECORD BROKEN", note: "Past Schumacher. Alone at the top of the wins list." },
  { number: "100", year: "2021", race: "RUSSIA", label: "THE CENTURY", note: "The first driver in Formula 1 history to reach 100 wins." },
  { number: "104", year: "2024", race: "BRITAIN", label: "HOME AGAIN", note: "945 days of waiting ended at Silverstone." },
  { number: "105", year: "2024", race: "BELGIUM", label: "THE LATEST", note: "A fifth victory through Spa-Francorchamps." },
];

const GALLERY_STOP = 0.435;

export const VisualGallery = ({ activeKey, isActive }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const activeIndexRef = useRef(0);
  const wheelTotal = useRef(0);
  const wheelLocked = useRef(false);
  const touchY = useRef(null);
  const touchLocked = useRef(false);
  const unlockTimer = useRef(null);
  const previousRoute = useRef("top");
  const wasActive = useRef(false);
  const releasing = useRef(false);
  const reduceMotion = useReducedMotion();
  const activeItem = gallery[activeIndex];

  const setGalleryIndex = useCallback((index) => {
    const next = Math.max(0, Math.min(gallery.length - 1, index));
    if (next !== activeIndexRef.current) setDirection(next > activeIndexRef.current ? 1 : -1);
    activeIndexRef.current = next;
    setActiveIndex(next);
  }, []);

  const releaseTo = useCallback((key) => {
    if (releasing.current) return;
    releasing.current = true;
    window.__galleryScrollLocked = false;
    window.__hamiltonLenis?.start();
    window.__spatialGo?.(key);
  }, []);

  const move = useCallback((direction) => {
    const current = activeIndexRef.current;
    if (direction > 0 && current === gallery.length - 1) {
      releaseTo("records");
      return;
    }
    if (direction < 0 && current === 0) {
      releaseTo("cars");
      return;
    }
    setGalleryIndex(current + direction);
  }, [releaseTo, setGalleryIndex]);

  useEffect(() => {
    gallery.forEach(({ image }) => { const preload = new Image(); preload.src = image; });
  }, []);

  useEffect(() => {
    if (activeKey !== "gallery") previousRoute.current = activeKey;
  }, [activeKey]);

  useEffect(() => {
    if (isActive && !wasActive.current) {
      const enteredFromLaterChapter = ["records", "milestones", "tracks", "moment", "quotes", "victories", "footer"].includes(previousRoute.current);
      setGalleryIndex(enteredFromLaterChapter ? gallery.length - 1 : 0);
    }
    if (!isActive) releasing.current = false;
    wasActive.current = isActive;
  }, [isActive, setGalleryIndex]);

  useEffect(() => {
    if (!isActive) return undefined;
    const runway = document.querySelector("[data-testid='unified-spatial-experience']");
    if (!runway) return undefined;
    const target = runway.offsetTop + GALLERY_STOP * (runway.offsetHeight - window.innerHeight);
    if (Math.abs(window.scrollY - target) > 1) {
      requestAnimationFrame(() => window.__spatialGo?.("gallery"));
    }

    window.__galleryScrollLocked = true;
    window.__hamiltonLenis?.stop();
    const lockWheel = () => {
      wheelLocked.current = true;
      window.clearTimeout(unlockTimer.current);
      unlockTimer.current = window.setTimeout(() => {
        wheelLocked.current = false;
        wheelTotal.current = 0;
      }, reduceMotion ? 280 : 620);
    };
    const onWheel = (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      if (wheelLocked.current) return;
      wheelTotal.current += event.deltaY;
      if (Math.abs(wheelTotal.current) < 72) return;
      const direction = wheelTotal.current > 0 ? 1 : -1;
      wheelTotal.current = 0;
      lockWheel();
      move(direction);
    };
    const onTouchStart = (event) => {
      touchY.current = event.touches[0]?.clientY ?? null;
      touchLocked.current = false;
    };
    const onTouchMove = (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      const nextY = event.touches[0]?.clientY;
      if (touchY.current === null || nextY === undefined || touchLocked.current) return;
      const distance = touchY.current - nextY;
      if (Math.abs(distance) < 46) return;
      touchLocked.current = true;
      move(distance > 0 ? 1 : -1);
    };
    const onTouchEnd = () => {
      touchY.current = null;
      window.setTimeout(() => { touchLocked.current = false; }, 180);
    };
    const onKeyDown = (event) => {
      const downKeys = ["ArrowDown", "PageDown", " "];
      const upKeys = ["ArrowUp", "PageUp"];
      if (![...downKeys, ...upKeys].includes(event.key)) return;
      if (event.target?.closest?.("input, select, textarea")) return;
      if (event.repeat) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      event.target?.closest?.("button, a")?.blur?.();
      move(downKeys.includes(event.key) ? 1 : -1);
    };
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true, capture: true });
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => {
      window.clearTimeout(unlockTimer.current);
      wheelLocked.current = false;
      wheelTotal.current = 0;
      window.__galleryScrollLocked = false;
      window.__hamiltonLenis?.start();
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
      window.removeEventListener("touchend", onTouchEnd, { capture: true });
      window.removeEventListener("keydown", onKeyDown, { capture: true });
    };
  }, [isActive, move, reduceMotion, setGalleryIndex]);

  return <>
    <section className="gallery-section gallery-v3" style={{ "--issue-bg": activeItem.palette.bg, "--issue-ink": activeItem.palette.ink, "--issue-accent": activeItem.palette.accent }} data-active-mode={activeItem.id} data-gallery-active={isActive ? "true" : "false"} data-gallery-route={activeKey} data-testid="visual-gallery-section">
      <div className="gallery-v3-stage" data-testid="gallery-scroll-container">
        <div className="gallery-v3-status" aria-live="polite">
          <span data-testid="gallery-collection-label">44 — THE STYLE ARCHIVE</span>
          <span data-testid="gallery-active-category">{activeItem.category}</span>
          <span data-testid="gallery-active-title">{activeItem.title}</span>
          <span data-testid="gallery-active-description">{activeItem.description}</span>
          <span data-testid="gallery-active-location">{activeItem.location} — {activeItem.venue}</span>
          <span data-testid="gallery-active-credit">{activeItem.year} — {activeItem.designer}</span>
          <span data-testid="gallery-sequence-label">{String(activeIndex + 1).padStart(2, "0")} — {String(gallery.length).padStart(2, "0")}</span>
        </div>
        <div className="gallery-v3-live" data-testid="gallery-photo-active"><GalleryEditorialSlide item={activeItem} index={activeIndex} count={gallery.length} direction={direction} reduceMotion={reduceMotion} gallery={gallery} /></div>

        <nav className="gallery-v3-index" aria-label="Gallery issue index" data-testid="gallery-mode-navigation">
          <div className="gallery-v3-index-line" aria-hidden="true"><motion.span animate={{ scaleX: (activeIndex + 1) / gallery.length }} transition={{ duration: reduceMotion ? 0 : .45, ease: [0.22, 1, 0.36, 1] }} /></div>
          {gallery.map((item, index) => <button
            className={index === activeIndex ? "is-active" : ""}
            key={item.id}
            onClick={() => setGalleryIndex(index)}
            aria-label={`Show ${item.title}`}
            aria-pressed={index === activeIndex}
            data-testid={`gallery-mode-button-${item.id}`}
          ><span>{String(index + 1).padStart(2, "0")}</span></button>)}
        </nav>

        <div className="gallery-v3-controls">
          <button onClick={() => move(-1)} aria-label={activeIndex === 0 ? "Return to Cars" : "Previous gallery mode"} data-testid="gallery-previous-button"><ArrowUp /><span>{activeIndex === 0 ? "CARS" : "PREVIOUS"}</span></button>
          <button onClick={() => move(1)} aria-label={activeIndex === gallery.length - 1 ? "Continue to Records" : "Next gallery mode"} data-testid={activeIndex === gallery.length - 1 ? "gallery-next-release" : "gallery-next-button"}><span>{activeIndex === gallery.length - 1 ? "RECORDS" : "NEXT"}</span><ArrowDown /></button>
        </div>
      </div>
    </section>
    <RecordsMonument isActive={activeKey === "records"} />
    <section className="milestones-section" data-testid="milestone-victories-section"><div className="milestones-title"><h2>SIX MOMENTS<br/>THAT MOVED<br/><i>the limit.</i></h2></div><div className="milestone-grid">{milestones.map((item, index) => <article key={item.number} data-testid={`milestone-card-${index + 1}`}><span className="milestone-number">#{item.number}</span><div><span>{item.year} / {item.race}</span><h3>{item.label}</h3><p>{item.note}</p></div></article>)}</div></section>
  </>;
};