import { useEffect, useState } from "react";
import "@/App.css";
import axios from "axios";
import Lenis from "lenis";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { StorySections } from "@/components/StorySections";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [archive, setArchive] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    let frame;
    const raf = (time) => { lenis.raf(time); frame = requestAnimationFrame(raf); };
    frame = requestAnimationFrame(raf);
    axios.get(`${API}/archive`).then(({ data }) => setArchive(data)).catch(() => setArchive(null));
    return () => { cancelAnimationFrame(frame); lenis.destroy(); };
  }, []);
  return <main className="app-shell" data-testid="hamilton-fan-archive"><Nav open={menuOpen} setOpen={setMenuOpen} /><Hero stats={archive?.stats} /><StorySections archive={archive} /></main>;
}

export default App;
