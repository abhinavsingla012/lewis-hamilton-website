import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const motionState = (direction, layout, reduced) => reduced ? {
  initial: { opacity: .92 }, animate: { opacity: 1 },
} : layout === "artifact" ? {
  initial: { opacity: .58, scale: .84, rotate: direction * 4 }, animate: { opacity: 1, scale: 1, rotate: 0 },
} : layout === "diagonal" ? {
  initial: { opacity: .52, x: direction > 0 ? "11%" : "-11%", skewX: direction > 0 ? -3 : 3 }, animate: { opacity: 1, x: "0%", skewX: 0 },
} : layout === "contact" || layout === "social" ? {
  initial: { opacity: .54, y: direction > 0 ? "9%" : "-9%", rotate: direction * 1.6, scale: .975 }, animate: { opacity: 1, y: "0%", rotate: 0, scale: 1 },
} : {
  initial: { opacity: .56, y: direction > 0 ? "8%" : "-8%", scale: .985 }, animate: { opacity: 1, y: "0%", scale: 1 },
};

const EditorialImage = ({ item, suffix = "primary" }) => <img src={item.image} alt={item.alt} style={{ objectPosition: item.position, "--image-mobile-position": item.mobilePosition || item.position, "--detail-position": item.detailPosition || item.mobilePosition || item.position }} data-testid={`gallery-image-${item.id}-${suffix}`} />;

export const GalleryEditorialSlide = ({ item, index, count, direction, reduceMotion, gallery }) => {
  const previous = gallery[(index - 1 + count) % count];
  const next = gallery[(index + 1) % count];
  const state = motionState(direction, item.layout, reduceMotion);
  return <motion.article
      className={`gallery-issue layout-${item.layout}`}
      key={item.id}
      initial={state.initial}
      animate={state.animate}
      transition={{ duration: reduceMotion ? .12 : .48, ease: [0.22, 1, 0.36, 1] }}
      data-testid={`gallery-photo-${item.id}`}
    >
      <div className="issue-flash" aria-hidden="true" />
      <div className="issue-masthead" data-testid={`gallery-collection-label-${item.id}`}><b>44</b><span>THE STYLE ARCHIVE<br/>VOLUME ONE</span></div>

      {item.layout === "cover" && <div className="issue-cover-visual"><EditorialImage item={item} /><span aria-hidden="true">{item.word}</span></div>}
      {item.layout === "diagonal" && <div className="issue-diagonal-visual"><div className="issue-diagonal-image"><EditorialImage item={item} /></div><span aria-hidden="true">{item.word}</span></div>}
      {item.layout === "poster" && <div className="issue-poster-visual"><EditorialImage item={item} /><div className="issue-poster-type" aria-hidden="true">{Array(4).fill(item.word).map((word, i) => <span key={i}>{word}</span>)}</div></div>}
      {item.layout === "contact" && <div className="issue-contact-visual">
        <figure className="contact-frame contact-before"><EditorialImage item={previous} suffix="previous" /><span>{String(index).padStart(2, "0")}</span></figure>
        <figure className="contact-frame contact-main"><EditorialImage item={item} /><span>{String(index + 1).padStart(2, "0")}</span></figure>
        <figure className="contact-frame contact-after"><EditorialImage item={next} suffix="next" /><span>{String(index + 2).padStart(2, "0")}</span></figure>
      </div>}
      {item.layout === "artifact" && <div className="issue-artifact-visual"><div className="artifact-orbit" aria-hidden="true"/><EditorialImage item={item} /><span aria-hidden="true">44 / 44 / 44</span></div>}
      {item.layout === "social" && <div className="issue-social-visual">
        <figure className="social-hero"><EditorialImage item={item} /></figure>
        <figure className="social-detail"><EditorialImage item={item} suffix="detail" /></figure>
        <span className="social-stamp" aria-hidden="true">SAVED<br/>TO<br/>FAVOURITES</span>
      </div>}

      <header className="issue-heading" data-testid={`gallery-active-copy-${item.id}`}>
        <span data-testid={`gallery-active-category-${item.id}`}>{item.category}</span>
        <h2 data-testid={`gallery-active-title-${item.id}`}>{item.title}</h2>
        <p data-testid={`gallery-active-description-${item.id}`}>{item.description}</p>
      </header>
      <div className="issue-location" data-testid={`gallery-active-location-${item.id}`}><MapPin/><span>{item.location}</span><b>{item.venue}</b></div>
      <div className="issue-credit" data-testid={`gallery-active-credit-${item.id}`}><span>{item.year}</span><b>{item.designer}</b></div>
      <div className="issue-counter" data-testid={`gallery-sequence-label-${item.id}`}><strong>{String(index + 1).padStart(2, "0")}</strong><span>— {String(count).padStart(2, "0")}</span></div>
      <div className="issue-edge-copy" aria-hidden="true">LEWIS HAMILTON / SELF EXPRESSION / LOCATION ARCHIVE / {item.year}</div>
    </motion.article>;
};