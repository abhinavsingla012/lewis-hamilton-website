/* eslint-disable react/no-unknown-property -- react-three-fiber scene graph props */
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CIRCUIT_CHAPTERS } from "../data/circuitRoute";
import {
  KERB_WIDTH,
  ROAD_WIDTH,
  RUNOFF_WIDTH,
  asphaltTexture,
  barrierTexture,
  buildCircuit,
  buildRibbon,
  buildWall,
  grassTexture,
  kerbTexture,
  startLineTexture,
} from "../three/circuitCurve";

const UP = new THREE.Vector3(0, 1, 0);
const easeInOut = (value) => (value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2);

const SkyDome = ({ accent }) => {
  const material = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { uAccent: { value: new THREE.Color(accent) } },
    vertexShader: "varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `
      varying vec3 vPos;
      uniform vec3 uAccent;
      void main() {
        float height = normalize(vPos).y;
        vec3 top = vec3(0.016, 0.021, 0.043);
        vec3 horizon = mix(vec3(0.055, 0.07, 0.12), uAccent * 0.26, 0.22);
        vec3 bottom = vec3(0.01, 0.011, 0.017);
        vec3 color = mix(horizon, top, smoothstep(0.0, 0.55, height));
        color = mix(bottom, color, smoothstep(-0.35, 0.02, height));
        gl_FragColor = vec4(color, 1.0);
      }`,
  }), [accent]);
  useEffect(() => () => material.dispose(), [material]);
  return <mesh material={material} frustumCulled={false}><sphereGeometry args={[3400, 32, 16]} /></mesh>;
};

const Gate = ({ position, quaternion, accent, isActive }) => (
  <group position={position} quaternion={quaternion}>
    <mesh position={[-(ROAD_WIDTH / 2 + 5.4), 9.5, 0]}>
      <boxGeometry args={[1.4, 19, 1.4]} />
      <meshStandardMaterial color="#1a1c22" metalness={0.75} roughness={0.4} />
    </mesh>
    <mesh position={[ROAD_WIDTH / 2 + 5.4, 9.5, 0]}>
      <boxGeometry args={[1.4, 19, 1.4]} />
      <meshStandardMaterial color="#1a1c22" metalness={0.75} roughness={0.4} />
    </mesh>
    <mesh position={[0, 19.4, 0]}>
      <boxGeometry args={[ROAD_WIDTH + 12.4, 2.6, 1.8]} />
      <meshStandardMaterial color="#14161b" metalness={0.6} roughness={0.5} />
    </mesh>
    <mesh position={[0, 17.9, 1.0]}>
      <boxGeometry args={[ROAD_WIDTH + 11.6, 0.6, 0.12]} />
      <meshBasicMaterial color={accent} toneMapped={false} />
    </mesh>
    <mesh position={[0, 19.4, -1.0]}>
      <boxGeometry args={[6, 1.6, 0.1]} />
      <meshBasicMaterial color={isActive ? accent : "#3a3d45"} toneMapped={false} />
    </mesh>
    <pointLight position={[0, 15, 0]} distance={70} intensity={isActive ? 130 : 55} color={accent} />
    <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[ROAD_WIDTH, 2.6]} />
      <meshBasicMaterial color={accent} transparent opacity={isActive ? 0.85 : 0.35} toneMapped={false} />
    </mesh>
  </group>
);

const RaceCar = ({ innerRef, accent }) => (
  <group ref={innerRef} scale={2.6}>
    <mesh position={[0, 0.34, 0.15]} castShadow>
      <boxGeometry args={[1.15, 0.34, 3.1]} />
      <meshStandardMaterial color={accent} metalness={0.55} roughness={0.32} />
    </mesh>
    <mesh position={[0, 0.28, 1.95]}>
      <boxGeometry args={[0.55, 0.2, 1.1]} />
      <meshStandardMaterial color={accent} metalness={0.5} roughness={0.35} />
    </mesh>
    <mesh position={[0, 0.16, 2.5]}>
      <boxGeometry args={[2.05, 0.09, 0.62]} />
      <meshStandardMaterial color="#0d0d10" metalness={0.4} roughness={0.5} />
    </mesh>
    <mesh position={[0, 0.95, -1.45]}>
      <boxGeometry args={[1.75, 0.42, 0.12]} />
      <meshStandardMaterial color="#0d0d10" metalness={0.4} roughness={0.5} />
    </mesh>
    <mesh position={[0, 0.62, -1.45]}>
      <boxGeometry args={[0.1, 0.68, 0.4]} />
      <meshStandardMaterial color="#141418" />
    </mesh>
    <mesh position={[0, 0.68, 0.5]}>
      <boxGeometry args={[0.62, 0.3, 0.7]} />
      <meshStandardMaterial color="#101014" metalness={0.3} roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.9, 0.95]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.42, 0.06, 8, 20]} />
      <meshStandardMaterial color="#16171c" metalness={0.6} roughness={0.4} />
    </mesh>
    {[[-0.92, 1.35], [0.92, 1.35], [-0.95, -1.05], [0.95, -1.05]].map(([x, z]) => (
      <mesh key={`${x}-${z}`} position={[x, 0.38, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.38, 0.38, 0.36, 16]} />
        <meshStandardMaterial color="#0b0b0d" roughness={0.92} />
      </mesh>
    ))}
    <mesh position={[0, 0.55, -1.65]}>
      <boxGeometry args={[0.22, 0.12, 0.05]} />
      <meshBasicMaterial color="#ff2d1a" toneMapped={false} />
    </mesh>
    <pointLight position={[0, 2.4, 0]} distance={150} intensity={900} color="#e8f0ff" />
    <pointLight position={[0, 1.4, 14]} distance={120} intensity={620} color="#dfe9ff" />
    <pointLight position={[0, 1.6, -10]} distance={70} intensity={180} color="#ff3a22" />
    <mesh position={[0, 0.02, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[2.2, 20]} />
      <meshBasicMaterial color="#000000" transparent opacity={0.4} />
    </mesh>
    <mesh position={[0, 0.05, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[3.4, 24]} />
      <meshBasicMaterial color={accent} transparent opacity={0.22} depthWrite={false} toneMapped={false} />
    </mesh>
  </group>
);

const Scenery = ({ curve, accent }) => {
  const props = useMemo(() => {
    const stands = [];
    const lights = [];
    const point = new THREE.Vector3();
    const tangent = new THREE.Vector3();
    const side = new THREE.Vector3();
    [0.02, 0.53, 0.78].forEach((t, index) => {
      curve.getPointAt(t, point);
      curve.getTangentAt(t, tangent);
      side.crossVectors(tangent, UP).normalize();
      const distance = RUNOFF_WIDTH / 2 + 108;
      const sign = index % 2 ? 1 : -1;
      stands.push({
        key: `stand-${t}`,
        position: [point.x + side.x * distance * sign, point.y + 9, point.z + side.z * distance * sign],
        rotation: [0, Math.atan2(tangent.x, tangent.z), 0],
      });
    });
    for (let index = 0; index < 8; index += 1) {
      const t = index / 8;
      curve.getPointAt(t, point);
      curve.getTangentAt(t, tangent);
      side.crossVectors(tangent, UP).normalize();
      const sign = index % 2 ? 1 : -1;
      const distance = RUNOFF_WIDTH / 2 + 18;
      lights.push({
        key: `light-${index}`,
        position: [point.x + side.x * distance * sign, point.y, point.z + side.z * distance * sign],
      });
    }
    return { stands, lights };
  }, [curve]);

  return <group>
    {props.stands.map(({ key, position, rotation }) => <group key={key} position={position} rotation={rotation}>
      <mesh><boxGeometry args={[118, 18, 32]} /><meshStandardMaterial color="#191b21" roughness={0.85} /></mesh>
      <mesh position={[0, 11, 0]}><boxGeometry args={[122, 2.4, 36]} /><meshStandardMaterial color="#101218" roughness={0.9} /></mesh>
      <mesh position={[0, 2.8, 16.4]}><boxGeometry args={[112, 8, 0.4]} /><meshBasicMaterial color={accent} transparent opacity={0.16} toneMapped={false} /></mesh>
    </group>)}
    {props.lights.map(({ key, position }, index) => <group key={key} position={position}>
      <mesh position={[0, 15, 0]}><cylinderGeometry args={[0.45, 0.75, 30, 6]} /><meshStandardMaterial color="#191a1f" metalness={0.6} roughness={0.5} /></mesh>
      <mesh position={[0, 30.6, 0]}><boxGeometry args={[6, 1.6, 1]} /><meshBasicMaterial color="#eef3ff" toneMapped={false} /></mesh>
      <mesh position={[0, 16, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[20, 31, 20, 1, true]} />
        <meshBasicMaterial color="#a9c4ff" transparent opacity={0.045} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[42, 28]} />
        <meshBasicMaterial color="#a8c4ff" transparent opacity={0.3} depthWrite={false} toneMapped={false} />
      </mesh>
      {index % 2 === 0 && <pointLight position={[0, 27, 0]} distance={190} intensity={420} color="#cfe0ff" />}
    </group>)}
  </group>;
};

const Rig = ({ curve, radius, travelRef, labelRefs, carRef, racingMaterial }) => {
  const { camera, size } = useThree();
  const smooth = useRef({ progress: 0, follow: 0 });
  const scratch = useMemo(() => ({
    point: new THREE.Vector3(),
    tangent: new THREE.Vector3(),
    ahead: new THREE.Vector3(),
    side: new THREE.Vector3(),
    chasePos: new THREE.Vector3(),
    chaseLook: new THREE.Vector3(),
    overviewPos: new THREE.Vector3(),
    overviewLook: new THREE.Vector3(),
    look: new THREE.Vector3(),
    marker: new THREE.Vector3(),
    carLook: new THREE.Vector3(),
  }), []);

  useFrame((state, delta) => {
    const travel = window.__spatialDebug || travelRef.current;
    const step = Math.min(1, delta * 7);
    smooth.current.progress += (travel.progress - smooth.current.progress) * step;
    smooth.current.follow += (travel.follow - smooth.current.follow) * Math.min(1, delta * 3.4);
    const t = THREE.MathUtils.clamp(smooth.current.progress, 0, 0.9999);
    const follow = easeInOut(THREE.MathUtils.clamp(smooth.current.follow, 0, 1));

    curve.getPointAt(t, scratch.point);
    curve.getTangentAt(t, scratch.tangent).normalize();
    curve.getTangentAt(Math.min(0.9999, t + 0.006), scratch.ahead).normalize();
    scratch.side.crossVectors(scratch.tangent, UP).normalize();
    const bank = THREE.MathUtils.clamp(scratch.ahead.clone().sub(scratch.tangent).dot(scratch.side) * 9, -0.24, 0.24);

    scratch.chasePos.copy(scratch.point).addScaledVector(scratch.tangent, -22).addScaledVector(UP, 7.2).addScaledVector(scratch.side, bank * 5);
    scratch.chaseLook.copy(scratch.point).addScaledVector(scratch.tangent, 34).addScaledVector(UP, 2.2);
    const drift = state.clock.elapsedTime * 0.05;
    const fit = (radius * 0.82) / Math.tan(THREE.MathUtils.degToRad(18));
    scratch.overviewPos.set(Math.sin(drift) * radius * 0.12, fit * 0.5, fit * 0.88 + Math.cos(drift) * radius * 0.05);
    scratch.overviewLook.set(0, radius * 0.02, -radius * 0.05);

    camera.position.lerpVectors(scratch.overviewPos, scratch.chasePos, follow);
    scratch.look.lerpVectors(scratch.overviewLook, scratch.chaseLook, follow);
    camera.lookAt(scratch.look);
    camera.rotation.z += bank * 0.55 * follow;
    const fov = THREE.MathUtils.lerp(36, 64, follow);
    if (Math.abs(camera.fov - fov) > 0.02) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    const car = carRef.current;
    if (car) {
      car.position.copy(scratch.point).addScaledVector(UP, 0.05);
      scratch.carLook.copy(scratch.point).addScaledVector(scratch.tangent, 6);
      car.lookAt(scratch.carLook);
      car.rotateZ(-bank * 0.55);
    }

    if (racingMaterial) {
      racingMaterial.uniforms.uProgress.value = travel.coverage;
      racingMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    }

    const labels = labelRefs.current;
    for (let index = 0; index < CIRCUIT_CHAPTERS.length; index += 1) {
      const element = labels[index];
      if (!element) continue;
      curve.getPointAt(CIRCUIT_CHAPTERS[index].path, scratch.marker);
      scratch.marker.y += 26 + (index % 3) * 18;
      scratch.marker.project(camera);
      const onScreen = scratch.marker.z < 1 && Math.abs(scratch.marker.x) < 1.35 && Math.abs(scratch.marker.y) < 1.35;
      const visibility = onScreen ? Math.max(0, 1 - follow * 2.4) : 0;
      element.style.opacity = visibility.toFixed(3);
      element.style.pointerEvents = visibility > 0.55 ? "auto" : "none";
      element.style.transform = `translate3d(${((scratch.marker.x * 0.5 + 0.5) * size.width).toFixed(1)}px, ${((-scratch.marker.y * 0.5 + 0.5) * size.height).toFixed(1)}px, 0) translate(-50%, -100%)`;
    }
  });

  return null;
};

const CircuitWorld = ({ accent, activeKey, travelRef, labelRefs, worldRef }) => {
  const carRef = useRef(null);
  const world = useMemo(() => {
    const { curve, radius } = buildCircuit();
    return {
      curve,
      radius,
      road: buildRibbon(curve, { width: ROAD_WIDTH, repeat: 210 }),
      runoff: buildRibbon(curve, { width: RUNOFF_WIDTH, lift: -0.14, repeat: 70 }),
      kerbLeft: buildRibbon(curve, { width: KERB_WIDTH, offset: -(ROAD_WIDTH / 2 + KERB_WIDTH / 2 - 0.06), lift: 0.02, repeat: 420 }),
      kerbRight: buildRibbon(curve, { width: KERB_WIDTH, offset: ROAD_WIDTH / 2 + KERB_WIDTH / 2 - 0.06, lift: 0.02, repeat: 420 }),
      paintLeft: buildRibbon(curve, { width: 0.7, offset: -(ROAD_WIDTH / 2 - 0.9), lift: 0.05, repeat: 1 }),
      paintRight: buildRibbon(curve, { width: 0.7, offset: ROAD_WIDTH / 2 - 0.9, lift: 0.05, repeat: 1 }),
      racing: buildRibbon(curve, { width: 3.4, lift: 0.16, repeat: 1 }),
      barrierLeft: buildWall(curve, { offset: -(RUNOFF_WIDTH / 2 + 4), height: 3.4 }),
      barrierRight: buildWall(curve, { offset: RUNOFF_WIDTH / 2 + 4, height: 3.4 }),
    };
  }, []);
  worldRef.current = world;

  const textures = useMemo(() => ({
    asphalt: asphaltTexture(),
    runoff: asphaltTexture(),
    kerb: kerbTexture(),
    grass: grassTexture(),
    barrier: barrierTexture(),
    start: startLineTexture(),
  }), []);

  const racingMaterial = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uProgress: { value: 0 }, uTime: { value: 0 }, uColor: { value: new THREE.Color(accent) } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `
      varying vec2 vUv;
      uniform float uProgress;
      uniform float uTime;
      uniform vec3 uColor;
      void main() {
        float reveal = smoothstep(uProgress + 0.003, uProgress - 0.012, vUv.y);
        float core = 1.0 - smoothstep(0.12, 0.95, abs(vUv.x - 0.5) * 2.0);
        float pulse = 0.78 + 0.22 * sin(vUv.y * 420.0 - uTime * 2.4);
        float alpha = (0.16 + 0.84 * reveal) * core * pulse;
        if (alpha < 0.015) discard;
        gl_FragColor = vec4(uColor * (0.9 + 0.95 * reveal), alpha);
      }`,
  }), []);

  useEffect(() => {
    racingMaterial.uniforms.uColor.value.set(accent);
  }, [accent, racingMaterial]);

  useEffect(() => () => {
    Object.values(textures).forEach((texture) => texture.dispose?.());
    Object.values(world).forEach((entry) => entry?.dispose?.());
    racingMaterial.dispose();
  }, [textures, world, racingMaterial]);

  const gates = useMemo(() => {
    const point = new THREE.Vector3();
    const tangent = new THREE.Vector3();
    return CIRCUIT_CHAPTERS.map((chapter) => {
      world.curve.getPointAt(chapter.path, point);
      world.curve.getTangentAt(chapter.path, tangent);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent.clone().normalize());
      return { key: chapter.key, position: point.clone(), quaternion };
    });
  }, [world]);

  const startLine = useMemo(() => {
    const point = new THREE.Vector3();
    const tangent = new THREE.Vector3();
    world.curve.getPointAt(0, point);
    world.curve.getTangentAt(0, tangent);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent.clone().normalize());
    return { position: point.clone().setY(point.y + 0.08), quaternion };
  }, [world]);

  return <>
    <color attach="background" args={["#05060b"]} />
    <fog attach="fog" args={["#0c1420", 1600, 6200]} />
    <SkyDome accent={accent} />
    <hemisphereLight args={["#6d86bd", "#1e2a1a", 1.7]} />
    <ambientLight intensity={0.85} />
    <directionalLight position={[620, 520, -380]} intensity={1.6} color="#d6e0ff" />
    <directionalLight position={[-560, 320, 460]} intensity={0.8} color="#8fb0ee" />

    <mesh position={[0, 24, 0]}>
      <cylinderGeometry args={[2600, 2680, 92, 48, 1, true]} />
      <meshStandardMaterial color="#0d1712" side={THREE.BackSide} roughness={1} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
      <planeGeometry args={[7000, 7000]} />
      <meshStandardMaterial map={textures.grass} color="#657a5c" roughness={1} />
    </mesh>

    <mesh geometry={world.runoff}><meshStandardMaterial map={textures.runoff} color="#8d919b" roughness={0.98} /></mesh>
    <mesh geometry={world.road}><meshStandardMaterial map={textures.asphalt} color="#8b8f9a" roughness={0.78} metalness={0.08} /></mesh>
    <mesh geometry={world.kerbLeft}><meshStandardMaterial map={textures.kerb} emissiveMap={textures.kerb} emissive="#ffffff" emissiveIntensity={0.22} roughness={0.6} /></mesh>
    <mesh geometry={world.kerbRight}><meshStandardMaterial map={textures.kerb} emissiveMap={textures.kerb} emissive="#ffffff" emissiveIntensity={0.22} roughness={0.6} /></mesh>
    <mesh geometry={world.paintLeft}><meshStandardMaterial color="#e8eaee" roughness={0.5} /></mesh>
    <mesh geometry={world.paintRight}><meshStandardMaterial color="#e8eaee" roughness={0.5} /></mesh>
    <mesh geometry={world.racing} material={racingMaterial} />
    <mesh geometry={world.barrierLeft}><meshStandardMaterial map={textures.barrier} side={THREE.DoubleSide} roughness={0.7} /></mesh>
    <mesh geometry={world.barrierRight}><meshStandardMaterial map={textures.barrier} side={THREE.DoubleSide} roughness={0.7} /></mesh>

    <group position={startLine.position} quaternion={startLine.quaternion}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROAD_WIDTH, 5]} />
        <meshBasicMaterial map={textures.start} toneMapped={false} />
      </mesh>
    </group>

    <Scenery curve={world.curve} accent={accent} />
    {gates.map((gate) => <Gate key={gate.key} position={gate.position} quaternion={gate.quaternion} accent={accent} isActive={activeKey === gate.key} />)}
    <RaceCar innerRef={carRef} accent={accent} />
    <Rig curve={world.curve} radius={world.radius} travelRef={travelRef} labelRefs={labelRefs} carRef={carRef} racingMaterial={racingMaterial} />
  </>;
};

/**
 * Boot warm-up: compiles every shader program and draws one frame while the start lights are
 * still on, so the first camera travel never stutters on lazy compilation.
 */
const WarmUp = ({ onReady }) => {
  const { gl, scene, camera, advance } = useThree();
  useEffect(() => {
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      try {
        gl.compile(scene, camera);
        advance(performance.now());
      } catch { /* best effort: readiness still reported */ }
      if (!cancelled) onReady?.();
    });
    return () => { cancelled = true; cancelAnimationFrame(frame); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

export const CircuitStage = ({ accent = "#e10600", activeKey, onSelect, paused, travelRef, onReady }) => {
  const labelRefs = useRef([]);
  const worldRef = useRef(null);

  return <div className="circuit-3d" data-testid="silverstone-circuit-map">
    <Canvas
      className="circuit-3d-canvas"
      frameloop={paused ? "never" : "always"}
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false, toneMapping: THREE.NoToneMapping }}
      camera={{ fov: 36, near: 1, far: 6000, position: [0, 900, 900] }}
    >
      <CircuitWorld accent={accent} activeKey={activeKey} travelRef={travelRef} labelRefs={labelRefs} worldRef={worldRef} />
      <WarmUp onReady={onReady} />
    </Canvas>
    <div className="circuit-3d-labels" aria-hidden={paused ? "true" : "false"}>
      {CIRCUIT_CHAPTERS.map((chapter, index) => <button
        key={chapter.key}
        type="button"
        ref={(node) => { labelRefs.current[index] = node; }}
        className={`circuit-pin ${activeKey === chapter.key ? "is-active" : ""}`}
        onClick={() => onSelect(chapter.key)}
        data-testid={`chapter-marker-${chapter.key}`}
        aria-label={`Open ${chapter.label} chapter`}
      >
        <span className="circuit-pin-body" data-testid={`chapter-marker-${chapter.key}-content`}>
          <b>{String(index + 1).padStart(2, "0")}</b>
          <span><strong>{chapter.label}</strong><small>{chapter.teaser}</small></span>
        </span>
        <i className="circuit-pin-stem" aria-hidden="true" />
      </button>)}
    </div>
  </div>;
};
