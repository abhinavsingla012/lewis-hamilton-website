/** Boot-time readiness signals for the Lights-Out cold start. */
export const createDeferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};

export const withTimeout = (promise, ms) => Promise.race([
  Promise.resolve(promise).catch(() => undefined),
  new Promise((resolve) => { window.setTimeout(resolve, ms); }),
]);

export const untilTime = (timestamp) => new Promise((resolve) => {
  const wait = Math.max(0, timestamp - performance.now());
  window.setTimeout(resolve, wait);
});

export const fontsReady = () => {
  const fonts = document.fonts;
  if (!fonts) return Promise.resolve();
  const faces = ['900 1em Unbounded', '800 1em Unbounded', '700 1em "Space Mono"', '400 1em "Space Mono"', '400 1em Manrope'];
  return Promise.all(faces.map((face) => fonts.load(face).catch(() => undefined))).then(() => fonts.ready).catch(() => undefined);
};

export const decodeImages = (sources) => Promise.all(sources.map((src) => new Promise((resolve) => {
  const image = new Image();
  image.onload = () => { if (image.decode) image.decode().then(resolve, resolve); else resolve(); };
  image.onerror = () => resolve();
  image.src = src;
})));
