import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Gauge, Trophy, Zap } from "lucide-react";
import { careerCars } from "../data/careerCars";
import { CarSelector } from "./CarSelector";

export const CareerCars = ({ seasons = [] }) => {
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const cars = useMemo(() => careerCars.map((car) => ({ ...car, ...(seasons.find((season) => season.year === car.year) || {}) })), [seasons]);
  const active = cars[activeIndex];
  const winRate = active.races ? Math.round((active.wins / active.races) * 100) : 0;
  const moveTo = (index) => setActiveIndex(Math.max(0, Math.min(cars.length - 1, index)));

  useEffect(() => {
    [activeIndex - 1, activeIndex + 1].forEach((index) => {
      if (!cars[index]) return;
      const image = new Image();
      image.src = cars[index].image;
    });
  }, [activeIndex, cars]);

  useEffect(() => {
    const handleKey = (event) => {
      const viewport = sectionRef.current?.closest(".circuit-viewport");
      if (viewport?.dataset.active !== "cars" || viewport?.dataset.traveling === "true") return;
      if (event.key === "ArrowRight") { event.preventDefault(); setActiveIndex((current) => Math.min(cars.length - 1, current + 1)); }
      if (event.key === "ArrowLeft") { event.preventDefault(); setActiveIndex((current) => Math.max(0, current - 1)); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [cars.length]);

  return <section ref={sectionRef} className="cars-section cars-v2" style={{ "--car-era-color": active.teamColor }} data-testid="career-cars-section">
    <motion.div key={`backdrop-${active.id}`} className="cars-v2-backdrop" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduceMotion ? .01 : .5 }} aria-hidden="true"><img src={active.image} alt="" style={{ objectPosition: active.imagePosition }} /></motion.div>
    <div className="cars-v2-scrim" aria-hidden="true" /><div className="cars-v2-grid" aria-hidden="true" />
    <motion.img key={`car-${active.id}`} className="cars-v2-car" src={active.image} alt={`${active.year} ${active.team} ${active.model}`} style={{ objectPosition: active.imagePosition }} initial={reduceMotion ? false : { opacity: 0, x: 22, scale: 1.025 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: reduceMotion ? .01 : .55, ease: [0.22, 1, 0.36, 1] }} decoding="async" draggable="false" data-testid="cars-active-image" />
    <span className="cars-v2-model-ghost" aria-hidden="true">{active.model}</span>

    <motion.header key={`identity-${active.id}`} className="cars-v2-identity" initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? .01 : .35 }}>
      <p data-testid="cars-active-era"><i />{active.team} · {active.year}</p><h2 data-testid="cars-active-model">{active.model}</h2><strong data-testid="cars-active-chapter">{active.chapter}</strong>
      <p className="cars-v2-significance" data-testid="cars-active-significance">{active.significance}</p><span className="cars-v2-moment" data-testid="cars-active-moment">{active.moment}</span>
    </motion.header>

    <motion.aside key={`metric-${active.id}`} className="cars-v2-dominance" initial={reduceMotion ? false : { opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: reduceMotion ? .01 : .38 }}>
      <p>HAMILTON / SEASON OUTPUT</p><div><strong data-testid="cars-active-hero-value">{active.heroValue || String(active.wins).padStart(2, "0")}</strong><span data-testid="cars-active-hero-label">{active.heroLabel || "WINS"}</span></div><b data-testid="cars-active-outcome"><Trophy />{active.outcome}</b>
    </motion.aside>

    <div className="cars-v2-data" data-testid="cars-active-data">
      <div className="cars-v2-stats"><div data-testid="cars-active-podiums"><strong>{active.podiums}</strong><span>PODIUMS</span></div><div data-testid="cars-active-poles"><strong>{active.poles}</strong><span>POLES</span></div><div data-testid="cars-active-win-rate"><strong>{winRate}%</strong><span>WIN RATE</span></div><div data-testid="cars-active-championship-position"><strong>P{active.position}</strong><span>STANDING</span></div></div>
      <div className="cars-v2-technical"><div><Zap aria-hidden="true"/><span>POWER UNIT</span><strong data-testid="cars-active-power-unit">{active.powerUnit}</strong></div><div><Gauge aria-hidden="true"/><span>ENGINEERING IDENTITY</span><strong data-testid="cars-active-engineering">{active.engineering}</strong></div></div>
      <a href={active.source} target="_blank" rel="noreferrer" data-testid="cars-active-photo-credit">PHOTO / {active.credit} · {active.license}</a>
    </div>

    <CarSelector cars={cars} activeIndex={activeIndex} onChange={moveTo} />
  </section>;
};