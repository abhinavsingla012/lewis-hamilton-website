/* eslint-disable react/no-unknown-property -- react-three-fiber scene graph props */
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CIRCUIT_CHAPTERS } from "../../data/circuitRoute";
import { UP, clamp, glow } from "../../three/circuitMath";

const TRAIL_SAMPLES = 40;
const CASCADE_GAP = 0.26;
const FLOOD_WHITE = glow("#eef3ff", 1.6);

/** Light motes drifting over the circuit — one additive point cloud, animated in the vertex shader. */
export const Motes = ({ curve, accent, count }) => {
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    const point = new THREE.Vector3();
    const tangent = new THREE.Vector3();
    const side = new THREE.Vector3();
    for (let index = 0; index < count; index += 1) {
      const t = Math.random();
      curve.getPointAt(t, point);
      curve.getTangentAt(t, tangent);
      side.crossVectors(tangent, UP).normalize();
      const lateral = (Math.random() - 0.5) * 130;
      positions[index * 3] = point.x + side.x * lateral;
      positions[index * 3 + 1] = 1.5 + Math.pow(Math.random(), 1.7) * 44;
      positions[index * 3 + 2] = point.z + side.z * lateral;
      seeds[index] = Math.random();
      sizes[index] = 2 + Math.random() * 3.5;
    }
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    buffer.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    buffer.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    return buffer;
  }, [curve, count]);

  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uColor: { value: glow(accent, 0.75) }, uScale: { value: 640 } },
    vertexShader: `
      attribute float aSeed;
      attribute float aSize;
      uniform float uTime;
      uniform float uScale;
      varying float vTwinkle;
      void main() {
        vec3 p = position;
        p.y += sin(uTime * 0.35 + aSeed * 6.2831) * 3.5;
        p.x += sin(uTime * 0.21 + aSeed * 3.7) * 4.0;
        p.z += cos(uTime * 0.17 + aSeed * 5.1) * 4.0;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp(aSize * uScale / -mv.z, 1.2, 7.0);
        vTwinkle = 0.45 + 0.55 * sin(uTime * (1.1 + aSeed) + aSeed * 9.0);
      }`,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vTwinkle;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.05, d) * vTwinkle;
        if (a < 0.01) discard;
        gl_FragColor = vec4(uColor * (0.6 + 0.9 * vTwinkle), a * 0.38);
      }`,
  // eslint-disable-next-line react-hooks/exhaustive-deps -- accent is live-updated through the uniform
  }), []);

  useEffect(() => { material.uniforms.uColor.value.copy(glow(accent, 0.75)); }, [accent, material]);
  useFrame((state) => { material.uniforms.uTime.value = state.clock.elapsedTime; });
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  return <points geometry={geometry} material={material} frustumCulled={false} />;
};

/** Light streak the car leaves behind while travelling — sampled straight off the racing line. */
export const CarTrail = ({ curve, accent, lifeRef }) => {
  const meshRef = useRef(null);
  const scratch = useMemo(() => ({ point: new THREE.Vector3(), tangent: new THREE.Vector3(), side: new THREE.Vector3() }), []);
  const geometry = useMemo(() => {
    const buffer = new THREE.BufferGeometry();
    const positions = new Float32Array(TRAIL_SAMPLES * 6);
    const uvs = new Float32Array(TRAIL_SAMPLES * 4);
    const indices = [];
    for (let index = 0; index < TRAIL_SAMPLES; index += 1) {
      const v = index / (TRAIL_SAMPLES - 1);
      uvs.set([0, v, 1, v], index * 4);
      if (index < TRAIL_SAMPLES - 1) {
        const a = index * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    buffer.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    buffer.setIndex(indices);
    return buffer;
  }, []);

  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: glow(accent, 0.9) }, uStrength: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `
      varying vec2 vUv;
      uniform vec3 uColor;
      uniform float uStrength;
      void main() {
        float along = 1.0 - vUv.y;
        float across = 1.0 - smoothstep(0.0, 0.5, abs(vUv.x - 0.5));
        float a = pow(along, 1.7) * across * uStrength;
        if (a < 0.01) discard;
        gl_FragColor = vec4(uColor * (0.8 + 1.8 * along), a);
      }`,
  // eslint-disable-next-line react-hooks/exhaustive-deps -- accent is live-updated through the uniform
  }), []);

  useEffect(() => { material.uniforms.uColor.value.copy(glow(accent, 0.9)); }, [accent, material]);
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  useFrame(() => {
    const life = lifeRef.current;
    const mesh = meshRef.current;
    if (!mesh) return;
    const target = clamp(life.speed * 1.4, 0, 1) * clamp(life.follow * 3, 0, 1);
    const strength = material.uniforms.uStrength.value + (target - material.uniforms.uStrength.value) * 0.15;
    material.uniforms.uStrength.value = strength;
    mesh.visible = strength > 0.01;
    if (!mesh.visible) return;
    const span = 0.004 + life.speed * 0.02;
    const positions = geometry.attributes.position.array;
    for (let index = 0; index < TRAIL_SAMPLES; index += 1) {
      const fraction = index / (TRAIL_SAMPLES - 1);
      const t = (((life.t - fraction * span) % 1) + 1) % 1;
      curve.getPointAt(t, scratch.point);
      curve.getTangentAt(t, scratch.tangent);
      scratch.side.crossVectors(scratch.tangent, UP).normalize();
      const width = 1.3 * (1 - fraction) + 0.15;
      const y = scratch.point.y + 1.1;
      positions.set([
        scratch.point.x - scratch.side.x * width, y, scratch.point.z - scratch.side.z * width,
        scratch.point.x + scratch.side.x * width, y, scratch.point.z + scratch.side.z * width,
      ], index * 6);
    }
    geometry.attributes.position.needsUpdate = true;
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} frustumCulled={false} visible={false} />;
};

/** Start-light cascade running along the gates toward the active chapter, plus the active beacon. */
export const GateCascade = ({ registry, accent, activeIndex }) => {
  const palette = useMemo(() => ({ hot: glow(accent, 1.25), base: new THREE.Color(accent), dim: new THREE.Color("#3a3d45") }), [accent]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const last = activeIndex >= 0 ? activeIndex : CIRCUIT_CHAPTERS.length - 1;
    const period = last * CASCADE_GAP + 2.6;
    const phase = time % period;
    for (let index = 0; index < CIRCUIT_CHAPTERS.length; index += 1) {
      const gate = registry.current[index];
      if (!gate) continue;
      const local = phase - index * CASCADE_GAP;
      const pulse = index <= last && local > 0 ? Math.exp(-local * 3.2) : 0;
      const isActive = index === activeIndex;
      gate.bar.color.copy(palette.hot).multiplyScalar(0.55 + pulse * 1.2 + (isActive ? 0.6 : 0));
      if (isActive) {
        const beat = 0.5 + 0.5 * Math.sin(time * 4.2);
        gate.lamp.color.copy(palette.hot).multiplyScalar(0.9 + beat * 0.8);
      } else {
        gate.lamp.color.copy(palette.dim).lerp(palette.hot, pulse);
      }
      gate.floor.color.copy(palette.hot).multiplyScalar(0.5);
      gate.floor.opacity = (isActive ? 0.85 : 0.3) + pulse * 0.45;
      gate.light.color.copy(palette.base);
      gate.light.intensity = (isActive ? 150 : 55) * (1 + pulse * 1.6);
    }
  });

  return null;
};

/** Faint mains flicker on the floodlight heads and their pools of light. */
export const FloodFlicker = ({ registry }) => {
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    registry.current.forEach((lamp) => {
      if (!lamp) return;
      const seed = lamp.seed;
      const dip = Math.sin(time * 0.7 + seed * 2.3) > 0.992 ? -0.3 : 0;
      const k = 1 + 0.05 * Math.sin(time * 11.7 + seed) * Math.sin(time * 5.3 + seed * 1.7) + dip;
      lamp.head.color.copy(FLOOD_WHITE).multiplyScalar(k);
      if (lamp.light) lamp.light.intensity = 420 * k;
    });
  });
  return null;
};
