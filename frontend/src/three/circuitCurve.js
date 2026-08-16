import * as THREE from "three";
import { CIRCUIT_CHAPTERS, SILVERSTONE_PATH } from "../data/circuitRoute";

const SAMPLES = 520;
export const TRACK_SPAN = 900;
export const ROAD_WIDTH = 18;
export const KERB_WIDTH = 2.4;
export const RUNOFF_WIDTH = 54;

const SVG_NS = "http://www.w3.org/2000/svg";

/** Samples the authentic Silverstone SVG geometry into a centred 3D racing curve. */
const samplePath = () => {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.style.position = "absolute";
  svg.style.visibility = "hidden";
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", SILVERSTONE_PATH);
  svg.appendChild(path);
  document.body.appendChild(svg);
  const total = path.getTotalLength();
  const raw = [];
  for (let index = 0; index < SAMPLES; index += 1) {
    const point = path.getPointAtLength((total * index) / SAMPLES);
    raw.push([point.x, point.y]);
  }
  document.body.removeChild(svg);
  return raw;
};

export const buildCircuit = () => {
  const raw = samplePath();
  const xs = raw.map(([x]) => x);
  const ys = raw.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const scale = TRACK_SPAN / Math.max(maxX - minX, maxY - minY);

  const rotation = Math.PI * 0.22;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const points = raw.map(([x, y], index) => {
    const t = index / raw.length;
    const elevation = 2.6 + Math.sin(t * Math.PI * 4) * 1.15 + Math.sin(t * Math.PI * 6 + 1.15) * 0.75 + Math.sin(t * Math.PI * 10 + 0.4) * 0.35;
    const localX = (x - centerX) * scale;
    const localZ = (y - centerY) * scale;
    return new THREE.Vector3(localX * cos - localZ * sin, elevation, localX * sin + localZ * cos);
  });

  const curve = new THREE.CatmullRomCurve3(points, true, "centripetal", 0.5);
  const radius = (Math.max(maxX - minX, maxY - minY) * scale) / 2;
  return { curve, radius };
};

/** Flat ribbon that follows the racing line — used for asphalt, kerbs, run-off and paint. */
export const buildRibbon = (curve, { width, offset = 0, lift = 0, segments = 900, repeat = 1 }) => {
  const geometry = new THREE.BufferGeometry();
  const count = segments + 1;
  const positions = new Float32Array(count * 2 * 3);
  const uvs = new Float32Array(count * 2 * 2);
  const indices = [];
  const up = new THREE.Vector3(0, 1, 0);
  const point = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const side = new THREE.Vector3();

  for (let index = 0; index < count; index += 1) {
    const t = (index % segments) / segments;
    curve.getPointAt(t, point);
    curve.getTangentAt(t, tangent);
    side.crossVectors(tangent, up).normalize();
    const half = width / 2;
    const baseX = point.x + side.x * offset;
    const baseY = point.y + lift;
    const baseZ = point.z + side.z * offset;
    const stride = index * 6;
    positions[stride] = baseX - side.x * half;
    positions[stride + 1] = baseY;
    positions[stride + 2] = baseZ - side.z * half;
    positions[stride + 3] = baseX + side.x * half;
    positions[stride + 4] = baseY;
    positions[stride + 5] = baseZ + side.z * half;
    const uvStride = index * 4;
    const v = (index / segments) * repeat;
    uvs[uvStride] = 0;
    uvs[uvStride + 1] = v;
    uvs[uvStride + 2] = 1;
    uvs[uvStride + 3] = v;
    if (index < segments) {
      const a = index * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
};

/** Vertical strip used for the trackside barriers. */
export const buildWall = (curve, { offset, height, segments = 700, repeat = 90 }) => {
  const geometry = new THREE.BufferGeometry();
  const count = segments + 1;
  const positions = new Float32Array(count * 2 * 3);
  const uvs = new Float32Array(count * 2 * 2);
  const indices = [];
  const up = new THREE.Vector3(0, 1, 0);
  const point = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const side = new THREE.Vector3();

  for (let index = 0; index < count; index += 1) {
    const t = (index % segments) / segments;
    curve.getPointAt(t, point);
    curve.getTangentAt(t, tangent);
    side.crossVectors(tangent, up).normalize();
    const x = point.x + side.x * offset;
    const z = point.z + side.z * offset;
    const stride = index * 6;
    positions[stride] = x;
    positions[stride + 1] = point.y - 0.2;
    positions[stride + 2] = z;
    positions[stride + 3] = x;
    positions[stride + 4] = point.y + height;
    positions[stride + 5] = z;
    const uvStride = index * 4;
    const u = (index / segments) * repeat;
    uvs[uvStride] = u;
    uvs[uvStride + 1] = 0;
    uvs[uvStride + 2] = u;
    uvs[uvStride + 3] = 1;
    if (index < segments) {
      const a = index * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
};

const makeCanvas = (size = 256) => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  return canvas;
};

export const asphaltTexture = () => {
  const canvas = makeCanvas(256);
  const context = canvas.getContext("2d");
  context.fillStyle = "#6b6e78";
  context.fillRect(0, 0, 256, 256);
  const image = context.getImageData(0, 0, 256, 256);
  for (let index = 0; index < image.data.length; index += 4) {
    const noise = (Math.random() - 0.5) * 46;
    image.data[index] += noise;
    image.data[index + 1] += noise;
    image.data[index + 2] += noise;
  }
  context.putImageData(image, 0, 0);
  context.strokeStyle = "rgba(255,255,255,.05)";
  context.lineWidth = 1;
  for (let index = 0; index < 26; index += 1) {
    context.beginPath();
    context.moveTo(Math.random() * 256, 0);
    context.lineTo(Math.random() * 256, 256);
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
};

export const kerbTexture = () => {
  const canvas = makeCanvas(64);
  const context = canvas.getContext("2d");
  for (let index = 0; index < 8; index += 1) {
    context.fillStyle = index % 2 ? "#e8e8e8" : "#c81f1f";
    context.fillRect(0, index * 8, 64, 8);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

export const grassTexture = () => {
  const canvas = makeCanvas(256);
  const context = canvas.getContext("2d");
  context.fillStyle = "#3f5c37";
  context.fillRect(0, 0, 256, 256);
  for (let index = 0; index < 5200; index += 1) {
    context.fillStyle = `rgba(${48 + Math.random() * 40},${86 + Math.random() * 56},${44 + Math.random() * 34},.55)`;
    context.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(90, 90);
  return texture;
};

export const barrierTexture = () => {
  const canvas = makeCanvas(128);
  const context = canvas.getContext("2d");
  context.fillStyle = "#dfe2e4";
  context.fillRect(0, 0, 128, 128);
  context.fillStyle = "#c9302c";
  context.fillRect(0, 0, 42, 128);
  context.fillStyle = "rgba(0,0,0,.28)";
  context.fillRect(0, 104, 128, 24);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

export const startLineTexture = () => {
  const canvas = makeCanvas(128);
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 128, 128);
  context.fillStyle = "#111111";
  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      if ((row + column) % 2 === 0) context.fillRect(column * 16, row * 16, 16, 16);
    }
  }
  return new THREE.CanvasTexture(canvas);
};

export const CHAPTER_POSITIONS = CIRCUIT_CHAPTERS.map((chapter) => chapter.path);
