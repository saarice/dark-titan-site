import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildLogoGeometry } from "../../lib/logoMorph";
import { useObsidianMaterial } from "./obsidian";
import { useBladeGlow, usePoolGlow } from "./glows";
import { smoothstep } from "../../lib/choreography";

/**
 * The solid 3D Dark Titan crest. Shares the monolith's MeshStandardMaterial,
 * stone textures and base colour (#140f20) and is lit by the same scene lights +
 * environment. Its metalness/roughness/envMapIntensity are dialled DOWN from the
 * monolith's defaults, though: the crest's many angled facets catch far more of
 * the violet lights than the monolith's flat slab, so identical settings blow it
 * out to bright violet. The reduced values + facing the camera at rest keep it
 * reading as dark polished obsidian — matching the monolith despite the geometry.
 * It owns the hero + Chaos, then collapses (shrinks + turns) as the monolith
 * assembles in at the Factory section.
 */
export default function LogoSolid({
  scroll,
  posX,
  ptr,
  reduced,
}: {
  scroll: React.RefObject<number>;
  posX: React.RefObject<number>;
  ptr: React.RefObject<{ x: number; y: number }>;
  reduced: boolean;
}) {
  const camera = useThree((s) => s.camera);

  // Geometry has corrected winding + recomputed outward normals (see
  // buildLogoGeometry), so it renders FrontSide with correct lighting like the
  // monolith — no DoubleSide hack.
  const geom = useMemo(() => buildLogoGeometry(3.0), []);

  // The monolith's obsidian, but with metalness/roughness/env dialled down from
  // its defaults (0.62/0.16/2.6) so the crest's facets don't blow out to violet
  // under the same scene lights. Same base colour + textures as the monolith.
  const material = useObsidianMaterial({
    side: THREE.FrontSide,
    repeat: [0.017, 0.006],
    roughness: 0.2,
    envMapIntensity: 0.6,
    metalness: 0.55,
    color: "#140f20",
  });

  const bladeGlow = useBladeGlow();
  const poolGlow = usePoolGlow();
  const dims = useMemo(() => {
    geom.computeBoundingBox();
    const bb = geom.boundingBox!;
    return {
      seamHeight: (bb.max.y - bb.min.y) * 0.94,
      frontZ: bb.max.z + 0.03,
      bottomY: bb.min.y,
    };
  }, [geom]);

  useEffect(() => () => geom.dispose(), [geom]);

  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const seam = useRef<THREE.Mesh>(null);
  const pool = useRef<THREE.Mesh>(null);
  const rotY = useRef(0);
  const rotX = useRef(0);
  const posXCur = useRef(0);
  const posYCur = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = reduced ? 0 : scroll.current ?? 0;

    // The crest logo now ASSEMBLES behind the Factory demo — the monolith owns the
    // hero + Chaos, then fades out there as the crest scales in and takes over for
    // the data sections. No morph gimmicks, a clean cross-fade. Reduced motion shows
    // only the monolith (the hero reading), so the crest stays hidden.
    const present = reduced ? 0 : smoothstep(0.16, 0.24, p);
    if (inner.current) inner.current.scale.setScalar(present);

    // Seam glow + floor pool fade out with the crest.
    if (seam.current) {
      (seam.current.material as THREE.MeshBasicMaterial).opacity =
        (0.55 + Math.sin(t * 0.9) * 0.08) * present;
    }
    if (pool.current) {
      (pool.current.material as THREE.MeshBasicMaterial).opacity =
        (0.4 + Math.sin(t * 0.8) * 0.05) * present;
    }

    const posXTarget = reduced ? 1.9 : posX.current ?? 0;
    // Vertical placement: sits a touch below centre so the crest reads centred
    // against the hero copy block. (~0.15 world units ≈ 24px at this viewport.)
    const posYTarget = -0.15;
    posXCur.current = THREE.MathUtils.damp(posXCur.current, posXTarget, 3, delta);
    posYCur.current = THREE.MathUtils.damp(posYCur.current, posYTarget, 3, delta);

    // Turn the crest to face the camera at rest (compensating for its off-centre X
    // so the camera doesn't see it obliquely). Head-on, its front reflects the dark
    // background and reads dark; the pointer then tilts it AWAY from facing the
    // camera, swinging the violet lightformers into the reflection — so the sweep
    // only appears as you move the mouse. A whisper of idle sway keeps it alive.
    // Mostly frontal (faces the viewer), only partly turned toward the camera so
    // it doesn't read as a 3/4 view leaning to the side.
    const faceCam = Math.atan2(-posXCur.current, camera.position.z || 6.4) * 0.45;
    const ptX = reduced ? 0 : ptr.current?.x ?? 0;
    const ptY = reduced ? 0 : ptr.current?.y ?? 0;
    const sway = reduced ? 0 : Math.sin(t * 0.22) * 0.02;
    rotY.current = THREE.MathUtils.damp(rotY.current, faceCam + sway + ptX * 0.35, 3, delta);
    rotX.current = THREE.MathUtils.damp(rotX.current, ptY * 0.1, 3, delta);

    if (group.current) {
      group.current.rotation.y = rotY.current;
      group.current.rotation.x = rotX.current;
      group.current.position.x = posXCur.current;
      group.current.position.y = posYCur.current;
    }
  });

  return (
    <group ref={group}>
      {/* Only the faces live in `inner`, so only they squash into the seam. */}
      <group ref={inner}>
        <mesh geometry={geom} material={material} castShadow />
        {/* A dark recessed channel carved down the centre, so the two halves of
            the crest read as split by a deep gap with the light sitting in it
            (rides + scales with the crest; no change to the logo's position). */}
        <mesh position={[0, 0, dims.frontZ - 0.02]}>
          <planeGeometry args={[0.1, dims.seamHeight * 1.02]} />
          <meshBasicMaterial color="#05030a" transparent opacity={0.92} toneMapped={false} />
        </mesh>
      </group>

      {/* Seam glow OUTSIDE `inner`: a deep, luminous slit of light sitting in the
          carved channel — the throughline the crest and monolith share. */}
      <mesh ref={seam} position={[0, 0, dims.frontZ]}>
        {/* Kept within the crest's height + inside the dark channel width, so the
            blade of light sits IN the slit and never pokes out past the logo. */}
        <planeGeometry args={[0.18, dims.seamHeight * 0.96]} />
        <meshBasicMaterial
          map={bladeGlow}
          color="#9A4DFF"
          transparent
          opacity={1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Violet pool spilling onto the floor under the crest, like the monolith. */}
      <mesh ref={pool} rotation={[-Math.PI / 2, 0, 0]} position={[0, dims.bottomY + 0.04, 0.1]}>
        <planeGeometry args={[2.1, 2.1]} />
        <meshBasicMaterial
          map={poolGlow}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
