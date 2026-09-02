import { useEffect } from "react";
import { Menu, X } from "lucide-react";
import { TeamThemeSwitcher } from "./TeamThemeSwitcher";
import { LapCounter } from "./LapCounter";
import { CIRCUIT_CHAPTERS } from "../data/circuitRoute";

/** Each chapter's colour world, shown as a swatch in the EXPLORE menu. */
const WORLDS = {
  legacy: "#151517", timeline: "#0f0f10", cars: "#0c0c0c", gallery: "#e8dfd1", records: "#1d1d20",
  milestones: "var(--acid)", tracks: "#ecebe6", moment: "#0b0b0b", quotes: "#7637ff", victories: "#080808", footer: "var(--acid)",
};
const pad = (value) => String(value).padStart(2, "0");

export const Nav = ({ open, setOpen, teamTheme, setTeamTheme, route }) => {
  const go = (id) => {
    const key = id.toLowerCase();
    window.history.replaceState(null, "", `#route-${key}`);
    window.__spatialGo?.(key);
    setOpen(false);
  };
  useEffect(() => { const close = () => setOpen(false); window.addEventListener("hashchange", close); return () => window.removeEventListener("hashchange", close); }, [setOpen]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);
  const activeKey = route?.activeKey;
  return <>
    <header className="site-nav" data-testid="site-navigation"><button className="wordmark" onClick={() => go("top")} data-testid="home-logo-button" aria-label="Back to top"><span>LEWIS</span><strong>HAMILTON</strong></button><TeamThemeSwitcher theme={teamTheme} onChange={setTeamTheme}/><div className="nav-right"><LapCounter route={route} onNavigate={go} /><button className="menu-button" onClick={() => setOpen(!open)} data-testid="menu-toggle-button" aria-label="Toggle navigation" aria-expanded={open}>{open ? <X size={22} /> : <Menu size={22} />}<span>{open ? "CLOSE" : "EXPLORE"}</span></button></div></header>
    {open && <div className="menu-panel" data-testid="navigation-menu-panel">
      <p className="eyebrow" data-testid="navigation-menu-label">THE ARCHIVE / 2007—2025 · ELEVEN CHAPTERS</p>
      <nav className="menu-grid" aria-label="Chapters">
        {CIRCUIT_CHAPTERS.map((chapter, i) => <a
          key={chapter.key}
          href={`#route-${chapter.key}`}
          className={activeKey === chapter.key ? "is-current" : ""}
          aria-current={activeKey === chapter.key ? "page" : undefined}
          style={{ "--i": i, "--world": WORLDS[chapter.key] }}
          onClick={() => go(chapter.key)}
          onKeyDown={(event) => { if (event.key === " ") { event.preventDefault(); go(chapter.key); } }}
          data-testid={`navigation-${chapter.key}-button`}
        ><span>{pad(i + 1)}</span><strong>{chapter.label}</strong><small>{chapter.teaser}</small><i className="menu-swatch" aria-hidden="true" /></a>)}
      </nav>
      <p className="menu-note" data-testid="navigation-menu-note">An independent fan-made tribute to Sir Lewis Hamilton.</p>
    </div>}
  </>;
};