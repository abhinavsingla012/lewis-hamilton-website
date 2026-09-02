import * as THREE from "three";

export const UP = new THREE.Vector3(0, 1, 0);

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const easeInOut = (value) => (value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2);
export const moveToward = (current, target, step) => (current < target ? Math.min(target, current + step) : Math.max(target, current - step));

/** Quadratic bezier written into `out`. */
export const quadBezier = (out, p0, p1, p2, t) => {
  const inverse = 1 - t;
  return out.copy(p0).multiplyScalar(inverse * inverse).addScaledVector(p1, 2 * inverse * t).addScaledVector(p2, t * t);
};

export const luminance = (color) => 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;

/** Scales a colour to a target linear luminance so every team hue blooms identically. */
export const glow = (input, target) => {
  const color = new THREE.Color(input);
  const current = luminance(color);
  return current > 0 ? color.multiplyScalar(target / current) : color;
};
