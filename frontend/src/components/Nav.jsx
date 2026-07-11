import { useEffect } from "react";
import { Menu, X } from "lucide-react";
import { TeamThemeSwitcher } from "./TeamThemeSwitcher";

export const Nav = ({ open, setOpen, teamTheme, setTeamTheme }) => {
  const links = ["Legacy", "Timeline", "Cars", "Tracks", "Victories"];
  const go = (id) => {
    const route = id.toLowerCase();
    window.history.replaceState(null, "", `#route-${route}`);
    window.__spatialGo?.(route);
    setOpen(false);
  };
  useEffect(() => { const close = () => setOpen(false); window.addEventListener("hashchange", close); return () => window.removeEventListener("hashchange", close); }, [setOpen]);
  return <>
    <header className="site-nav" data-testid="site-navigation"><button className="wordmark" onClick={() => go("top")} data-testid="home-logo-button" aria-label="Back to top"><span>LEWIS</span><strong>HAMILTON</strong></button><TeamThemeSwitcher theme={teamTheme} onChange={setTeamTheme}/><div className="nav-right"><span className="nav-stat" data-testid="navigation-career-stat">7× WORLD CHAMPION</span><button className="menu-button" onClick={() => setOpen(!open)} data-testid="menu-toggle-button" aria-label="Toggle navigation">{open ? <X size={22} /> : <Menu size={22} />}<span>{open ? "CLOSE" : "EXPLORE"}</span></button></div></header>
    {open && <div className="menu-panel" data-testid="navigation-menu-panel"><p className="eyebrow" data-testid="navigation-menu-label">THE ARCHIVE / 2007—2025</p><nav>{links.map((link, i) => <a key={link} href={`#route-${link.toLowerCase()}`} onClick={() => go(link)} onKeyDown={(event) => { if (event.key === " ") { event.preventDefault(); go(link); } }} data-testid={`navigation-${link.toLowerCase()}-button`}><span>0{i + 1}</span>{link}</a>)}</nav><p className="menu-note" data-testid="navigation-menu-note">An independent fan-made tribute to Sir Lewis Hamilton.</p></div>}
  </>;
};