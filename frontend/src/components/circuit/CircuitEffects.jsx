import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from "@react-three/postprocessing";

/**
 * Post stack: HDR bloom on every emissive (racing line, gates, lamps, trail, motes), a vignette that
 * closes in during the chase and a speed-scaled chromatic fringe. Scaled down on mobile.
 */
export const CircuitEffects = ({ lifeRef, quality }) => {
  const vignette = useRef(null);
  const aberration = useRef(null);

  useFrame(() => {
    const life = lifeRef.current;
    if (vignette.current) {
      vignette.current.darkness = 0.32 + 0.4 * life.follow;
      vignette.current.offset = 0.28 + 0.08 * life.follow;
    }
    if (aberration.current) {
      const k = life.follow * (0.35 + 0.65 * life.speed) * 0.0011;
      aberration.current.offset.set(k, k * 0.6);
    }
  });

  return <EffectComposer multisampling={quality.msaa} enableNormalPass={false}>
    <Bloom mipmapBlur intensity={0.8} luminanceThreshold={0.95} luminanceSmoothing={0.3} radius={0.55} levels={quality.levels} resolutionScale={quality.bloomScale} />
    {quality.aberration ? <ChromaticAberration ref={aberration} offset={[0, 0]} radialModulation modulationOffset={0.35} /> : null}
    <Vignette ref={vignette} offset={0.3} darkness={0.35} eskil={false} />
  </EffectComposer>;
};
