import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
export const Nav = ({ open, setOpen }) => {
  const links = ["Legacy", "Timeline", "Cars", "Tracks", "Victories"];
  const go = (id) => {
    const route = id.toLowerCase();
    if (window.__spatialGo) window.__spatialGo(route, { immediate: true });
    else window.dispatchEvent(new CustomEvent("hamilton-spatial-route", { detail: { key: route, options: { immediate: true } } }));
    window.setTimeout(() => setOpen(false), 0);
  };
  useEffect(() => {
    const routeFromNativeClick = (event) => {
      const button = event.target.closest?.("[data-spatial-route]");
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      const route = button.dataset.spatialRoute;
      if (window.__spatialGo) window.__spatialGo(route, { immediate: true });
      else window.dispatchEvent(new CustomEvent("hamilton-spatial-route", { detail: { key: route, options: { immediate: true } } }));
      const onLanded = (landedEvent) => {
        if (landedEvent.detail.key !== route) return;
        window.removeEventListener("hamilton-spatial-landed", onLanded);
        setOpen(false);
      };
      window.addEventListener("hamilton-spatial-landed", onLanded);
      window.setTimeout(() => { window.removeEventListener("hamilton-spatial-landed", onLanded); setOpen(false); }, 700);
    };
    document.addEventListener("click", routeFromNativeClick, true);
    return () => document.removeEventListener("click", routeFromNativeClick, true);
  }, [setOpen]);
  return <>
    <header className="site-nav" data-testid="site-navigation"><button className="wordmark" onClick={() => go("top")} data-testid="home-logo-button" aria-label="Back to top"><span>LEWIS</span><strong>HAMILTON</strong></button><div className="nav-right"><span className="nav-stat" data-testid="navigation-career-stat">7× WORLD CHAMPION</span><button className="menu-button" onClick={() => setOpen(!open)} data-testid="menu-toggle-button" aria-label="Toggle navigation">{open ? <X size={22} /> : <Menu size={22} />}<span>{open ? "CLOSE" : "EXPLORE"}</span></button></div></header>
    <AnimatePresence>{open && <motion.div className="menu-panel" initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} exit={{ clipPath: "inset(0 0 100% 0)" }} transition={{ duration: .55, ease: [0.76, 0, 0.24, 1] }} data-testid="navigation-menu-panel"><p className="eyebrow" data-testid="navigation-menu-label">THE ARCHIVE / 2007—2025</p><nav>{links.map((link, i) => <button key={link} type="button" data-spatial-route={link.toLowerCase()} data-testid={`navigation-${link.toLowerCase()}-button`}><span>0{i + 1}</span>{link}</button>)}</nav><p className="menu-note" data-testid="navigation-menu-note">An independent fan-made tribute to Sir Lewis Hamilton.</p></motion.div>}</AnimatePresence>
  </>;
};