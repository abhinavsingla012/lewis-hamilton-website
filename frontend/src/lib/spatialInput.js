import { useEffect } from "react";

/**
 * Central registry so an active chapter can consume a scroll step
 * (e.g. the Gallery moving between its own slides) before the spatial
 * engine advances to the next chapter. One owner, no listener wars.
 */
const stepHandlers = new Map();

export const registerChapterStep = (key, handler) => {
  stepHandlers.set(key, handler);
  return () => {
    if (stepHandlers.get(key) === handler) stepHandlers.delete(key);
  };
};

export const consumeChapterStep = (key, direction) => {
  const handler = stepHandlers.get(key);
  if (!handler) return false;
  try {
    return handler(direction) === true;
  } catch {
    return false;
  }
};

/** True when the active chapter owns its own scroll steps (e.g. Gallery slides, Legacy vault). */
export const hasChapterStep = (key) => stepHandlers.has(key);

export const useChapterStep = (key, isActive, handler) => {
  useEffect(() => {
    if (!isActive) return undefined;
    return registerChapterStep(key, handler);
  }, [key, isActive, handler]);
};

export const canElementScroll = (element, delta) => {
  if (!element) return false;
  const max = element.scrollHeight - element.clientHeight;
  if (max <= 2) return false;
  if (delta > 0) return element.scrollTop < max - 1;
  return element.scrollTop > 1;
};
