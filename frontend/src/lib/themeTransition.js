/**
 * Theme slide-wipe.
 * Switching team is a directional gesture: a thin accent hairline with a soft translucent band
 * sweeps across the viewport in the direction of travel (toward the chosen team on the switcher),
 * and the world recolours the moment the leading edge crosses centre. Two composited
 * pseudo-elements, transform-only — no page snapshots, no radial reveal.
 */
const ORDER = ["mclaren", "mercedes", "ferrari"]; // switcher order, left → right
const ACCENTS = { ferrari: "#e10600", mercedes: "#00d2be", mclaren: "#ff6200" };
const WIPE_MS = 520;
const APPLY_AT_MS = 220;

const prefersReducedMotion = () => Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

export const themeDirection = (from, to) => {
  let dir = ORDER.indexOf(to) - ORDER.indexOf(from);
  if (dir === 2) dir = -1;
  if (dir === -2) dir = 1;
  return dir || 1;
};

export const switchThemeWithSweep = (nextTheme, setTheme) => {
  const root = document.documentElement;
  const current = root.dataset.teamTheme;
  if (current === nextTheme) return;
  const dir = themeDirection(current, nextTheme);
  root.dataset.themeDir = dir > 0 ? "right" : "left";

  const apply = () => {
    root.dataset.teamTheme = nextTheme;
    setTheme(nextTheme);
  };
  if (prefersReducedMotion()) {
    apply();
    return;
  }

  const wipe = document.createElement("div");
  wipe.className = "theme-wipe";
  wipe.dataset.dir = dir > 0 ? "right" : "left";
  wipe.dataset.testid = "theme-wipe";
  wipe.setAttribute("aria-hidden", "true");
  wipe.style.setProperty("--wipe", ACCENTS[nextTheme] || "#fff");
  document.body.appendChild(wipe);
  const remove = () => wipe.remove();
  wipe.addEventListener("animationend", remove, { once: true });
  window.setTimeout(remove, WIPE_MS + 250);

  root.dataset.themeSweep = "true";
  window.setTimeout(apply, APPLY_AT_MS);
  window.setTimeout(() => { if (root.dataset.teamTheme === nextTheme) delete root.dataset.themeSweep; }, WIPE_MS);
};
