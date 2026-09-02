import * as THREE from "three";
import { clamp } from "./circuitMath";

export const ORBIT_MIN_EL = THREE.MathUtils.degToRad(22);
export const ORBIT_MAX_EL = THREE.MathUtils.degToRad(75);
const MIN_ZOOM = 0.62;
const MAX_ZOOM = 1.55;
const DRIFT_SPEED = 0.042;
const IDLE_DELAY = 4;
const DAMPING = 2.6;

/** Manual overview camera: azimuth + elevation offset (from the default framing) + distance factor. */
export const createOrbit = () => ({ az: 0, el: 0, zoom: 1, vAz: 0, vEl: 0, idle: Infinity, dragging: false });

export const resetOrbit = (orbit, az = 0, idle = Infinity) => {
  orbit.az = az;
  orbit.el = 0;
  orbit.zoom = 1;
  orbit.vAz = 0;
  orbit.vEl = 0;
  orbit.idle = idle;
};

export const orbitDrag = (orbit, dx, dy, dt) => {
  const dAz = -dx * 0.0055;
  const dEl = dy * 0.0042;
  const inverse = 1 / Math.max(dt, 0.004);
  orbit.az += dAz;
  orbit.el += dEl;
  orbit.vAz = orbit.vAz * 0.5 + dAz * inverse * 0.5;
  orbit.vEl = orbit.vEl * 0.5 + dEl * inverse * 0.5;
  orbit.idle = 0;
};

export const orbitZoom = (orbit, factor) => {
  orbit.zoom = clamp(orbit.zoom * factor, MIN_ZOOM, MAX_ZOOM);
  orbit.idle = 0;
};

/** Integrates release inertia and the idle auto-orbit; returns this frame's spherical framing. */
export const stepOrbit = (orbit, delta, time, baseEl, allowDrift) => {
  orbit.idle += delta;
  if (!orbit.dragging) {
    const decay = Math.exp(-delta * DAMPING);
    orbit.az += orbit.vAz * delta;
    orbit.el += orbit.vEl * delta;
    orbit.vAz = Math.abs(orbit.vAz) < 0.0004 ? 0 : orbit.vAz * decay;
    orbit.vEl = Math.abs(orbit.vEl) < 0.0004 ? 0 : orbit.vEl * decay;
  }
  const minEl = ORBIT_MIN_EL - baseEl;
  const maxEl = ORBIT_MAX_EL - baseEl;
  if (orbit.el < minEl || orbit.el > maxEl) {
    orbit.el = clamp(orbit.el, minEl, maxEl);
    orbit.vEl = 0;
  }
  const ramp = orbit.dragging || !allowDrift ? 0 : clamp((orbit.idle - IDLE_DELAY) / 2.5, 0, 1);
  orbit.az += DRIFT_SPEED * ramp * delta;
  return {
    az: orbit.az,
    el: baseEl + orbit.el + Math.sin(time * 0.21) * 0.024 * ramp,
    zoom: orbit.zoom * (1 + Math.sin(time * 0.16) * 0.014 * ramp),
  };
};
