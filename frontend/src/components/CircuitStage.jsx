/* eslint-disable react/no-unknown-property -- react-three-fiber scene graph props */
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MoveHorizontal } from "lucide-react";
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
import { UP, clamp, easeInOut, glow, moveToward, quadBezier } from "../three/circuitMath";
import { createOrbit, resetOrbit, stepOrbit } from "../three/circuitOrbit";
import { CircuitEffects } from "./circuit/CircuitEffects";
import { CarTrail, FloodFlicker, GateCascade, Motes } from "./circuit/CircuitLife";
import { RaceCar } from "./circuit/RaceCar";
import { useOrbitGestures } from "./circuit/useOrbitGestures";

const FOLLOW_DURATION = 1.2;

const SkyDome = ({ accent }) => {
  const material = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { uAccent: { value: new THREE.Color(accent) }, uTime: { value: 0 } },
    vertexShader: "varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `
      varying vec3 vPos;
      uniform vec3 uAccent;
      uniform float uTime;
      void main() {
        vec3 dir = normalize(vPos);
        float height = dir.y;
        vec3 top = vec3(0.016, 0.021, 0.043);
        vec3 horizon = mix(vec3(0.055, 0.07, 0.12), uAccent * 0.26, 0.22);
        vec3 bottom = vec3(0.01, 0.011, 0.017);
        vec3 color = mix(horizon, top, smoothstep(0.0, 0.55, height));
        color = mix(bottom, color, smoothstep(-0.35, 0.02, height));
        float angle = atan(dir.x, dir.z);
        float band = pow(0.5 + 0.5 * cos(angle - uTime * 0.055), 6.0);
        float cool = pow(0.5 + 0.5 * cos(angle - uTime * 0.055 + 3.1416), 9.0);
        float low = smoothstep(0.42, 0.0, height) * smoothstep(-0.1, 0.03, height);
        color += uAccent * band * low * 0.12 + vec3(0.25, 0.4, 0.75) * cool * low * 0.05;
        gl_FragColor = vec4(color, 1.0);
      }`,
  // eslint-disable-next-line react-hooks/exhaustive-deps -- accent is live-updated through the uniform
  }), []);
  useEffect(() => { material.uniforms.uAccent.value.set(accent); }, [accent, material]);
  useFrame((state) => { material.uniforms.uTime.value = state.clock.elapsedTime; });
  useEffect(() => () => material.dispose(), [material]);
  return <mesh material={material} frustumCulled={false}><sphereGeometry args={[3400, 32, 16]} /></mesh>;
};

const Gate = ({ position, quaternion, index, registry }) => {
  const bar = useRef(null);
  const lamp = useRef(null);
  const floor = useRef(null);
  useEffect(() => {
    const list = registry.current;
    list[index] = { bar: bar.current, lamp: lamp.current, floor: floor.current };
    return () => { delete list[index]; };
  }, [index, registry]);

  return <group position={position} quaternion={quaternion}>
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
      <meshBasicMaterial ref={bar} toneMapped={false} />
    </mesh>
    <mesh position={[0, 19.4, -1.0]}>
      <boxGeometry args={[6, 1.6, 0.1]} />
      <meshBasicMaterial ref={lamp} toneMapped={false} />
    </mesh>
    <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[ROAD_WIDTH, 2.6]} />
      <meshBasicMaterial ref={floor} transparent opacity={0.35} depthWrite={false} toneMapped={false} />
    </mesh>
  </group>;
};

const FloodLight = ({ position, index, registry, withLight }) => {
  const head = useRef(null);
  const light = useRef(null);
  useEffect(() => {
    const list = registry.current;
    list[index] = { head: head.current, light: light.current, seed: index * 1.37 };
    return () => { delete list[index]; };
  }, [index, registry]);

  return <group position={position}>
    <mesh position={[0, 15, 0]}><cylinderGeometry args={[0.45, 0.75, 30, 6]} /><meshStandardMaterial color="#191a1f" metalness={0.6} roughness={0.5} /></mesh>
    <mesh position={[0, 30.6, 0]}><boxGeometry args={[6, 1.6, 1]} /><meshBasicMaterial ref={head} toneMapped={false} /></mesh>
    <mesh position={[0, 16, 0]} rotation={[Math.PI, 0, 0]}>
      <coneGeometry args={[20, 31, 20, 1, true]} />
      <meshBasicMaterial color="#a9c4ff" transparent opacity={0.045} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
    <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[42, 28]} />
      <meshBasicMaterial color="#a8c4ff" transparent opacity={0.3} depthWrite={false} toneMapped={false} />
    </mesh>
    {withLight && <pointLight ref={light} position={[0, 27, 0]} distance={190} intensity={420} color="#cfe0ff" />}
  </group>;
};

const Scenery = ({ curve, accent, lampRegistry }) => {
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

  const ledStrip = useMemo(() => glow(accent, 1.0), [accent]);

  return <group>
    {props.stands.map(({ key, position, rotation }) => <group key={key} position={position} rotation={rotation}>
      <mesh><boxGeometry args={[118, 18, 32]} /><meshStandardMaterial color="#191b21" roughness={0.85} /></mesh>
      <mesh position={[0, 11, 0]}><boxGeometry args={[122, 2.4, 36]} /><meshStandardMaterial color="#101218" roughness={0.9} /></mesh>
      <mesh position={[0, 2.8, 16.4]}><boxGeometry args={[112, 8, 0.4]} /><meshBasicMaterial color={accent} transparent opacity={0.12} toneMapped={false} /></mesh>
      <mesh position={[0, 12.4, 18.2]}><boxGeometry args={[116, 0.35, 0.2]} /><meshBasicMaterial color={ledStrip} toneMapped={false} /></mesh>
    </group>)}
    {props.lights.map(({ key, position }, index) => <FloodLight key={key} position={position} index={index} registry={lampRegistry} withLight={index % 2 === 0} />)}
  </group>;
};

/**
 * Camera director. Overview = manual/idle orbit around the track centre; chase = behind the car with
 * speed lag, acceleration dip and banking. The two are joined by a bezier swoop rather than a straight lerp.
 */
const Rig = ({ curve, radius, travelRef, labelRefs, carRef, racingMaterial, orbitRef, lifeRef }) => {
  const { camera, size } = useThree();
  const smooth = useRef({ progress: 0, follow: 0, speed: 0, accel: 0, prevProgress: 0, overviewToken: 0 });
  const scratch = useMemo(() => ({
    point: new THREE.Vector3(),
    tangent: new THREE.Vector3(),
    ahead: new THREE.Vector3(),
    side: new THREE.Vector3(),
    chasePos: new THREE.Vector3(),
    chaseLook: new THREE.Vector3(),
    overviewPos: new THREE.Vector3(),
    control: new THREE.Vector3(),
    controlLook: new THREE.Vector3(),
    look: new THREE.Vector3(),
    marker: new THREE.Vector3(),
    carLook: new THREE.Vector3(),
    delta: new THREE.Vector3(),
  }), []);
  const curveLength = useMemo(() => curve.getLength(), [curve]);
  const base = useMemo(() => {
    const fit = (radius * 0.82) / Math.tan(THREE.MathUtils.degToRad(18));
    const look = new THREE.Vector3(0, radius * 0.02, -radius * 0.05);
    const offset = new THREE.Vector3(0, fit * 0.5, fit * 0.88).sub(look);
    const dist = offset.length();
    return { look, dist, el: Math.asin(offset.y / dist) };
  }, [radius]);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const travel = window.__spatialDebug || travelRef.current;
    const orbit = orbitRef.current;
    const life = lifeRef.current;
    const time = state.clock.elapsedTime;
    const s = smooth.current;

    const resumed = rawDelta > 0.25;
    if (travel.overviewToken !== s.overviewToken) {
      s.overviewToken = travel.overviewToken;
      if (resumed) s.follow = 1;
      curve.getPointAt(clamp(travel.progress, 0, 0.9999), scratch.point);
      resetOrbit(orbit, Math.atan2(scratch.point.x - base.look.x, scratch.point.z - base.look.z), 0);
    } else if (resumed) {
      s.follow = travel.follow;
    }
    if (!travel.visible) resetOrbit(orbit, 0, Infinity);

    s.progress += (travel.progress - s.progress) * Math.min(1, delta * 7);
    s.follow = moveToward(s.follow, travel.follow, delta / FOLLOW_DURATION);
    const t = clamp(s.progress, 0, 0.9999);
    const follow = easeInOut(clamp(s.follow, 0, 1));

    const instantSpeed = (s.progress - s.prevProgress) / Math.max(delta, 1e-4);
    s.prevProgress = s.progress;
    const previousSpeed = s.speed;
    s.speed += (instantSpeed - s.speed) * Math.min(1, delta * 6);
    s.accel += ((s.speed - previousSpeed) / Math.max(delta, 1e-4) - s.accel) * Math.min(1, delta * 4);
    const speedNorm = clamp(Math.abs(s.speed) * 9, 0, 1);

    curve.getPointAt(t, scratch.point);
    curve.getTangentAt(t, scratch.tangent).normalize();
    curve.getTangentAt(Math.min(0.9999, t + 0.006), scratch.ahead).normalize();
    scratch.side.crossVectors(scratch.tangent, UP).normalize();
    const bank = clamp(scratch.delta.copy(scratch.ahead).sub(scratch.tangent).dot(scratch.side) * 9, -0.24, 0.24);

    const lag = 15.5 + speedNorm * 6;
    const dip = clamp(-s.accel * 5, -1.2, 1.0);
    scratch.chasePos.copy(scratch.point).addScaledVector(scratch.tangent, -lag).addScaledVector(UP, 6 + dip).addScaledVector(scratch.side, bank * 4.5);
    scratch.chaseLook.copy(scratch.point).addScaledVector(scratch.tangent, 22).addScaledVector(UP, 1.2);

    const framing = stepOrbit(orbit, delta, time, base.el, !life.reduced);
    const portrait = Math.max(1, Math.pow(size.height / Math.max(1, size.width), 0.75));
    const dist = base.dist * framing.zoom * portrait;
    const flat = Math.cos(framing.el) * dist;
    scratch.overviewPos.set(base.look.x + Math.sin(framing.az) * flat, base.look.y + Math.sin(framing.el) * dist, base.look.z + Math.cos(framing.az) * flat);

    const sideSign = Math.sign(scratch.delta.copy(scratch.overviewPos).sub(scratch.chasePos).dot(scratch.side)) || 1;
    const span = scratch.overviewPos.distanceTo(scratch.chasePos);
    scratch.control.lerpVectors(scratch.overviewPos, scratch.chasePos, 0.5).addScaledVector(scratch.side, -sideSign * Math.min(radius * 0.3, span * 0.35));
    scratch.control.y = scratch.chasePos.y + (scratch.overviewPos.y - scratch.chasePos.y) * 0.22;
    scratch.controlLook.copy(scratch.point).addScaledVector(UP, 2.5);

    quadBezier(camera.position, scratch.overviewPos, scratch.control, scratch.chasePos, follow);
    quadBezier(scratch.look, base.look, scratch.controlLook, scratch.chaseLook, follow);
    if (!life.reduced && follow > 0) {
      const shake = speedNorm * 0.35 * follow;
      camera.position.addScaledVector(scratch.side, Math.sin(time * 17.3) * shake).addScaledVector(UP, Math.sin(time * 23.1) * shake * 0.6);
    }
    camera.lookAt(scratch.look);
    camera.rotation.z += bank * 0.55 * follow - Math.sin(follow * Math.PI) * 0.09 * sideSign;
    const fov = THREE.MathUtils.lerp(36, 64, follow) + Math.sin(follow * Math.PI) * 6;
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
      racingMaterial.uniforms.uTime.value = time;
    }

    life.follow = follow;
    life.speed = speedNorm;
    life.velocity = Math.abs(s.speed) * curveLength;
    life.bank = bank;
    life.t = t;

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

const CircuitWorld = ({ accent, activeKey, travelRef, labelRefs, orbitRef, lifeRef, quality }) => {
  const carRef = useRef(null);
  const gateRegistry = useRef([]);
  const lampRegistry = useRef([]);
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
    uniforms: { uProgress: { value: 0 }, uTime: { value: 0 }, uColor: { value: glow(accent, 0.55) } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `
      varying vec2 vUv;
      uniform float uProgress;
      uniform float uTime;
      uniform vec3 uColor;
      void main() {
        float reveal = smoothstep(uProgress + 0.003, uProgress - 0.012, vUv.y);
        float core = 1.0 - smoothstep(0.12, 0.95, abs(vUv.x - 0.5) * 2.0);
        float pulse = 0.82 + 0.18 * sin(vUv.y * 420.0 - uTime * 2.4);
        float head = fract(uTime * 0.045);
        float packet = exp(-fract(head - vUv.y) * 70.0) + 0.6 * exp(-fract(head + 0.5 - vUv.y) * 70.0);
        packet *= 0.25 + 0.75 * reveal;
        float alpha = (0.16 + 0.84 * reveal) * core * pulse + packet * core * 0.9;
        if (alpha < 0.015) discard;
        vec3 color = uColor * (0.9 + 1.1 * reveal) + uColor * packet * 4.0;
        gl_FragColor = vec4(color, min(alpha, 1.0));
      }`,
  // eslint-disable-next-line react-hooks/exhaustive-deps -- accent is live-updated through the uniform
  }), []);

  useEffect(() => {
    racingMaterial.uniforms.uColor.value.copy(glow(accent, 0.55));
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

  const activeIndex = CIRCUIT_CHAPTERS.findIndex((chapter) => chapter.key === activeKey);

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

    <Scenery curve={world.curve} accent={accent} lampRegistry={lampRegistry} />
    {gates.map((gate, index) => <Gate key={gate.key} position={gate.position} quaternion={gate.quaternion} index={index} registry={gateRegistry} />)}
    <RaceCar innerRef={carRef} accent={accent} lifeRef={lifeRef} />
    <Rig curve={world.curve} radius={world.radius} travelRef={travelRef} labelRefs={labelRefs} carRef={carRef} racingMaterial={racingMaterial} orbitRef={orbitRef} lifeRef={lifeRef} />
    <GateCascade registry={gateRegistry} accent={accent} activeIndex={activeIndex} />
    <FloodFlicker registry={lampRegistry} />
    {!quality.reduced && <Motes curve={world.curve} accent={accent} count={quality.motes} />}
    {!quality.reduced && <CarTrail curve={world.curve} accent={accent} lifeRef={lifeRef} />}
    {quality.effects && <CircuitEffects lifeRef={lifeRef} quality={quality} />}
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
        advance(performance.now() / 1000);
      } catch { /* best effort: readiness still reported */ }
      if (!cancelled) onReady?.();
    });
    return () => { cancelled = true; cancelAnimationFrame(frame); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

const detectQuality = () => {
  const mobile = window.matchMedia("(max-width: 850px), (pointer: coarse)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return {
    mobile,
    reduced,
    effects: !reduced,
    msaa: 2,
    bloomScale: mobile ? 0.5 : 0.75,
    levels: mobile ? 4 : 6,
    aberration: !mobile,
    motes: mobile ? 220 : 520,
    dpr: mobile ? [1, 1.25] : [1, 1.4],
  };
};

export const CircuitStage = ({ accent = "#e10600", activeKey, onSelect, paused, travelRef, onReady, orbitable = false }) => {
  const labelRefs = useRef([]);
  const wrapperRef = useRef(null);
  const orbitRef = useRef(createOrbit());
  const enabledRef = useRef(orbitable);
  const quality = useMemo(detectQuality, []);
  const lifeRef = useRef({ follow: 0, speed: 0, velocity: 0, bank: 0, t: 0, reduced: quality.reduced });
  enabledRef.current = orbitable;
  const { touched, handlers } = useOrbitGestures({ orbitRef, travelRef, enabledRef, wrapperRef });

  return <div
    ref={wrapperRef}
    className="circuit-3d"
    data-testid="silverstone-circuit-map"
    data-orbitable={orbitable ? "true" : "false"}
    data-cursor={orbitable ? "drag" : "none"}
    {...handlers}
  >
    <Canvas
      className="circuit-3d-canvas"
      frameloop={paused ? "never" : "always"}
      dpr={quality.dpr}
      gl={{ antialias: !quality.effects, powerPreference: "high-performance", alpha: false, toneMapping: THREE.NoToneMapping }}
      camera={{ fov: 36, near: 1, far: 6000, position: [0, 900, 900] }}
    >
      <CircuitWorld accent={accent} activeKey={activeKey} travelRef={travelRef} labelRefs={labelRefs} orbitRef={orbitRef} lifeRef={lifeRef} quality={quality} />
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
    <div className={`circuit-orbit-hint ${orbitable && !touched ? "is-visible" : ""}`} data-testid="circuit-orbit-hint" aria-hidden="true">
      <MoveHorizontal size={13} strokeWidth={1.6} />
      <span>{quality.mobile ? "DRAG TO ORBIT · PINCH TO ZOOM" : "DRAG TO ORBIT · CTRL + SCROLL TO ZOOM"}</span>
    </div>
  </div>;
};
