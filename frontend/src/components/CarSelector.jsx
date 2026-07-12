import { ChevronLeft, ChevronRight } from "lucide-react";

export const CarSelector = ({ cars, activeIndex, onChange }) => <nav className="cars-v2-selector" aria-label="Career-defining cars" data-testid="career-car-selector">
  <button type="button" onClick={() => onChange(activeIndex - 1)} disabled={activeIndex === 0} aria-label="Previous car" data-testid="cars-previous-button"><ChevronLeft /></button>
  <div className="cars-v2-selector-rail">
    {cars.map((car, index) => <button type="button" key={car.id} className={index === activeIndex ? "is-active" : ""} style={{ "--selector-color": car.teamColor }} onClick={() => onChange(index)} aria-current={index === activeIndex ? "step" : undefined} data-testid={`cars-select-${car.year}-button`}><span>{car.year}</span><strong>{car.model}</strong></button>)}
  </div>
  <span className="cars-v2-counter" data-testid="cars-active-counter">{String(activeIndex + 1).padStart(2, "0")} / {String(cars.length).padStart(2, "0")}</span>
  <button type="button" onClick={() => onChange(activeIndex + 1)} disabled={activeIndex === cars.length - 1} aria-label="Next car" data-testid="cars-next-button"><ChevronRight /></button>
</nav>;