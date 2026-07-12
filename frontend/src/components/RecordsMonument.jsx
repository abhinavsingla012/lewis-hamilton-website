import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { recordCategories } from "../data/records";

const formatValue = (value, decimals) => new Intl.NumberFormat("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);

const AnimatedValue = ({ record, testId }) => {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(record.value);
  useEffect(() => {
    if (reduceMotion) { setDisplay(record.value); return undefined; }
    let frame;
    const start = performance.now();
    const decimals = record.value.includes(".") ? 1 : 0;
    const tick = (time) => {
      const progress = Math.min((time - start) / 1050, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(formatValue(record.numeric * eased, decimals));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [record, reduceMotion]);
  return <strong data-testid={testId}>{display}{record.suffix && <em>{record.suffix}</em>}</strong>;
};

export const RecordsMonument = ({ isActive }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const indexRef = useRef(0);
  const reduceMotion = useReducedMotion();
  const category = recordCategories[activeIndex];
  const select = useCallback((index) => {
    const next = (index + recordCategories.length) % recordCategories.length;
    indexRef.current = next;
    setActiveIndex(next);
  }, []);

  useEffect(() => {
    if (!isActive) return undefined;
    const onKeyDown = (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key) || event.target?.closest?.("input, textarea, select")) return;
      event.preventDefault();
      event.stopPropagation();
      select(indexRef.current + (event.key === "ArrowRight" ? 1 : -1));
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [isActive, select]);

  return <section className="records-section records-monument" style={{ "--record-bg": category.palette.bg, "--record-ink": category.palette.ink, "--record-accent": category.palette.accent, "--record-plane": category.palette.plane }} data-record-category={category.id} data-testid="career-records-section">
    <div className="records-architectural-field" aria-hidden="true"><span/><span/><span/><span/></div>
    <svg className="records-geometry" viewBox="0 0 1000 620" aria-hidden="true"><path d="M60 475 C175 80 420 65 560 260 C704 461 838 472 950 138"/><path d="M-20 340 C200 560 455 548 640 278 C744 126 878 90 1030 184"/><circle cx="555" cy="308" r="214"/><circle cx="555" cy="308" r="127"/></svg>
    <div className="records-vertical-word" aria-hidden="true">UNTOUCHABLE</div>

    <motion.div className="records-sculpture" key={category.id} initial={reduceMotion ? { opacity: 0 } : { opacity: .25, scale: .86, rotateX: 18, y: 40 }} animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }} transition={{ duration: reduceMotion ? .15 : .68, ease: [0.22, 1, 0.36, 1] }}>
      <div className="records-primary" data-testid={`records-primary-${category.id}`}>
        <span className="records-index">ARCHIVE / {category.index}</span>
        <div className="records-number-stack" aria-label={`${category.primary.value}${category.primary.suffix || ""} ${category.primary.title}`}>
          <span aria-hidden="true">{category.primary.value}{category.primary.suffix || ""}</span>
          <AnimatedValue record={category.primary} testId="records-primary-value" />
        </div>
        <h2 data-testid="records-primary-title">{category.primary.title}</h2>
        <div className="records-primary-context"><b data-testid="records-primary-context">{category.primary.context}</b><span data-testid="records-primary-detail">{category.primary.detail}</span></div>
      </div>

      <p className="records-statement" data-testid="records-category-statement">{category.statement}</p>
      <div className="records-orbit" data-testid="records-orbit-context">{category.orbit.map((item, index) => <span key={item} style={{ "--orbit-index": index }} data-testid={`records-orbit-${category.id}-${index + 1}`}>{item}</span>)}</div>
      <div className="records-satellites" data-testid="records-secondary-list">{category.records.map((record, index) => <article className={`records-satellite satellite-${index + 1}`} key={record.id} data-testid={`record-${category.id}-${record.id}`}>
        <strong data-testid={`record-${category.id}-${record.id}-value`}>{record.value}</strong><span data-testid={`record-${category.id}-${record.id}-label`}>{record.label}</span><small data-testid={`record-${category.id}-${record.id}-detail`}>{record.detail}</small>
      </article>)}</div>
    </motion.div>

    <nav className="records-constellation" aria-label="Record categories" data-testid="records-category-navigation">
      <div className="constellation-line" aria-hidden="true"><motion.span animate={{ scaleX: activeIndex / (recordCategories.length - 1) }} transition={{ duration: reduceMotion ? 0 : .45, ease: [0.22, 1, 0.36, 1] }}/></div>
      {recordCategories.map((item, index) => <button className={index === activeIndex ? "is-active" : ""} onClick={() => select(index)} aria-pressed={index === activeIndex} aria-label={`Show ${item.label} records`} key={item.id} data-testid={`records-category-${item.id}-button`}><i>{item.index}</i><span data-testid={`records-category-${item.id}-label`}>{item.label}</span></button>)}
    </nav>
    <div className="records-count" data-testid="records-selected-count"><strong>{category.index}</strong><span>/ 05</span></div>
  </section>;
};