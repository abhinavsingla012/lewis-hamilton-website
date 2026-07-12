import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { gallery, IMAGES } from "../data/content";

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
  const activeIndexRef = useRef(0);
  const wheelTotal = useRef(0);
  const wheelLocked = useRef(false);
  const touchY = useRef(null);
  const touchLocked = useRef(false);
  const unlockTimer = useRef(null);
  const previousRoute = useRef("top");
  const reduceMotion = useReducedMotion();
  const activeItem = gallery[activeIndex];

  const setGalleryIndex = useCallback((index) => {
    const next = Math.max(0, Math.min(gallery.length - 1, index));
    activeIndexRef.current = next;
    setActiveIndex(next);
  }, []);

  const releaseTo = useCallback((key) => {
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
    if (!isActive) return undefined;
    const runway = document.querySelector("[data-testid='unified-spatial-experience']");
    if (!runway) return undefined;
    const target = runway.offsetTop + GALLERY_STOP * (runway.offsetHeight - window.innerHeight);
    const enteredFromLaterChapter = ["records", "milestones", "tracks", "moment", "quotes", "victories", "footer"].includes(previousRoute.current);
    setGalleryIndex(enteredFromLaterChapter ? gallery.length - 1 : 0);
    if (Math.abs(window.scrollY - target) > 1) {
      setGalleryIndex(window.scrollY > target || enteredFromLaterChapter ? gallery.length - 1 : 0);
      requestAnimationFrame(() => window.__spatialGo?.("gallery"));
      return undefined;
    }

    window.__hamiltonLenis?.stop();
    const lockWheel = () => {
      wheelLocked.current = true;
      window.clearTimeout(unlockTimer.current);
      unlockTimer.current = window.setTimeout(() => {
        wheelLocked.current = false;
        wheelTotal.current = 0;
      }, reduceMotion ? 320 : 720);
    };
    const onWheel = (event) => {
      event.preventDefault();
      event.stopPropagation();
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
      if (event.target?.closest?.("button, a, input, select, textarea") && !["ArrowDown", "ArrowUp", "PageDown", "PageUp"].includes(event.key)) return;
      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        move(1);
      }
      if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        move(-1);
      }
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
      window.__hamiltonLenis?.start();
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
      window.removeEventListener("touchend", onTouchEnd, { capture: true });
      window.removeEventListener("keydown", onKeyDown, { capture: true });
    };
  }, [isActive, move, reduceMotion, setGalleryIndex]);

  return <>
    <section className="gallery-section gallery-v2" data-active-mode={activeItem.id} data-gallery-active={isActive ? "true" : "false"} data-gallery-route={activeKey} data-testid="visual-gallery-section">
      <div className="gallery-v2-grid" data-testid="gallery-scroll-container">
        <div className="gallery-v2-context">
          <span className="gallery-v2-overline" data-testid="gallery-collection-label">THE MANY FACES OF 44</span>
          <h2 data-testid="gallery-section-title"><span>SEVEN</span><i>modes.</i></h2>
          <div className="gallery-v2-active-copy" aria-live="polite" data-testid="gallery-active-copy">
            <span data-testid="gallery-active-category">{activeItem.category}</span>
            <h3 data-testid="gallery-active-title">{activeItem.title}</h3>
            <p data-testid="gallery-active-description">{activeItem.description}</p>
          </div>
          <div className="gallery-v2-sequence" data-testid="gallery-sequence-label">
            <strong>{String(activeIndex + 1).padStart(2, "0")}</strong>
            <span>/ {String(gallery.length).padStart(2, "0")}</span>
          </div>
        </div>

        <div className="gallery-v2-stack" data-testid="gallery-photo-stack">
          <div className="gallery-v2-ghost-word" aria-hidden="true">{activeItem.ghost}</div>
          {gallery.map((item, index) => {
            const state = index === activeIndex ? "active" : index < activeIndex ? "past" : "future";
            return <motion.figure
              className={`gallery-v2-frame is-${state}`}
              key={item.id}
              initial={false}
              animate={reduceMotion ? {
                opacity: state === "active" ? 1 : 0,
              } : {
                opacity: state === "active" ? 1 : state === "past" && index === activeIndex - 1 ? .16 : 0,
                scale: state === "active" ? 1 : state === "past" ? .945 : 1.065,
                y: state === "active" ? 0 : state === "past" ? -18 : 22,
                clipPath: state === "future" ? "inset(100% 0 0 0)" : "inset(0% 0 0 0)",
                filter: state === "active" ? "brightness(1) saturate(.96)" : "brightness(.42) saturate(.45)",
              }}
              transition={{ duration: reduceMotion ? .16 : .82, ease: [0.76, 0, 0.24, 1] }}
              data-testid={state === "active" ? "gallery-photo-active" : `gallery-photo-${item.id}`}
            >
              <img src={item.image} alt={item.alt} style={{ objectPosition: item.position }} data-testid={`gallery-image-${item.id}`} />
              <div className="gallery-v2-image-shade" />
              <figcaption data-testid={`gallery-caption-${item.id}`}>
                <span>{item.location}</span>
                <strong>{item.year}</strong>
              </figcaption>
            </motion.figure>;
          })}
          <span className="gallery-v2-frame-number" aria-hidden="true">{String(activeIndex + 1).padStart(2, "0")}</span>
        </div>

        <nav className="gallery-v2-rail" aria-label="Gallery modes" data-testid="gallery-mode-navigation">
          <div className="gallery-v2-progress" aria-hidden="true"><motion.span animate={{ scaleY: (activeIndex + 1) / gallery.length }} transition={{ duration: reduceMotion ? 0 : .55, ease: [0.22, 1, 0.36, 1] }} /></div>
          {gallery.map((item, index) => <button
            className={index === activeIndex ? "is-active" : ""}
            key={item.id}
            onClick={() => setGalleryIndex(index)}
            aria-label={`Show ${item.title}`}
            aria-pressed={index === activeIndex}
            data-testid={`gallery-mode-button-${item.id}`}
          ><span>{String(index + 1).padStart(2, "0")}</span><b>{item.short}</b></button>)}
        </nav>

        <div className="gallery-v2-controls">
          <button onClick={() => move(-1)} aria-label={activeIndex === 0 ? "Return to Cars" : "Previous gallery mode"} data-testid="gallery-previous-button"><ArrowUp /><span>{activeIndex === 0 ? "CARS" : "PREVIOUS"}</span></button>
          <button onClick={() => move(1)} aria-label={activeIndex === gallery.length - 1 ? "Continue to Records" : "Next gallery mode"} data-testid={activeIndex === gallery.length - 1 ? "gallery-next-release" : "gallery-next-button"}><span>{activeIndex === gallery.length - 1 ? "RECORDS" : "NEXT"}</span><ArrowDown /></button>
        </div>
      </div>
    </section>
    <section className="records-section" data-testid="career-records-section"><img src={IMAGES.trophies} alt="Seven championship trophies" data-testid="records-trophy-image"/><div className="records-shade"/><div className="records-copy"><h2>NOT JUST<br/>IN HISTORY.<br/><i>Above it.</i></h2><div className="record-grid"><div data-testid="record-career-wins"><strong>105</strong><span>ALL-TIME GRAND PRIX WINS</span></div><div data-testid="record-career-poles"><strong>104</strong><span>ALL-TIME POLE POSITIONS</span></div><div data-testid="record-winning-circuits"><strong>31</strong><span>DIFFERENT WINNING CIRCUITS</span></div><div data-testid="record-world-titles"><strong>7</strong><span>WORLD CHAMPIONSHIPS</span></div></div></div></section>
    <section className="milestones-section" data-testid="milestone-victories-section"><div className="milestones-title"><h2>SIX MOMENTS<br/>THAT MOVED<br/><i>the limit.</i></h2></div><div className="milestone-grid">{milestones.map((item, index) => <article key={item.number} data-testid={`milestone-card-${index + 1}`}><span className="milestone-number">#{item.number}</span><div><span>{item.year} / {item.race}</span><h3>{item.label}</h3><p>{item.note}</p></div></article>)}</div></section>
  </>;
};