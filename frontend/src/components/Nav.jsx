import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
export const Nav = ({ open, setOpen }) => {
  const links = ["Legacy", "Timeline", "Cars", "Tracks", "Victories"];
  const go = (id) => {
    setOpen(false);
    if (window.__spatialGo) { window.setTimeout(() => window.__spatialGo(id.toLowerCase(), { immediate: true }), 40); return; }
    const target = id.toLowerCase() === "top" ? 0 : document.getElementById(id.toLowerCase());
    if (target === null) return;
    const destination = target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY;
    window.setTimeout(() => {
      if (window.__hamiltonLenis) window.__hamiltonLenis.scrollTo(destination, { immediate: true, force: true });
      else window.scrollTo({ top: destination, behavior: "auto" });
    }, 40);
  };
  return <>
    <header className="site-nav" data-testid="site-navigation"><button className="wordmark" onClick={() => go("top")} data-testid="home-logo-button" aria-label="Back to top"><span>LEWIS</span><strong>HAMILTON</strong></button><div className="nav-right"><span className="nav-stat" data-testid="navigation-career-stat">7× WORLD CHAMPION</span><button className="menu-button" onClick={() => setOpen(!open)} data-testid="menu-toggle-button" aria-label="Toggle navigation">{open ? <X size={22} /> : <Menu size={22} />}<span>{open ? "CLOSE" : "EXPLORE"}</span></button></div></header>
    <AnimatePresence>{open && <motion.div className="menu-panel" initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} exit={{ clipPath: "inset(0 0 100% 0)" }} transition={{ duration: .55, ease: [0.76, 0, 0.24, 1] }} data-testid="navigation-menu-panel"><p className="eyebrow" data-testid="navigation-menu-label">THE ARCHIVE / 2007—2025</p><nav>{links.map((link, i) => <button key={link} onClick={() => go(link)} data-testid={`navigation-${link.toLowerCase()}-button`}><span>0{i + 1}</span>{link}</button>)}</nav><p className="menu-note" data-testid="navigation-menu-note">An independent fan-made tribute to Sir Lewis Hamilton.</p></motion.div>}</AnimatePresence>
  </>;
};