import { useEffect, useRef, useState } from "react";

const FLAIR_KEYS = new Set(["legacy", "timeline", "cars", "gallery", "records", "milestones", "tracks", "moment", "quotes", "victories", "footer"]);

export const ChapterFlair = ({ activeKey, traveling }) => {
  const [flair, setFlair] = useState(null);
  const lastRef = useRef(null);

  useEffect(() => {
    if (traveling) return;
    if (lastRef.current === activeKey) return;
    lastRef.current = activeKey;
    if (!FLAIR_KEYS.has(activeKey)) return;
    setFlair(activeKey);
    const timer = window.setTimeout(() => setFlair(null), 1750);
    return () => window.clearTimeout(timer);
  }, [activeKey, traveling]);

  if (!flair) return null;
  return <div className={`chapter-flair flair-${flair}`} aria-hidden="true" data-testid={`chapter-flair-${flair}`}>
    {flair === "tracks" && <><i /><i /><i /></>}
    {flair === "quotes" && <><i /><i /><i /><i /><i /></>}
    {flair === "gallery" && <span className="flair-ring" />}
  </div>;
};
