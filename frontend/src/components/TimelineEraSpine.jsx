const careerEras = [
  { key: "mclaren", label: "McLAREN", range: "2007—12", start: 0, end: 5, color: "#ff8700" },
  { key: "mercedes", label: "MERCEDES", range: "2013—24", start: 6, end: 17, color: "#00d2be" },
  { key: "ferrari", label: "FERRARI", range: "2025—", start: 18, end: 18, color: "#e10600" },
];

export const TimelineEraSpine = ({ activeIndex, data, onSelect }) => <nav className="timeline-v5-era-spine" aria-label="Hamilton team eras" data-testid="timeline-era-spine">
  {careerEras.map((era) => {
    const active = activeIndex >= era.start && activeIndex <= era.end;
    const titles = data.slice(era.start, era.end + 1).filter((season) => season.champion);
    return <button key={era.key} type="button" className={active ? "is-active" : ""} style={{ "--era-color": era.color }} aria-pressed={active} onClick={() => onSelect(era.start)} data-testid={`timeline-era-${era.key}-button`}>
      <span>{era.label}<small>{era.range}</small></span>
      <i>{titles.map((season) => <b key={season.year} title={`${season.year} world title`} data-testid={`timeline-era-${era.key}-title-${season.year}`} />)}</i>
    </button>;
  })}
</nav>;