import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { reactorRecords } from "../data/reactorRecords";

const OdometerCharacter = ({ character, index, reduced }) => {
  if (!/\d/.test(character)) return <span className="odometer-static" data-testid={`odometer-static-${index}`}>{character}</span>;
  const digit = Number(character);
  return <span className="odometer-window" data-testid={`odometer-drum-${index}`}><motion.span className="odometer-column" initial={reduced ? false : { y: "0%" }} animate={{ y: `${digit * -10}%` }} transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 62, damping: 16, mass: 1, delay: index * .035 }}>{Array.from({ length: 10 }, (_, number) => <i key={number}>{number}</i>)}</motion.span></span>;
};

export const RecordsMonument = ({ isActive }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const indexRef = useRef(0);
  const reactorRef = useRef(null);
  const dragRef = useRef({ active: false, x: 0, y: 0, moved: false });
  const reduceMotion = useReducedMotion();
  const record = reactorRecords[activeIndex];
  const select = useCallback((index) => {
    const next = (index + reactorRecords.length) % reactorRecords.length;
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

  const onPointerDown = (event) => {
    if (event.pointerType === "touch" || event.target.closest("button")) return;
    dragRef.current = { active: true, x: event.clientX, y: event.clientY, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event) => {
    if (!dragRef.current.active || !reactorRef.current) return;
    if (Math.hypot(event.clientX - dragRef.current.x, event.clientY - dragRef.current.y) < 8) return;
    dragRef.current.moved = true;
    const bounds = reactorRef.current.getBoundingClientRect();
    const angle = (Math.atan2(event.clientY - (bounds.top + bounds.height / 2), event.clientX - (bounds.left + bounds.width / 2)) * 180 / Math.PI + 450) % 360;
    select(Math.round(angle / 30) % reactorRecords.length);
  };
  const onPointerUp = () => { dragRef.current.active = false; };

  return <section className="records-section record-reactor" data-record-id={record.id} data-testid="career-records-section">
    <div className="reactor-room" aria-hidden="true"><span/><span/><span/></div>
    <div className="reactor-top-plate" data-testid="reactor-system-label"><b>UNIT // 44</b><span>FIA ALL-TIME REGISTER</span><i>SYS.ACTIVE</i></div>
    <div className="reactor-live-status" aria-live="polite" data-testid="reactor-live-status">{record.value} — {record.title}. {record.status}. {record.detail}</div>

    <div className="record-reactor-core" ref={reactorRef} tabIndex={0} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} data-testid="reactor-dial" data-cursor="drag" aria-label="Twelve-position record selector">
      <motion.div className="reactor-gear-ring" animate={{ rotate: activeIndex * -30 }} transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 50, damping: 20 }}/>
      <div className="reactor-bolt-ring" aria-hidden="true">{Array.from({ length: 24 }, (_, index) => <i style={{ "--bolt-angle": `${index * 15}deg` }} key={index}/>)}</div>
      <motion.div className="reactor-selector-arm" animate={{ rotate: activeIndex * 30 + 180 }} transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 58, damping: 18 }} aria-hidden="true"><span/></motion.div>

      <svg className="reactor-gauges" viewBox="0 0 600 600" aria-hidden="true"><circle cx="300" cy="300" r="222"/><motion.circle className="gauge-live" cx="300" cy="300" r="222" pathLength="1" strokeDasharray=".66 .34" animate={{ rotate: activeIndex * 30 }} transition={{ duration: reduceMotion ? 0 : .45 }}/><path d="M138 418 A198 198 0 0 1 463 418"/><path d="M175 153 A198 198 0 0 1 425 153"/></svg>

      <nav className="reactor-node-ring" aria-label="Primary Hamilton records" data-testid="reactor-record-navigation">{reactorRecords.map((item, index) => <button className={index === activeIndex ? "is-active" : ""} style={{ "--node-angle": `${index * 30}deg` }} onClick={() => select(index)} aria-label={`${item.value} ${item.title}`} aria-pressed={index === activeIndex} key={item.id} data-testid={`dial-node-${index + 1}`}><span>{String(index + 1).padStart(2, "0")}</span><i>{item.dial}</i></button>)}</nav>

      <div className="reactor-face">
        <div className="reactor-face-label"><span>RECORD OUTPUT</span><b data-testid="reactor-record-code">{record.code}</b></div>
        <div className="reactor-odometer" aria-hidden="true" data-testid="reactor-odometer">{record.value.split("").map((character, index) => <OdometerCharacter character={character} index={index} reduced={reduceMotion} key={`${record.id}-${index}-${character}`}/>)}</div>
        <div className="reactor-timing-strip" data-testid="timing-strip-label">{record.status}</div>
        <div className="reactor-warning-lights" aria-hidden="true"><span/><span/><span/><span/><span/></div>
      </div>
    </div>

    <aside className="reactor-specification" data-testid="reactor-record-specification">
      <div className="spec-rivet" aria-hidden="true"/><div className="spec-rivet" aria-hidden="true"/>
      <span data-testid="records-selected-count">RECORD {String(activeIndex + 1).padStart(2, "0")} / 12</span>
      <strong data-testid="records-primary-value">{record.value}</strong>
      <h2 data-testid="records-primary-title">{record.title}</h2>
      <b data-testid="records-primary-context">{record.status}</b>
      <p data-testid="records-primary-detail">{record.detail}</p>
      <div className="spec-barcode" aria-hidden="true">|||| ||| || |||| | ||| ||</div>
    </aside>

    <div className="reactor-record-rail" data-testid="reactor-record-rail">{reactorRecords.map((item, index) => <span className={index === activeIndex ? "is-active" : ""} key={item.id} data-testid={`reactor-rail-${index + 1}`}><i/>{item.code}</span>)}</div>
  </section>;
};