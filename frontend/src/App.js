import { useEffect, useState } from "react";
import "@/App.css";
import "@/Upgrade.css";
import "@/TimelineV2.css";
import "@/HeroV3.css";
import "@/CircuitExperience.css";
import "@/TeamThemes.css";
import "@/LegacyChapter.css";
import "@/ChapterMarkers.css";
import "@/CarsChapter.css";
import "@/GalleryChapter.css";
import "@/RecordsChapter.css";
import axios from "axios";
import Lenis from "lenis";
import { Nav } from "@/components/Nav";
import { SpatialExperience } from "@/components/SpatialExperience";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const teamThemes = new Set(["ferrari", "mercedes", "mclaren"]);

const getInitialTeamTheme = () => {
  try {
    const saved = window.localStorage.getItem("hamilton-team-theme");
    const theme = teamThemes.has(saved) ? saved : "ferrari";
    document.documentElement.dataset.teamTheme = theme;
    return theme;
  } catch {
    return "ferrari";
  }
};

function App() {
  const [archive, setArchive] = useState(null);
  const [archiveError, setArchiveError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [teamTheme, setTeamTheme] = useState(getInitialTeamTheme);
  useEffect(() => {
    document.documentElement.dataset.teamTheme = teamTheme;
    try { window.localStorage.setItem("hamilton-team-theme", teamTheme); } catch { /* Storage can be disabled. */ }
  }, [teamTheme]);
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    window.__hamiltonLenis = lenis;
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    const initialRoute = window.location.hash.replace("#route-", "");
    let routeFrame;
    if (window.location.hash.startsWith("#route-")) {
      routeFrame = requestAnimationFrame(() => {
        const activeRoute = document.querySelector("[data-testid='circuit-spatial-viewport']")?.dataset.active;
        if (activeRoute !== initialRoute) window.__spatialGo?.(initialRoute, { immediate: true });
      });
    } else lenis.scrollTo(0, { immediate: true, force: true });
    let frame;
    const raf = (time) => { lenis.raf(time); frame = requestAnimationFrame(raf); };
    frame = requestAnimationFrame(raf);
    axios.get(`${API}/archive`).then(({ data }) => { setArchive(data); setArchiveError(false); }).catch(() => setArchiveError(true));
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(routeFrame); lenis.destroy(); delete window.__hamiltonLenis; };
  }, []);
  return <main className="app-shell" data-testid="hamilton-fan-archive"><Nav open={menuOpen} setOpen={setMenuOpen} teamTheme={teamTheme} setTeamTheme={setTeamTheme}/>{archiveError && <div className="archive-error" style={{ position: "fixed", zIndex: 110, top: 92, left: "50%", transform: "translateX(-50%)", padding: "11px 18px", borderRadius: 999, background: "rgba(12,12,12,.92)", color: "white", font: '10px "Space Mono"' }} role="alert" data-testid="archive-error-message">Live race data is temporarily unavailable. The curated career archive remains on screen.</div>}<SpatialExperience archive={archive}/></main>;
}

export default App;
