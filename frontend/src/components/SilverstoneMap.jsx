import { useLayoutEffect, useState } from "react";
import { motion } from "framer-motion";
import { CIRCUIT_CHAPTERS, SILVERSTONE_PATH } from "../data/circuitRoute";

export const SilverstoneMap = ({ activeKey, cameraRef, onSelect, pathProgress, pathRef, racerCoreRef, racerRef }) => {
  const [points, setPoints] = useState([]);

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    setPoints(CIRCUIT_CHAPTERS.map((chapter) => path.getPointAtLength(length * chapter.path)));
  }, [pathRef]);

  const activate = (event, key) => {
    if (event.type === "keydown" && !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    onSelect(key);
  };

  return <svg className="silverstone-map" viewBox="0 0 500 500" role="img" aria-labelledby="silverstone-map-title" data-testid="silverstone-circuit-map">
    <title id="silverstone-map-title">Interactive Silverstone circuit chapter map</title>
    <defs>
      <pattern id="circuit-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" /></pattern>
      <filter id="circuit-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="500" height="500" className="circuit-grid" />
    <g className="silverstone-orientation">
    <g ref={cameraRef} className="silverstone-camera-group">
      <path d={SILVERSTONE_PATH} className="silverstone-track-shadow" />
      <path ref={pathRef} d={SILVERSTONE_PATH} className="silverstone-track" />
      <motion.path d={SILVERSTONE_PATH} className="silverstone-racing-line" style={{ pathLength: pathProgress }} />
      {CIRCUIT_CHAPTERS.map((chapter, index) => {
        const point = points[index];
        if (!point) return null;
        const labelY = index % 2 ? 29 : -24;
        return <g
          key={chapter.key}
          className={`chapter-marker ${activeKey === chapter.key ? "is-active" : ""}`}
          transform={`translate(${point.x} ${point.y})`}
          role="button"
          tabIndex={0}
          aria-label={`Open ${chapter.label} chapter`}
          onClick={(event) => activate(event, chapter.key)}
          onKeyDown={(event) => activate(event, chapter.key)}
          data-testid={`chapter-marker-${chapter.key}`}
        >
          <circle className="marker-pulse" r="8" />
          <circle className="marker-core" r="3.2" />
          <g className="marker-label" transform="rotate(90)">
            <line x1="0" y1="0" x2="0" y2={labelY > 0 ? labelY - 9 : labelY + 8} />
            <rect x="-49" y={labelY - 10} width="98" height="20" rx="2" />
            <text x="0" y={labelY + 3} textAnchor="middle">{String(index + 1).padStart(2, "0")} · {chapter.label}</text>
          </g>
        </g>;
      })}
      <circle ref={racerRef} className="circuit-racer-halo" r="10" cx="187" cy="259" />
      <circle ref={racerCoreRef} className="circuit-racer" r="4" cx="187" cy="259" data-testid="circuit-racing-pointer" />
    </g>
    </g>
  </svg>;
};