import { flushSync } from "react-dom";

/**
 * Theme paint-sweep.
 * Switching team colour repaints the whole world as a radial wave that starts at the
 * pressed brand mark. Uses the View Transitions API (old world outside the circle, new
 * world inside) and degrades to a translucent wash on browsers without it.
 */
const SWEEP_MS = 820;

const prefersReducedMotion = () => Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

const defaultOrigin = (theme) => {
  const button = document.querySelector(`.team-theme-button[data-team="${theme}"]`);
  if (button) {
    const rect = button.getBoundingClientRect();
    if (rect.width > 0) return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
};

const spawnWave = (point, wash) => {
  const wave = document.createElement("div");
  wave.className = `theme-sweep-wave${wash ? " is-wash" : ""}`;
  wave.setAttribute("aria-hidden", "true");
  wave.dataset.testid = "theme-sweep-wave";
  wave.style.setProperty("--sweep-x", `${point.x}px`);
  wave.style.setProperty("--sweep-y", `${point.y}px`);
  document.body.appendChild(wave);
  const remove = () => wave.remove();
  wave.addEventListener("animationend", remove, { once: true });
  window.setTimeout(remove, SWEEP_MS + 600);
};

export const switchThemeWithSweep = (nextTheme, setTheme, origin) => {
  const root = document.documentElement;
  if (root.dataset.teamTheme === nextTheme) return;
  const point = origin || defaultOrigin(nextTheme);
  root.style.setProperty("--sweep-x", `${point.x}px`);
  root.style.setProperty("--sweep-y", `${point.y}px`);

  const apply = () => {
    root.dataset.teamTheme = nextTheme;
    flushSync(() => setTheme(nextTheme));
  };

  if (prefersReducedMotion()) {
    apply();
    return;
  }
  const supported = typeof document.startViewTransition === "function";
  if (!supported || root.dataset.themeSweep === "true") {
    apply();
    spawnWave(point, true);
    return;
  }
  root.dataset.themeSweep = "true";
  const release = () => { delete root.dataset.themeSweep; };
  try {
    const transition = document.startViewTransition(() => {
      apply();
      spawnWave(point, false);
    });
    transition.finished.then(release, release);
  } catch {
    release();
    apply();
    spawnWave(point, true);
  }
};
