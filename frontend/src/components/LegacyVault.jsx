/* eslint-disable react/no-unknown-property -- react-three-fiber scene graph props */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useChapterStep } from "../lib/spatialInput";

const REDUCED = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const IS_MOBILE = typeof window !== "undefined" && window.innerWidth < 850;
const PARTICLE_COUNT = IS_MOBILE ? 6500 : 14000;
const SPACING = 3.1;
const CENTER = 3;
const TMP_COLOR = new THREE.Color();

const THEME_PALETTES = {
  ferrari: { a: "#ff5a3c", b: "#c01207", spark: "#ffd9c8", cone: "#ff9a84", dust: "#ff8570", shards: "MARANELLO RED" },
  mercedes: { a: "#43e6d5", b: "#00857a", spark: "#dcfff9", cone: "#8ff2e6", dust: "#6fe3d6", shards: "PETRONAS TEAL" },
  mclaren: { a: "#ffb257", b: "#e05e00", spark: "#ffe9cf", cone: "#ffcf96", dust: "#ffb877", shards: "PAPAYA ORANGE" },
};

const TITLES = [
  { year: 2008, team: "McLAREN", car: "MP4-23", accent: "#ff7a1f", wins: 5, poles: 7, points: 98, headline: "BY ONE POINT", story: "Fifth place, gained at the very last corner of the very last lap in Brazil. At 23, the youngest world champion the sport had ever seen." },
  { year: 2014, team: "MERCEDES", car: "W05 HYBRID", accent: "#00d2be", wins: 11, poles: 7, points: 384, headline: "THE SILVER WAR", story: "Eleven wins in the first year of the hybrid era, settled in a season-long duel with Rosberg under the Abu Dhabi floodlights." },
  { year: 2015, team: "MERCEDES", car: "W06 HYBRID", accent: "#00d2be", wins: 10, poles: 11, points: 381, headline: "SENNA EQUALLED", story: "A third crown, sealed with victory in Austin — level with the idol whose poster hung on a bedroom wall in Stevenage." },
  { year: 2017, team: "MERCEDES", car: "W08 EQ POWER+", accent: "#00d2be", wins: 9, poles: 11, points: 363, headline: "THE COMEBACK", story: "Trailing Ferrari at mid-season, he answered with a run of poles and wins that had broken Vettel's challenge by Mexico." },
  { year: 2018, team: "MERCEDES", car: "W09 EQ POWER+", accent: "#00d2be", wins: 11, poles: 11, points: 408, headline: "THE MASTERPIECE", story: "Eleven wins, 408 points, and a second-half surge many still call the most complete championship season ever driven." },
  { year: 2019, team: "MERCEDES", car: "W10 EQ POWER+", accent: "#00d2be", wins: 11, poles: 5, points: 413, headline: "413 POINTS", story: "A record points haul and a sixth title clinched in Austin. Second place was never really part of the conversation." },
  { year: 2020, team: "MERCEDES", car: "W11 EQ PERFORMANCE", accent: "#00d2be", wins: 11, poles: 10, points: 347, headline: "SEVEN. EQUAL OF LEGEND.", story: "Schumacher equalled in an Istanbul downpour — a masterclass on a flooded track, in the year the whole world stood still." },
];

/* ── Monument: 14k gold particles forming the 44 ─────────────────────── */

const fillTargets = (geometry) => {
  const attr = geometry.attributes.position;
  const W = 720;
  const H = 420;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.fillStyle = "#fff";
  ctx.font = `900 ${Math.floor(H * 0.86)}px Unbounded, "Arial Black", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("44", W / 2, H * 0.56);
  const pixels = ctx.getImageData(0, 0, W, H).data;
  const spots = [];
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      if (pixels[(y * W + x) * 4 + 3] > 120) spots.push(x, y);
    }
  }
  if (!spots.length) return;
  const total = spots.length / 2;
  const scale = 10.6 / W;
  for (let i = 0; i < attr.count; i += 1) {
    const pick = (Math.random() * total) | 0;
    attr.array[i * 3] = (spots[pick * 2] - W / 2) * scale + (Math.random() - 0.5) * 0.05;
    attr.array[i * 3 + 1] = (H / 2 - spots[pick * 2 + 1]) * scale + (Math.random() - 0.5) * 0.05;
    attr.array[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
  }
  attr.needsUpdate = true;
};

const buildParticleGeometry = () => {
  const count = PARTICLE_COUNT;
  const geometry = new THREE.BufferGeometry();
  const chaos = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const radius = 7 + Math.random() * 7;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    chaos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    chaos[i * 3 + 1] = radius * Math.cos(phi) * 0.6;
    chaos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) * 0.5 - 2;
    const dir = Math.random() * Math.PI * 2;
    const push = 5 + Math.random() * 11;
    scatter[i * 3] = Math.cos(dir) * push;
    scatter[i * 3 + 1] = Math.sin(dir) * push * 0.7;
    scatter[i * 3 + 2] = 7 + Math.random() * 15;
    seed[i] = Math.random();
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute("aChaos", new THREE.BufferAttribute(chaos, 3));
  geometry.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  fillTargets(geometry);
  return geometry;
};

const buildParticleMaterial = (palette) => new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  depthTest: false,
  blending: THREE.AdditiveBlending,
  uniforms: {
    uTime: { value: 0 },
    uMorph: { value: REDUCED ? 1 : 0 },
    uScatter: { value: 0 },
    uMouse: { value: new THREE.Vector2(99, 99) },
    uMouseActive: { value: 0 },
    uPixel: { value: Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 1.6) },
    uColorA: { value: new THREE.Color(palette.a) },
    uColorB: { value: new THREE.Color(palette.b) },
    uSpark: { value: new THREE.Color(palette.spark) },
  },
  vertexShader: `
    uniform float uTime, uMorph, uScatter, uMouseActive, uPixel;
    uniform vec2 uMouse;
    attribute vec3 aChaos, aScatter;
    attribute float aSeed;
    varying float vSeed, vGlow;
    void main() {
      float ease = uMorph * uMorph * (3.0 - 2.0 * uMorph);
      vec3 pos = mix(aChaos, position, ease);
      pos.x += sin(uTime * 0.6 + aSeed * 41.0) * 0.05;
      pos.y += cos(uTime * 0.5 + aSeed * 57.0) * 0.05;
      pos.z += sin(uTime * 0.4 + aSeed * 73.0) * 0.07;
      vec2 d = pos.xy - uMouse;
      float force = smoothstep(1.7, 0.0, length(d)) * uMouseActive * ease;
      pos.xy += normalize(d + 0.0001) * force * 1.25;
      pos.z += force * 0.9;
      vGlow = force;
      pos += aScatter * uScatter;
      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = min((2.0 + aSeed * 3.0) * uPixel * (10.0 / max(0.5, -mv.z)), 42.0);
      vSeed = aSeed;
    }`,
  fragmentShader: `
    uniform float uScatter;
    uniform vec3 uColorA, uColorB, uSpark;
    varying float vSeed, vGlow;
    void main() {
      float a = smoothstep(0.5, 0.06, length(gl_PointCoord - 0.5));
      vec3 shard = mix(uColorA, uColorB, fract(vSeed * 7.31));
      if (vSeed > 0.94) shard = uSpark;
      shard += vGlow * uColorA * 0.55;
      float fade = clamp(1.0 - uScatter * 1.15, 0.0, 1.0);
      gl_FragColor = vec4(shard, a * (0.7 + vSeed * 0.3) * fade);
    }`,
});

const MonumentParticles = ({ isActive, phaseRef, palette }) => {
  const [geometry] = useState(buildParticleGeometry);
  const material = useMemo(() => buildParticleMaterial(palette), []); // eslint-disable-line react-hooks/exhaustive-deps
  const paletteRef = useRef(palette);
  paletteRef.current = palette;
  const mouseSeen = useRef(false);
  const { camera, gl } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 11);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useEffect(() => {
    const el = gl.domElement;
    const onMove = () => { mouseSeen.current = true; };
    const onLeave = () => { mouseSeen.current = false; };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [gl]);

  useEffect(() => {
    let dead = false;
    if (!document.fonts?.check?.("900 100px Unbounded")) {
      document.fonts?.ready?.then(() => {
        if (!dead && document.fonts.check("900 100px Unbounded")) fillTargets(geometry);
      });
    }
    return () => { dead = true; };
  }, [geometry]);

  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  useFrame((state, delta) => {
    const u = material.uniforms;
    const phase = phaseRef.current;
    u.uTime.value += delta;
    const formed = REDUCED || isActive || phase !== "monument" ? 1 : 0;
    u.uMorph.value = THREE.MathUtils.damp(u.uMorph.value, formed, 1.15, delta);
    const scatterTarget = phase === "opening" ? 1 : 0;
    u.uScatter.value = THREE.MathUtils.damp(u.uScatter.value, scatterTarget, scatterTarget ? 4.4 : 10, delta);
    u.uMouse.value.set(state.pointer.x * state.viewport.width / 2, state.pointer.y * state.viewport.height / 2);
    u.uMouseActive.value = THREE.MathUtils.damp(u.uMouseActive.value, phase === "monument" && !IS_MOBILE && mouseSeen.current ? 1 : 0, 4, delta);
    const pal = paletteRef.current;
    const blend = Math.min(1, 3.2 * delta);
    u.uColorA.value.lerp(TMP_COLOR.set(pal.a), blend);
    u.uColorB.value.lerp(TMP_COLOR.set(pal.b), blend);
    u.uSpark.value.lerp(TMP_COLOR.set(pal.spark), blend);
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
};

/* ── Vault: seven championship trophies ──────────────────────────────── */

const buildSilverMatcap = () => buildMatcap([
  [0, "#ffffff"], [0.22, "#e6e9ee"], [0.5, "#a7abb4"], [0.75, "#585d66"], [1, "#202329"],
], "rgba(255,255,255,.95)");

/* Real F1 championship trophy: silver trumpet, gold spiral, checkered collar */
const BODY_WALL = [[0.40, 0.135], [0.46, 0.145], [0.55, 0.155], [0.72, 0.17], [0.90, 0.19], [1.08, 0.215], [1.24, 0.25], [1.38, 0.30], [1.46, 0.34], [1.55, 0.40], [1.65, 0.47]];
const bodyRadiusAt = (y) => {
  for (let i = 1; i < BODY_WALL.length; i += 1) {
    if (y <= BODY_WALL[i][0]) {
      const [y0, r0] = BODY_WALL[i - 1];
      const [y1, r1] = BODY_WALL[i];
      return r0 + (r1 - r0) * ((y - y0) / (y1 - y0));
    }
  }
  return BODY_WALL.at(-1)[1];
};

class TrophySpiral extends THREE.Curve {
  getPoint(t, target = new THREE.Vector3()) {
    const y = 0.52 + t * 0.96;
    const r = bodyRadiusAt(y) + 0.02;
    const angle = t * Math.PI * 16;
    return target.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
  }
}

const buildTrophyParts = () => {
  const profile = [
    [0.001, 0], [0.40, 0], [0.415, 0.025], [0.40, 0.05], [0.30, 0.09], [0.205, 0.14],
    [0.15, 0.20], [0.125, 0.27], [0.12, 0.33], [0.135, 0.40], [0.145, 0.46],
    [0.155, 0.55], [0.17, 0.72], [0.19, 0.90], [0.215, 1.08], [0.25, 1.24],
    [0.30, 1.38], [0.38, 1.52], [0.47, 1.66], [0.555, 1.77], [0.575, 1.805],
    [0.55, 1.815], [0.51, 1.77], [0.45, 1.68], [0.40, 1.60],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return {
    body: new THREE.LatheGeometry(profile, 72),
    spiral: new THREE.TubeGeometry(new TrophySpiral(), 420, 0.016, 8),
    band: new THREE.CylinderGeometry(0.155, 0.178, 0.13, 40),
    rim: new THREE.TorusGeometry(0.555, 0.013, 10, 64),
    emblemRing: new THREE.TorusGeometry(0.05, 0.015, 10, 32),
    emblemCore: new THREE.CircleGeometry(0.038, 24),
  };
};

const buildBrushedTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 420; i += 1) {
    const x = Math.random() * 256;
    const shade = Math.random();
    ctx.fillStyle = shade > 0.5 ? `rgba(120,128,142,${0.04 + Math.random() * 0.09})` : `rgba(255,255,255,${0.05 + Math.random() * 0.08})`;
    ctx.fillRect(x, 0, 0.6 + Math.random() * 1.4, 256);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 1);
  return texture;
};

const buildCheckerTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 360;
  canvas.height = 48;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0c0b09";
  ctx.fillRect(0, 0, 360, 48);
  ctx.fillStyle = "#e3b64f";
  ctx.fillRect(0, 0, 360, 4);
  ctx.fillRect(0, 44, 360, 4);
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 30; col += 1) {
      if ((row + col) % 2 === 0) ctx.fillRect(col * 12, 8 + row * 16, 12, 16);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.set(3, 1);
  return texture;
};

const buildPlateTexture = (year) => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.textAlign = "center";
  ctx.fillStyle = "#e9c268";
  ctx.font = '800 132px Unbounded, "Arial Black", sans-serif';
  ctx.fillText(String(year), 256, 138);
  try { ctx.letterSpacing = "10px"; } catch { /* older engines */ }
  ctx.fillStyle = "rgba(233,194,104,.72)";
  ctx.font = '700 30px "Space Mono", monospace';
  ctx.fillText("WORLD CHAMPION", 262, 208);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

const buildConeMaterial = () => new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
  uniforms: { uIntensity: { value: 0.12 }, uColor: { value: new THREE.Color("#ffd98a") } },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
  fragmentShader: `
    varying vec2 vUv;
    uniform float uIntensity;
    uniform vec3 uColor;
    void main() {
      float a = pow(vUv.y, 2.3) * uIntensity * smoothstep(0.0, 0.16, vUv.y);
      gl_FragColor = vec4(uColor, a);
    }`,
});

const buildMatcap = (stops, highlight) => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const base = ctx.createRadialGradient(100, 88, 8, 128, 128, 168);
  stops.forEach(([offset, color]) => base.addColorStop(offset, color));
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 256);
  const spot = ctx.createRadialGradient(88, 74, 2, 88, 74, 46);
  spot.addColorStop(0, highlight);
  spot.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = spot;
  ctx.fillRect(0, 0, 256, 256);
  const rim = ctx.createRadialGradient(196, 196, 4, 196, 196, 92);
  rim.addColorStop(0, "rgba(255,176,84,.32)");
  rim.addColorStop(1, "rgba(255,176,84,0)");
  ctx.fillStyle = rim;
  ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const buildGoldMatcap = () => buildMatcap([
  [0, "#fff3cd"], [0.22, "#f6cd62"], [0.48, "#c8922f"], [0.72, "#7a5518"], [1, "#33230a"],
], "rgba(255,252,236,.95)");

const buildSteelMatcap = () => buildMatcap([
  [0, "#8d939f"], [0.3, "#4c505a"], [0.62, "#26282e"], [1, "#0d0e11"],
], "rgba(230,236,248,.5)");

const VaultDust = ({ palette }) => {
  const group = useRef(null);
  const paletteRef = useRef(palette);
  paletteRef.current = palette;
  const geometry = useMemo(() => {
    const count = 380;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 1] = Math.random() * 6.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 9;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);
  const material = useMemo(() => new THREE.PointsMaterial({
    color: "#d8b264", size: 0.035, transparent: true, opacity: 0.5,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  }), []);
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.02;
    material.color.lerp(TMP_COLOR.set(paletteRef.current.dust), Math.min(1, 3.2 * delta));
  });
  return <group ref={group}><points geometry={geometry} material={material} frustumCulled={false} /></group>;
};

const VaultScene = ({ focus, spinRef, onPick, palette }) => {
  const { scene, camera } = useThree();
  const camX = useRef((focus - CENTER) * SPACING);
  const trophyRefs = useRef([]);
  const mirrorRefs = useRef([]);
  const paletteRef = useRef(palette);
  paletteRef.current = palette;

  useEffect(() => {
    scene.background = new THREE.Color("#050506");
    scene.fog = new THREE.FogExp2("#050506", 0.05);
    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [scene]);

  const parts = useMemo(buildTrophyParts, []);
  const goldMatcap = useMemo(buildGoldMatcap, []);
  const steelMatcap = useMemo(buildSteelMatcap, []);
  const silverMatcap = useMemo(buildSilverMatcap, []);
  const brushedMap = useMemo(buildBrushedTexture, []);
  const checkerMap = useMemo(buildCheckerTexture, []);
  const silverMaterials = useMemo(() => TITLES.map(() => new THREE.MeshMatcapMaterial({ matcap: silverMatcap, map: brushedMap, color: "#dfe1e6" })), [silverMatcap, brushedMap]);
  const goldMaterials = useMemo(() => TITLES.map(() => new THREE.MeshMatcapMaterial({ matcap: goldMatcap, color: "#ffffff" })), [goldMatcap]);
  const bandMaterials = useMemo(() => TITLES.map(() => new THREE.MeshBasicMaterial({ map: checkerMap, color: "#ffffff" })), [checkerMap]);
  const emblemCoreMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: "#14161c" }), []);
  const mirrorSilverMaterials = useMemo(() => TITLES.map(() => new THREE.MeshMatcapMaterial({ matcap: silverMatcap, color: "#eceef1", transparent: true, opacity: 0.18, depthWrite: false, side: THREE.BackSide })), [silverMatcap]);
  const mirrorGoldMaterials = useMemo(() => TITLES.map(() => new THREE.MeshMatcapMaterial({ matcap: goldMatcap, color: "#ffffff", transparent: true, opacity: 0.16, depthWrite: false, side: THREE.BackSide })), [goldMatcap]);
  const ringMaterials = useMemo(() => TITLES.map((title) => new THREE.MeshStandardMaterial({ color: "#060606", emissive: new THREE.Color(title.accent), emissiveIntensity: 0.4, metalness: 0.4, roughness: 0.5 })), []);
  const coneMaterials = useMemo(() => TITLES.map(buildConeMaterial), []);
  const plateTextures = useMemo(() => TITLES.map((title) => buildPlateTexture(title.year)), []);
  const plateMaterials = useMemo(() => TITLES.map((_, index) => new THREE.MeshBasicMaterial({ map: plateTextures[index], transparent: true, opacity: 0.12, depthWrite: false })), [plateTextures]);
  const pedestalMaterial = useMemo(() => new THREE.MeshMatcapMaterial({ matcap: steelMatcap, color: "#585c66" }), [steelMatcap]);
  const mirrorPedestalMaterial = useMemo(() => new THREE.MeshMatcapMaterial({ matcap: steelMatcap, color: "#585c66", transparent: true, opacity: 0.14, depthWrite: false, side: THREE.BackSide }), [steelMatcap]);
  const pillarMaterial = useMemo(() => new THREE.MeshMatcapMaterial({ matcap: steelMatcap, color: "#3c4048" }), [steelMatcap]);

  useEffect(() => () => {
    Object.values(parts).forEach((geometry) => geometry.dispose());
    goldMatcap.dispose();
    steelMatcap.dispose();
    silverMatcap.dispose();
    brushedMap.dispose();
    checkerMap.dispose();
    pedestalMaterial.dispose();
    mirrorPedestalMaterial.dispose();
    pillarMaterial.dispose();
    emblemCoreMaterial.dispose();
    [silverMaterials, goldMaterials, bandMaterials, mirrorSilverMaterials, mirrorGoldMaterials, ringMaterials, coneMaterials, plateMaterials].forEach((set) => set.forEach((mat) => mat.dispose()));
    plateTextures.forEach((texture) => texture.dispose());
  }, [parts, goldMatcap, steelMatcap, silverMatcap, brushedMap, checkerMap, pedestalMaterial, mirrorPedestalMaterial, pillarMaterial, emblemCoreMaterial, silverMaterials, goldMaterials, bandMaterials, mirrorSilverMaterials, mirrorGoldMaterials, ringMaterials, coneMaterials, plateMaterials, plateTextures]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    camX.current = THREE.MathUtils.damp(camX.current, (focus - CENTER) * SPACING, 2.6, delta);
    camera.position.set(camX.current, IS_MOBILE ? 1.9 : 1.78, IS_MOBILE ? 8.8 : 6.5);
    camera.lookAt(camX.current, IS_MOBILE ? 1.44 : 1.52, 0);
    const spin = spinRef.current;
    const dragTurn = spin.delta * 0.0075;
    if (spin.delta !== 0) { spin.vel = dragTurn; spin.delta = 0; }
    if (!spin.dragging) spin.vel *= Math.exp(-2.2 * delta);
    TITLES.forEach((_, index) => {
      const trophy = trophyRefs.current[index];
      if (!trophy) return;
      const focused = index === focus;
      trophy.rotation.y += focused ? 0.32 * delta + (spin.dragging ? dragTurn : spin.vel) : 0.1 * delta;
      trophy.rotation.z = Math.sin(time * 0.9 + index * 1.7) * 0.012;
      trophy.position.y = 0.735 + Math.sin(time * 1.3 + index * 1.1) * (focused ? 0.024 : 0.011);
      const breathe = focused ? 1.05 + Math.sin(time * 2.1) * 0.006 : 1.02;
      trophy.scale.setScalar(THREE.MathUtils.damp(trophy.scale.x, breathe, 4, delta));
      const mirror = mirrorRefs.current[index];
      if (mirror) {
        mirror.rotation.y = trophy.rotation.y;
        mirror.rotation.z = trophy.rotation.z;
        mirror.position.y = trophy.position.y;
        mirror.scale.copy(trophy.scale);
      }
      silverMaterials[index].color.lerp(TMP_COLOR.set(focused ? "#eff0f3" : "#575b63"), Math.min(1, 4 * delta));
      goldMaterials[index].color.lerp(TMP_COLOR.set(focused ? "#ffffff" : "#6f6146"), Math.min(1, 4 * delta));
      bandMaterials[index].color.copy(silverMaterials[index].color);
      mirrorSilverMaterials[index].color.copy(silverMaterials[index].color);
      mirrorGoldMaterials[index].color.copy(goldMaterials[index].color);
      ringMaterials[index].emissiveIntensity = THREE.MathUtils.damp(ringMaterials[index].emissiveIntensity, focused ? 2.3 : 0.35, 4, delta);
      plateMaterials[index].opacity = THREE.MathUtils.damp(plateMaterials[index].opacity, focused ? 1 : 0.12, 4, delta);
      coneMaterials[index].uniforms.uIntensity.value = THREE.MathUtils.damp(coneMaterials[index].uniforms.uIntensity.value, focused ? 0.5 : 0.11, 4, delta);
      coneMaterials[index].uniforms.uColor.value.lerp(TMP_COLOR.set(paletteRef.current.cone), Math.min(1, 3.2 * delta));
    });
  });

  return <group>
    <ambientLight intensity={0.5} />
    <directionalLight position={[4, 9, 6]} intensity={0.55} color="#fff2d5" />
    <mesh rotation-x={-Math.PI / 2} position-y={0} renderOrder={2}>
      <planeGeometry args={[72, 42]} />
      <meshBasicMaterial color="#050506" transparent opacity={0.72} depthWrite={false} />
    </mesh>
    <VaultDust palette={palette} />
    {TITLES.map((title, index) => {
      const x = (index - CENTER) * SPACING;
      return <group key={title.year} position={[x, 0, 0]}>
        <mesh material={pedestalMaterial} position={[0, 0.36, 0]}>
          <cylinderGeometry args={[0.85, 0.95, 0.72, 40]} />
        </mesh>
        <mesh material={ringMaterials[index]} position={[0, 0.735, 0]} rotation-x={-Math.PI / 2}>
          <torusGeometry args={[0.86, 0.022, 12, 64]} />
        </mesh>
        <mesh position={[0, 0.4, 0.94]} material={plateMaterials[index]}>
          <planeGeometry args={[1.06, 0.53]} />
        </mesh>
        <group
          ref={(node) => { trophyRefs.current[index] = node; }}
          position={[0, 0.735, 0]}
          scale={1.05}
          onClick={(event) => { event.stopPropagation(); onPick(index); }}
        >
          <mesh geometry={parts.body} material={silverMaterials[index]} />
          <mesh geometry={parts.spiral} material={goldMaterials[index]} />
          <mesh geometry={parts.band} material={bandMaterials[index]} position={[0, 0.4, 0]} />
          <mesh geometry={parts.rim} material={goldMaterials[index]} position={[0, 1.8, 0]} rotation-x={-Math.PI / 2} />
          <group position={[0, 1.6, 0.455]} rotation-x={-0.34}>
            <mesh geometry={parts.emblemRing} material={goldMaterials[index]} />
            <mesh geometry={parts.emblemCore} material={emblemCoreMaterial} position={[0, 0, -0.004]} />
          </group>
        </group>
        {/* faux reflection: mirrored copies under the floor */}
        <group scale={[1, -1, 1]}>
          <mesh material={mirrorPedestalMaterial} position={[0, 0.36, 0]} renderOrder={1}>
            <cylinderGeometry args={[0.85, 0.95, 0.72, 40]} />
          </mesh>
          <group ref={(node) => { mirrorRefs.current[index] = node; }} position={[0, 0.735, 0]} scale={1.05}>
            <mesh geometry={parts.body} material={mirrorSilverMaterials[index]} renderOrder={1} />
            <mesh geometry={parts.spiral} material={mirrorGoldMaterials[index]} renderOrder={1} />
          </group>
        </group>
        <mesh material={coneMaterials[index]} position={[0, 3.4, 0]}>
          <cylinderGeometry args={[0.34, 1.5, 5.4, 24, 1, true]} />
        </mesh>
        {index < TITLES.length - 1 && <mesh material={pillarMaterial} position={[SPACING / 2, 3, -2.7]}>
          <boxGeometry args={[0.18, 6, 0.18]} />
        </mesh>}
      </group>;
    })}
  </group>;
};

/* ── The chapter ─────────────────────────────────────────────────────── */

const MONUMENT_STATS = [
  ["105", "WINS", "monument-stat-wins"],
  ["202", "PODIUMS", "monument-stat-podiums"],
  ["104", "POLES", "monument-stat-poles"],
  ["368", "STARTS", "monument-stat-starts"],
];

export const LegacyVault = ({ isActive, teamTheme = "ferrari" }) => {
  const palette = THEME_PALETTES[teamTheme] || THEME_PALETTES.ferrari;
  const [phase, setPhase] = useState("monument");
  const [scene, setScene] = useState("monument");
  const [doors, setDoors] = useState("open");
  const [focus, setFocus] = useState(CENTER);
  const phaseRef = useRef("monument");
  const busyRef = useRef(false);
  const timersRef = useRef([]);
  const spinRef = useRef({ dragging: false, lastX: 0, delta: 0, vel: 0 });

  const schedule = useCallback((fn, ms) => { timersRef.current.push(window.setTimeout(fn, ms)); }, []);
  useEffect(() => () => timersRef.current.forEach(window.clearTimeout), []);

  const setPhaseBoth = useCallback((next) => { phaseRef.current = next; setPhase(next); }, []);

  const openVault = useCallback(() => {
    if (busyRef.current || phaseRef.current !== "monument") return;
    busyRef.current = true;
    setPhaseBoth("opening");
    const quick = REDUCED ? 0.35 : 1;
    schedule(() => setDoors("closed"), 480 * quick);
    schedule(() => setScene("vault"), 1500 * quick);
    schedule(() => setDoors("open"), 2150 * quick);
    schedule(() => { setPhaseBoth("vault"); busyRef.current = false; }, 2650 * quick);
  }, [schedule, setPhaseBoth]);

  const sealVault = useCallback(() => {
    if (busyRef.current || phaseRef.current !== "vault") return;
    busyRef.current = true;
    setPhaseBoth("closing");
    const quick = REDUCED ? 0.35 : 1;
    setDoors("closed");
    schedule(() => setScene("monument"), 1050 * quick);
    schedule(() => setDoors("open"), 1500 * quick);
    schedule(() => { setPhaseBoth("monument"); busyRef.current = false; }, 2000 * quick);
  }, [schedule, setPhaseBoth]);

  const handleStep = useCallback((dir) => {
    if (busyRef.current) return true;
    if (phaseRef.current === "monument" && dir === 1) { openVault(); return true; }
    if (phaseRef.current === "vault" && dir === -1) { sealVault(); return true; }
    return false;
  }, [openVault, sealVault]);
  useChapterStep("legacy", isActive, handleStep);

  useEffect(() => {
    if (!isActive) return undefined;
    const onKey = (event) => {
      if (phaseRef.current !== "vault") return;
      if (event.key === "ArrowLeft") setFocus((value) => Math.max(0, value - 1));
      if (event.key === "ArrowRight") setFocus((value) => Math.min(TITLES.length - 1, value + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isActive]);

  const onPointerDown = (event) => {
    if (phaseRef.current !== "vault") return;
    spinRef.current.dragging = true;
    spinRef.current.lastX = event.clientX;
  };
  const onPointerMove = (event) => {
    const spin = spinRef.current;
    if (!spin.dragging) return;
    spin.delta += event.clientX - spin.lastX;
    spin.lastX = event.clientX;
  };
  const endDrag = () => { spinRef.current.dragging = false; };

  const active = TITLES[focus];
  const unlocking = phase === "opening";

  return <section id="legacy" className="legacy-section legacy-vault" data-phase={phase} aria-labelledby="legacy-vault-title" data-testid="legacy-section">
    <div className="lv-bg" aria-hidden="true" />
    <div className="lv-canvas" data-cursor="drag" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerLeave={endDrag} data-testid="legacy-canvas-wrap">
      <Canvas
        camera={{ fov: 42, position: [0, 0, 11], near: 0.1, far: 140 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; }}
      >
        {scene === "monument"
          ? <MonumentParticles isActive={isActive} phaseRef={phaseRef} palette={palette} />
          : <VaultScene focus={focus} spinRef={spinRef} onPick={setFocus} palette={palette} />}
      </Canvas>
    </div>

    <AnimatePresence>
      {phase === "monument" && <motion.div key="mon" className="lv-mon-ui" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.7, delay: 0.3 } }} exit={{ opacity: 0, transition: { duration: 0.35 } }}>
        <p className="lv-mon-kicker" data-testid="monument-kicker">FORGED FROM {IS_MOBILE ? "6,500" : "14,000"} SHARDS OF {palette.shards}</p>
        <header className="lv-mon-head">
          <h2 id="legacy-vault-title" data-testid="legacy-section-title">ONE NUMBER.<span>SEVEN CROWNS.</span></h2>
          <p data-testid="legacy-statement">Every shard in this number was earned on a Sunday. <b>Move through the dust — it remembers.</b> Then open the vault it guards.</p>
        </header>
        <div className="lv-mon-stats" data-testid="monument-stats">
          {MONUMENT_STATS.map(([value, label, testId]) => <div key={label} data-testid={testId}><strong>{value}</strong><span>{label}</span></div>)}
        </div>
        <div className="lv-open">
          <button type="button" onClick={openVault} data-testid="open-vault-button">
            <i aria-hidden="true" />UNLOCK THE VAULT — SEVEN WORLD TITLES
          </button>
          <span className="lv-open-hint" data-testid="monument-scroll-hint">SCROLL OR CLICK · THE DOORS ARE HEAVY</span>
        </div>
      </motion.div>}
    </AnimatePresence>

    <AnimatePresence>
      {phase === "vault" && <motion.div key="vault" className="lv-vault-ui" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.25 } }} exit={{ opacity: 0, transition: { duration: 0.3 } }}>
        <div className="lv-vault-head">
          <p className="lv-vault-kicker" data-testid="vault-kicker">THE VAULT · SEVEN WORLD CHAMPIONSHIPS</p>
          <div className="lv-years" data-testid="vault-year-rail">
            {TITLES.map((title, index) => <button key={title.year} type="button" className={index === focus ? "is-active" : ""} onClick={() => setFocus(index)} data-testid={`vault-year-${title.year}`}>{title.year}</button>)}
          </div>
        </div>

        <button type="button" className="lv-nav lv-nav-prev" onClick={() => setFocus((value) => Math.max(0, value - 1))} disabled={focus === 0} aria-label="Previous championship" data-testid="vault-prev-button"><ChevronLeft /></button>
        <button type="button" className="lv-nav lv-nav-next" onClick={() => setFocus((value) => Math.min(TITLES.length - 1, value + 1))} disabled={focus === TITLES.length - 1} aria-label="Next championship" data-testid="vault-next-button"><ChevronRight /></button>

        <AnimatePresence mode="wait">
          <motion.article key={active.year} className="lv-story" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }} exit={{ opacity: 0, y: -14, transition: { duration: 0.2 } }} data-testid="vault-story-panel">
            <div className="lv-story-year" data-testid="vault-story-year">{active.year}</div>
            <p className="lv-story-meta" style={{ "--accent": active.accent }} data-testid="vault-story-meta"><i aria-hidden="true" />{active.team} · {active.car}</p>
            <h3 className="lv-story-head" data-testid="vault-story-headline">{active.headline}</h3>
            <p className="lv-story-text" data-testid="vault-story-text">{active.story}</p>
            <div className="lv-story-stats" data-testid="vault-story-stats">
              <div><strong>{active.wins}</strong><span>WINS</span></div>
              <div><strong>{active.poles}</strong><span>POLES</span></div>
              <div><strong>{active.points}</strong><span>POINTS</span></div>
              <div><strong>{String(focus + 1).padStart(2, "0")}/07</strong><span>TITLE</span></div>
            </div>
          </motion.article>
        </AnimatePresence>

        <div className="lv-vault-foot">
          <span className="lv-hint" data-testid="vault-drag-hint">DRAG TO ROTATE · ←→ TO WALK THE VAULT</span>
          <button type="button" className="lv-seal" onClick={sealVault} data-testid="seal-vault-button">SEAL THE VAULT ↑</button>
        </div>
      </motion.div>}
    </AnimatePresence>

    <div className={`lv-doors is-${doors} ${unlocking ? "is-unlocking" : ""}`} aria-hidden="true" data-testid="vault-doors">
      <div className="lv-door lv-door-l" />
      <div className="lv-door lv-door-r" />
      <div className="lv-lock">
        <span className="lv-lock-wheel" />
        <i>7</i>
      </div>
      <p className="lv-lock-text">{phase === "closing" ? "SEALING THE VAULT" : "UNLOCKING · SEVEN WORLD CHAMPIONSHIPS"}</p>
    </div>
  </section>;
};
