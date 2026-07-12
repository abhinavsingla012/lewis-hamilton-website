const sectorMarks = [118, 228, 366, 492, 624];

export const TimelineTelemetry = ({ activeIndex, activeYear, reduceMotion, signalIndex = 0 }) => {
  const progress = (activeIndex + 1) / 19;
  return <div className="timeline-v4-telemetry" aria-hidden="true">
    <svg viewBox="0 0 720 760" preserveAspectRatio="none">
      <path className="timeline-v4-ghost-path" d="M42 735C184 660 68 591 232 520S344 386 214 315 315 187 478 154 545 62 686 24" />
      <path className="timeline-v4-path-progress" d="M42 735C184 660 68 591 232 520S344 386 214 315 315 187 478 154 545 62 686 24" pathLength="1" style={{ strokeDasharray: `${progress} 1` }} />
      {sectorMarks.map((y, index) => <g className={signalIndex % sectorMarks.length === index ? "is-signaled" : ""} key={y} transform={`translate(${index % 2 ? 344 : 250} ${y})`}>
        <line x1="-22" x2="22" y1="0" y2="0" />
        <circle r="3" />
      </g>)}
    </svg>
    <span className="timeline-v4-sector sector-one">S1 / VELOCITY</span>
    <span className="timeline-v4-sector sector-two">S2 / CONTROL</span>
    <span className="timeline-v4-sector sector-three">S3 / LEGACY</span>
    <span className="timeline-v4-signal-year">SIGNAL {activeYear}</span>
    {!reduceMotion && <i className="timeline-v4-scan" />}
  </div>;
};