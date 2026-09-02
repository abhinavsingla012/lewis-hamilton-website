import { useCallback, useEffect, useState } from "react";
import "@/App.css";
import "@/Upgrade.css";
import "@/TimelineV2.css";
import "@/HeroV3.css";
import "@/HeroWhite.css";
import "@/HeroDepth.css";
import "@/HeroEnvironment.css";
import "@/CircuitExperience.css";
import "@/TeamThemes.css";
import "@/LegacyChapter.css";
import "@/ChapterMarkers.css";
import "@/CarsChapter.css";
import "@/GalleryChapter.css";
import "@/RecordReactor.css";
import "@/SpatialV6.css";
import "@/ChapterWorlds.css";
import "@/ChapterFlair.css";
import "@/LegacyVault.css";
import "@/ThemeSweep.css";
import "@/Wayfinding.css";
import "@/TelemetryCursor.css";
import "@/LightsOut.css";
import axios from "axios";
import Lenis from "lenis";
import { Nav } from "@/components/Nav";
import { SpatialExperience } from "@/components/SpatialExperience";
import { TelemetryCursor } from "@/components/TelemetryCursor";
import { LightsOut } from "@/components/LightsOut";
import { createDeferred, decodeImages, fontsReady } from "@/lib/boot";
import { switchThemeWithSweep } from "@/lib/themeTransition";

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

const HERO_IMAGES = ["/images/lewis-ferrari.webp", "/images/lewis-mercedes.webp", "/images/lewis-mclaren.webp"];

function App() {
  const [archive, setArchive] = useState(null);
  const [archiveError, setArchiveError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [route, setRoute] = useState({ activeKey: "top", targetKey: "top", isTraveling: false, isCircuitOverview: false });
  const [teamTheme, setTeamTheme] = useState(getInitialTeamTheme);
  /** Cold-start choreography: the hero stays gated until the start lights go out. */
  const [booted, setBooted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [boot] = useState(() => {
    const archiveGate = createDeferred();
    const circuitGate = createDeferred();
    return {
      archiveGate,
      circuitGate,
      signals: { fonts: fontsReady(), imagery: decodeImages(HERO_IMAGES), archive: archiveGate.promise, circuit: circuitGate.promise },
    };
  });
  const onReveal = useCallback(() => setRevealed(true), []);
  const onBootDone = useCallback(() => { setRevealed(true); setBooted(true); }, []);
  /** Every theme change goes through the paint-sweep so the world recolours as one gesture. */
  const changeTeamTheme = useCallback((next) => {
    if (!teamThemes.has(next)) return;
    switchThemeWithSweep(next, setTeamTheme);
  }, []);
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
    axios.get(`${API}/archive`)
      .then(({ data }) => { setArchive(data); setArchiveError(false); })
      .catch(() => setArchiveError(true))
      .finally(() => boot.archiveGate.resolve());
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(routeFrame); lenis.destroy(); delete window.__hamiltonLenis; };
  }, [boot]);
  return <main className="app-shell" data-testid="hamilton-fan-archive" data-booted={booted ? "true" : "false"}><Nav open={menuOpen} setOpen={setMenuOpen} teamTheme={teamTheme} setTeamTheme={changeTeamTheme} route={route}/>{archiveError && <div className="archive-error" style={{ position: "fixed", zIndex: 110, top: 92, left: "50%", transform: "translateX(-50%)", padding: "11px 18px", borderRadius: 999, background: "rgba(12,12,12,.92)", color: "white", font: '10px "Space Mono"' }} role="alert" data-testid="archive-error-message">Live race data is temporarily unavailable. The curated career archive remains on screen.</div>}<SpatialExperience archive={archive} teamTheme={teamTheme} setTeamTheme={changeTeamTheme} onRouteChange={setRoute} onCircuitReady={boot.circuitGate.resolve} revealed={revealed}/>{!booted && <LightsOut signals={boot.signals} onReveal={onReveal} onDone={onBootDone} />}<TelemetryCursor /></main>;
}

export default App;
