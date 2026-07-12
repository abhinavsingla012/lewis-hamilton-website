import { motion } from "framer-motion";

const peakMetrics = [
  { key: "wins", label: "WIN PEAK" },
  { key: "podiums", label: "PODIUM PEAK" },
  { key: "poles", label: "POLE PEAK" },
];

export const TimelineStory = ({ active, peaks, story, titleContext, reduceMotion }) => <motion.aside
  key={`story-${active.year}`}
  className="timeline-v5-story"
  initial={reduceMotion ? false : { opacity: 0, x: -12 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: reduceMotion ? .01 : .4, ease: [0.22, 1, 0.36, 1] }}
  data-testid="timeline-season-story"
>
  <p className="timeline-v5-story-overline"><span>SEASON STORY / {active.year}</span><i data-testid="timeline-title-context">{titleContext}</i></p>
  <h3 data-testid="timeline-story-headline">{story.headline}</h3>
  <p className="timeline-v5-story-copy" data-testid="timeline-story-narrative">{story.narrative}</p>
  <div className="timeline-v5-moment" data-testid="timeline-signature-moment"><span>SIGNATURE MOMENT</span><strong>{story.moment}</strong></div>
  <div className="timeline-v5-peaks" data-testid="timeline-peak-comparison">
    {peakMetrics.map(({ key, label }) => <div key={key} data-testid={`timeline-${key}-peak-comparison`}>
      <span>{label}</span><i><motion.b initial={false} animate={{ scaleX: peaks[key] ? active[key] / peaks[key] : 0 }} transition={{ duration: reduceMotion ? .01 : .4 }} /></i><strong>{active[key]} / {peaks[key]}</strong>
    </div>)}
  </div>
</motion.aside>;