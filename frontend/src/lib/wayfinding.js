/**
 * Wayfinding memory. The nav's idle "NEXT ↓" cue only teaches until the visitor has
 * proven they know how to move between chapters, then it retires for good.
 */
const KEY = "hamilton-wayfinding-steps";
const LEARNED_AT = 3;

const read = () => {
  try { return Number(window.localStorage.getItem(KEY) || 0); } catch { return 0; }
};

export const noteWayfindingStep = () => {
  try { window.localStorage.setItem(KEY, String(read() + 1)); } catch { /* storage disabled */ }
};

export const isWayfindingLearned = () => read() >= LEARNED_AT;
