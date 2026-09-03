/* eslint-disable react/no-unknown-property -- react-three-fiber scene graph props */
import { useEffect, useMemo, useRef } from "react";
import { extend, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { clamp, glow } from "../../three/circuitMath";

extend({ RoundedBoxGeometry });

const CARBON = { color: "#0e0f12", metalness: 0.55, roughness: 0.42 };
const DARK = { color: "#15161a", metalness: 0.4, roughness: 0.5 };
const TIRE = { color: "#0a0a0c", roughness: 0.96 };
const RIM = { color: "#2b2d33", metalness: 0.92, roughness: 0.3 };
const HELMET = "#ffd400";
const WHEEL_RADIUS = 0.34;
const RAIN_LIGHT = glow("#ff2d1a", 1.4);

const numberTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, 256, 256);
  context.font = "italic 900 168px Unbounded, Impact, 'Arial Black', sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.lineJoin = "round";
  context.lineWidth = 14;
  context.strokeStyle = "rgba(8,8,10,.9)";
  context.strokeText("44", 128, 138);
  context.fillStyle = "#f7f6f1";
  context.fillText("44", 128, 138);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

const Wheel = ({ position, width, steer, registry, index }) => {
  const spin = useRef(null);
  useEffect(() => {
    const list = registry.current;
    list[index] = { spin: spin.current, steer };
    return () => { delete list[index]; };
  }, [index, registry, steer]);

  return <group position={position}>
    <group ref={spin}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, width, 28]} />
        <meshStandardMaterial {...TIRE} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, width + 0.012, 20]} />
        <meshStandardMaterial {...RIM} />
      </mesh>
      {[-1, 1].map((sign) => <mesh key={sign} position={[sign * (width / 2 + 0.003), 0, 0]} rotation={[0, sign * Math.PI / 2, 0]}>
        <ringGeometry args={[0.27, 0.305, 32]} />
        <meshBasicMaterial color="#f5d000" side={THREE.DoubleSide} />
      </mesh>)}
    </group>
  </group>;
};

/**
 * Procedural F1 car: tapered nose, monocoque, coke-bottle sidepods, airbox, engine cover with
 * shark fin, halo + helmet, front/rear wings with endplates, diffuser, wishbones and spinning
 * wheels with soft-compound sidewalls. +Z is forward; the parent Rig orients the group.
 */
export const RaceCar = ({ innerRef, accent, lifeRef }) => {
  const wheels = useRef([]);
  const decal = useMemo(numberTexture, []);
  useEffect(() => () => decal.dispose(), [decal]);
  const body = { color: accent, metalness: 0.25, roughness: 0.34 };

  useFrame((_, rawDelta) => {
    const life = lifeRef.current;
    const delta = Math.min(rawDelta, 0.05);
    const angular = (life.velocity / (WHEEL_RADIUS * 2.4)) * delta;
    const steer = clamp(-life.bank * 1.3, -0.32, 0.32);
    wheels.current.forEach((wheel) => {
      if (!wheel?.spin) return;
      wheel.spin.rotation.x += angular;
      if (wheel.steer) wheel.spin.parent.rotation.y += (steer - wheel.spin.parent.rotation.y) * Math.min(1, delta * 8);
    });
  });

  return <group ref={innerRef} scale={2.4}>
    <mesh position={[0, 0.1, 0.05]}><roundedBoxGeometry args={[1.45, 0.04, 2.9, 2, 0.02]} /><meshStandardMaterial {...CARBON} /></mesh>
    <mesh position={[0, 0.3, 0.35]} castShadow><roundedBoxGeometry args={[0.62, 0.28, 1.9, 3, 0.08]} /><meshStandardMaterial {...body} /></mesh>
    <mesh position={[0, 0.3, 1.72]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.58]}>
      <cylinderGeometry args={[0.07, 0.21, 0.85, 14]} />
      <meshStandardMaterial {...body} />
    </mesh>
    {[-1, 1].map((sign) => <group key={`pod-${sign}`}>
      <mesh position={[sign * 0.5, 0.27, -0.15]} castShadow><roundedBoxGeometry args={[0.42, 0.26, 1.25, 3, 0.09]} /><meshStandardMaterial {...body} /></mesh>
      <mesh position={[sign * 0.5, 0.27, 0.48]}><boxGeometry args={[0.34, 0.16, 0.06]} /><meshStandardMaterial {...CARBON} /></mesh>
      <mesh position={[sign * 0.72, 0.3, 0.1]} rotation={[0, sign * Math.PI / 2, 0]}>
        <planeGeometry args={[0.3, 0.2]} />
        <meshBasicMaterial map={decal} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
      <mesh position={[sign * 0.4, 0.32, 1.32]}><boxGeometry args={[0.6, 0.022, 0.05]} /><meshStandardMaterial {...CARBON} /></mesh>
      <mesh position={[sign * 0.4, 0.2, 1.26]}><boxGeometry args={[0.6, 0.022, 0.05]} /><meshStandardMaterial {...CARBON} /></mesh>
      <mesh position={[sign * 0.45, 0.34, -1.0]}><boxGeometry args={[0.55, 0.022, 0.05]} /><meshStandardMaterial {...CARBON} /></mesh>
      <mesh position={[sign * 0.45, 0.2, -0.94]}><boxGeometry args={[0.55, 0.022, 0.05]} /><meshStandardMaterial {...CARBON} /></mesh>
      <mesh position={[sign * 0.78, 0.2, 2.05]}><boxGeometry args={[0.03, 0.22, 0.5]} /><meshStandardMaterial {...CARBON} /></mesh>
      <mesh position={[sign * 0.52, 0.75, -1.45]}><boxGeometry args={[0.03, 0.42, 0.55]} /><meshStandardMaterial {...CARBON} /></mesh>
      <mesh position={[sign * 0.11, 0.66, -1.4]}><boxGeometry args={[0.04, 0.4, 0.08]} /><meshStandardMaterial {...CARBON} /></mesh>
    </group>)}
    <mesh position={[0, 0.5, -0.55]} castShadow><roundedBoxGeometry args={[0.34, 0.3, 1.2, 3, 0.1]} /><meshStandardMaterial {...body} /></mesh>
    <mesh position={[0, 0.72, -0.9]}><boxGeometry args={[0.03, 0.28, 0.7]} /><meshStandardMaterial {...body} /></mesh>
    <mesh position={[0, 0.72, -0.05]}><roundedBoxGeometry args={[0.3, 0.2, 0.34, 3, 0.07]} /><meshStandardMaterial {...body} /></mesh>
    <mesh position={[0, 0.72, 0.13]}><boxGeometry args={[0.24, 0.13, 0.04]} /><meshStandardMaterial {...CARBON} /></mesh>
    <mesh position={[0, 0.46, 0.5]}><roundedBoxGeometry args={[0.36, 0.12, 0.5, 2, 0.04]} /><meshStandardMaterial {...DARK} /></mesh>
    <mesh position={[0, 0.55, 0.42]}><sphereGeometry args={[0.13, 20, 14]} /><meshStandardMaterial color={HELMET} metalness={0.35} roughness={0.25} /></mesh>
    <mesh position={[0, 0.56, 0.53]}><boxGeometry args={[0.18, 0.07, 0.05]} /><meshStandardMaterial color="#0a0a0c" metalness={0.8} roughness={0.15} /></mesh>
    <mesh position={[0, 0.62, 0.45]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.27, 0.028, 10, 28]} /><meshStandardMaterial {...CARBON} /></mesh>
    <mesh position={[0, 0.55, 0.74]} rotation={[0.35, 0, 0]}><boxGeometry args={[0.04, 0.2, 0.04]} /><meshStandardMaterial {...CARBON} /></mesh>
    <mesh position={[0, 0.12, 2.1]}><boxGeometry args={[1.55, 0.035, 0.42]} /><meshStandardMaterial {...body} /></mesh>
    <mesh position={[0, 0.2, 1.96]} rotation={[-0.38, 0, 0]}><boxGeometry args={[1.4, 0.03, 0.2]} /><meshStandardMaterial {...CARBON} /></mesh>
    <mesh position={[0, 0.86, -1.45]} rotation={[0.18, 0, 0]}><boxGeometry args={[1.02, 0.05, 0.34]} /><meshStandardMaterial {...body} /></mesh>
    <mesh position={[0, 0.98, -1.55]} rotation={[0.5, 0, 0]}><boxGeometry args={[1.0, 0.03, 0.18]} /><meshStandardMaterial {...CARBON} /></mesh>
    <mesh position={[0, 0.5, -1.4]}><boxGeometry args={[0.9, 0.03, 0.16]} /><meshStandardMaterial {...CARBON} /></mesh>
    <mesh position={[0, 0.16, -1.35]} rotation={[-0.3, 0, 0]}><boxGeometry args={[1.0, 0.12, 0.3]} /><meshStandardMaterial {...CARBON} /></mesh>
    <mesh position={[0, 0.4, -1.62]}><boxGeometry args={[0.16, 0.1, 0.04]} /><meshBasicMaterial color={RAIN_LIGHT} toneMapped={false} /></mesh>

    <Wheel position={[-0.72, WHEEL_RADIUS, 1.28]} width={0.36} steer registry={wheels} index={0} />
    <Wheel position={[0.72, WHEEL_RADIUS, 1.28]} width={0.36} steer registry={wheels} index={1} />
    <Wheel position={[-0.74, WHEEL_RADIUS, -1.0]} width={0.44} registry={wheels} index={2} />
    <Wheel position={[0.74, WHEEL_RADIUS, -1.0]} width={0.44} registry={wheels} index={3} />

    <pointLight position={[0, 2.4, 0]} distance={150} intensity={900} color="#e8f0ff" />
    <pointLight position={[0, 1.4, 14]} distance={120} intensity={620} color="#dfe9ff" />
    <pointLight position={[0, 1.6, -10]} distance={70} intensity={180} color="#ff3a22" />
    <mesh position={[0, 0.02, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[2.2, 20]} />
      <meshBasicMaterial color="#000000" transparent opacity={0.4} />
    </mesh>
    <mesh position={[0, 0.05, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[3.4, 24]} />
      <meshBasicMaterial color={glow(accent, 0.7)} transparent opacity={0.22} depthWrite={false} toneMapped={false} />
    </mesh>
  </group>;
};
