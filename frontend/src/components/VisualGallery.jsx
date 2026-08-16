import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { gallery } from "../data/content";
import { GalleryEditorialSlide } from "./GalleryEditorialSlide";
import { registerChapterStep } from "../lib/spatialInput";

export const VisualGallery = ({ isActive, direction: enterDirection = 1 }) => {
  const startIndex = enterDirection < 0 ? gallery.length - 1 : 0;
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [direction, setDirection] = useState(1);
  const activeIndexRef = useRef(startIndex);
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
    window.__spatialGo?.(key);
  }, []);

  const move = useCallback((step) => {
    const current = activeIndexRef.current;
    if (step > 0 && current === gallery.length - 1) {
      releaseTo("records");
      return;
    }
    if (step < 0 && current === 0) {
      releaseTo("cars");
      return;
    }
    setGalleryIndex(current + step);
  }, [releaseTo, setGalleryIndex]);

  useEffect(() => {
    gallery.forEach(({ image }) => { const preload = new Image(); preload.src = image; });
  }, []);

  /* The spatial engine owns scrolling; the gallery only consumes steps while it is active. */
  useEffect(() => {
    if (!isActive) return undefined;
    releasing.current = false;
    return registerChapterStep("gallery", (step) => {
      const current = activeIndexRef.current;
      if (step > 0 && current === gallery.length - 1) return false;
      if (step < 0 && current === 0) return false;
      setGalleryIndex(current + step);
      return true;
    });
  }, [isActive, setGalleryIndex]);

  return <section className="gallery-section gallery-v3" style={{ "--issue-bg": activeItem.palette.bg, "--issue-ink": activeItem.palette.ink, "--issue-accent": activeItem.palette.accent }} data-active-mode={activeItem.id} data-gallery-active={isActive ? "true" : "false"} data-testid="visual-gallery-section">
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
  </section>;
};
