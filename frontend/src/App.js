import { useEffect, useState } from "react";
import "@/App.css";
import "@/Upgrade.css";
import "@/TimelineV2.css";
import "@/HeroV3.css";
import "@/TransitionV4.css";
import "@/SpatialV5.css";
import axios from "axios";
import Lenis from "lenis";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { StorySections } from "@/components/StorySections";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [archive, setArchive] = useState(null);
  const [archiveError, setArchiveError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    window.__hamiltonLenis = lenis;
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    lenis.scrollTo(0, { immediate: true, force: true });
    let frame;
    const raf = (time) => { lenis.raf(time); frame = requestAnimationFrame(raf); };
    frame = requestAnimationFrame(raf);
    axios.get(`${API}/archive`).then(({ data }) => { setArchive(data); setArchiveError(false); }).catch(() => setArchiveError(true));
    return () => { cancelAnimationFrame(frame); lenis.destroy(); delete window.__hamiltonLenis; };
  }, []);
  return <main className="app-shell" data-testid="hamilton-fan-archive"><Nav open={menuOpen} setOpen={setMenuOpen} />{archiveError && <div className="archive-error" style={{ position: "fixed", zIndex: 110, top: 92, left: "50%", transform: "translateX(-50%)", padding: "11px 18px", borderRadius: 999, background: "rgba(12,12,12,.92)", color: "white", font: '10px "Space Mono"' }} role="alert" data-testid="archive-error-message">Live race data is temporarily unavailable. The curated career archive remains on screen.</div>}<Hero stats={archive?.stats} /><StorySections archive={archive} /></main>;
}

export default App;
