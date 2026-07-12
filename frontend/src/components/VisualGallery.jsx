import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { gallery, IMAGES } from "../data/content";

const milestones = [
  { number: "001", year: "2007", race: "CANADA", label: "THE FIRST", note: "Victory in only his sixth Formula 1 start." },
  { number: "009", year: "2008", race: "CHAMPION", label: "BY ONE POINT", note: "The title secured at the final corner in Brazil." },
  { number: "092", year: "2020", race: "PORTUGAL", label: "RECORD BROKEN", note: "Past Schumacher. Alone at the top of the wins list." },
  { number: "100", year: "2021", race: "RUSSIA", label: "THE CENTURY", note: "The first driver in Formula 1 history to reach 100 wins." },
  { number: "104", year: "2024", race: "BRITAIN", label: "HOME AGAIN", note: "945 days of waiting ended at Silverstone." },
  { number: "105", year: "2024", race: "BELGIUM", label: "THE LATEST", note: "A fifth victory through Spa-Francorchamps." },
];

export const VisualGallery = () => {
  const strip = useRef(null);
  const move = (direction) => {
    if (!strip.current) return;
    const step = Math.min(strip.current.clientWidth * .78, 900);
    const target = Math.max(0, Math.min(strip.current.scrollWidth - strip.current.clientWidth, strip.current.scrollLeft + direction * step));
    strip.current.scrollLeft = target;
  };
  return <>
    <section className="gallery-section" data-testid="visual-gallery-section"><div className="gallery-heading"><span className="section-head-marker-slot" aria-hidden="true" /><h2>RACING<br/><i>in frames.</i></h2><div><button onClick={() => move(-1)} aria-label="Previous gallery images" data-testid="gallery-previous-button"><ArrowLeft/></button><button onClick={() => move(1)} aria-label="Next gallery images" data-testid="gallery-next-button"><ArrowRight/></button></div></div><div ref={strip} className="gallery-strip" data-testid="gallery-image-strip">{gallery.map((item, index) => <figure className={`gallery-card ${item.shape}`} key={item.label} data-testid={`gallery-card-${index + 1}`}><img src={item.image} alt={item.label} /><figcaption><strong>{item.label}</strong><span>{item.meta}</span></figcaption></figure>)}</div></section>
    <section className="records-section" data-testid="career-records-section"><img src={IMAGES.trophies} alt="Seven championship trophies" data-testid="records-trophy-image"/><div className="records-shade"/><div className="records-copy"><h2>NOT JUST<br/>IN HISTORY.<br/><i>Above it.</i></h2><div className="record-grid"><div data-testid="record-career-wins"><strong>105</strong><span>ALL-TIME GRAND PRIX WINS</span></div><div data-testid="record-career-poles"><strong>104</strong><span>ALL-TIME POLE POSITIONS</span></div><div data-testid="record-winning-circuits"><strong>31</strong><span>DIFFERENT WINNING CIRCUITS</span></div><div data-testid="record-world-titles"><strong>7</strong><span>WORLD CHAMPIONSHIPS</span></div></div></div></section>
    <section className="milestones-section" data-testid="milestone-victories-section"><div className="milestones-title"><h2>SIX MOMENTS<br/>THAT MOVED<br/><i>the limit.</i></h2></div><div className="milestone-grid">{milestones.map((item, index) => <article key={item.number} data-testid={`milestone-card-${index + 1}`}><span className="milestone-number">#{item.number}</span><div><span>{item.year} / {item.race}</span><h3>{item.label}</h3><p>{item.note}</p></div></article>)}</div></section>
  </>;
};