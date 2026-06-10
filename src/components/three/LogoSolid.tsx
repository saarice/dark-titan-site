import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildLogoGeometry } from "../../lib/logoMorph";
import { useObsidianMaterial } from "./obsidian";

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
  posX,
  ptr,
  reduced,
  breakProgress,
}: {
  posX: React.RefObject<number>;
  ptr: React.RefObject<{ x: number; y: number }>;
  reduced: boolean;
  /** the Break scrub's raw progress (0..1). This crest OPACITY-fades in over
   *  the exact window (0.97→1) and with the exact damping that the Break's own
   *  crest fades OUT, so the two are perfectly complementary at every scroll
   *  position — the handoff reads as one element. Scrubbing back up reverses it. */
  breakProgress: React.RefObject<number>;
}) {
  const camera = useThree((s) => s.camera);

  // Geometry has corrected winding + recomputed outward normals (see
  // buildLogoGeometry), so it renders FrontSide with correct lighting like the
  // monolith — no DoubleSide hack.
  // Sized down ~30% (3.0 → 2.1) — at full size the crest dominated every data
  // section it sat behind and read as noise rather than brand (Saar, 2026-06-09).
  const geom = useMemo(() => buildLogoGeometry(2.1), []);

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

  const dims = useMemo(() => {
    geom.computeBoundingBox();
    const bb = geom.boundingBox!;
    return {
      seamHeight: (bb.max.y - bb.min.y) * 0.94,
      frontZ: bb.max.z + 0.03,
    };
  }, [geom]);

  useEffect(() => () => geom.dispose(), [geom]);

  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const channel = useRef<THREE.Mesh>(null);
  const breakEl = useRef<HTMLElement | null>(null);
  const rotY = useRef(0);
  const rotX = useRef(0);
  const posXCur = useRef(0);
  const posYCur = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Mirror the Break scene EXACTLY: the RAW scroll value, the same narrow
    // window (0.985→0.995 ≈ 20px of scroll). The Break's crest does 1−fade,
    // this one does fade — a near-instant swap, complementary in the SAME
    // frame (no damping lag), overlapping for a blink. Full scale always;
    // OPACITY does the reveal (a growing crest next to a fading one would
    // read as a swap).
    const rawT = reduced ? 0 : THREE.MathUtils.clamp(breakProgress.current ?? 0, 0, 1);
    const present = THREE.MathUtils.clamp((rawT - 0.985) / 0.01, 0, 1);
    if (group.current) group.current.visible = present > 0.002;
    // SIZE LOCK: the global camera dollies back with scroll (cameraZ = 6.4 +
    // p·0.85, see choreography), so a fixed-size crest would read SMALLER than
    // the Break's crest (2.43 tall at its fixed camera z 7.4) at the moment of
    // the handoff. Scale by the live camera distance so this crest's SCREEN
    // size always equals the Break's — pixel-matched swap at any page length,
    // and a constant-size mark for the rest of the ride down.
    const camZ = camera.position.z || 6.4;
    const sizeLock = ((2.43 / 7.4) * camZ) / 2.1;
    if (inner.current) inner.current.scale.setScalar(sizeLock);
    material.opacity = present;
    if (channel.current) {
      (channel.current.material as THREE.MeshBasicMaterial).opacity = 0.92 * present;
    }
    // NOTE: deliberately NO blade glow / floor pool here — the light show
    // belongs to the Break's forge; the crest that rides the rest of the page
    // is the clean obsidian mark (the stray beam + glowing circle that tagged
    // along after the handoff were exactly this, removed 2026-06-10).

    // STRAIGHT DOWN first: the crest holds the Break's centre (x 0) while the
    // section is still leaving the screen, then eases onto the TRACK over the
    // next ~1.4 screens — no diagonal drift at the moment of the handoff.
    let xRelease = 1;
    if (!reduced) {
      if (!breakEl.current) breakEl.current = document.getElementById("break");
      const el = breakEl.current;
      if (el) {
        const bottom = el.getBoundingClientRect().bottom;
        const vh = window.innerHeight;
        const r = THREE.MathUtils.clamp((vh - bottom) / (vh * 1.4), 0, 1);
        xRelease = r * r * (3 - 2 * r); // smoothstep — gentle start, gentle end
      }
    }
    const posXTarget = reduced ? 1.9 : (posX.current ?? 0) * xRelease;
    // Vertical placement: projected to the SAME screen height as the Break's
    // crest (world y -0.17 at its camera z 7.4), camera-distance compensated —
    // no vertical jump at the handoff.
    const posYTarget = -(0.17 / 7.4) * camZ;
    posXCur.current = THREE.MathUtils.damp(posXCur.current, posXTarget, 3, delta);
    posYCur.current = THREE.MathUtils.damp(posYCur.current, posYTarget, 3, delta);

    // Turn the crest to face the camera at rest (compensating for its off-centre X
    // so the camera doesn't see it obliquely). Head-on, its front reflects the dark
    // background and reads dark; the pointer then tilts it AWAY from facing the
    // camera, swinging the violet lightformers into the reflection — so the sweep
    // only appears as you move the mouse. A whisper of idle sway keeps it alive.
    // Mostly frontal (faces the viewer), only partly turned toward the camera so
    // it doesn't read as a 3/4 view leaning to the side.
    // Pointer-follow + whisper of idle sway (restored 2026-06-10 — Saar wants
    // the crest tracking the mouse; overrides the earlier tester note).
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
    <group ref={group} visible={false}>
      {/* Only the faces live in `inner`, so only they squash into the seam. */}
      <group ref={inner}>
        <mesh geometry={geom} material={material} castShadow />
        {/* A dark recessed channel carved down the centre, so the two halves of
            the crest read as split by a deep gap with the light sitting in it
            (fades with the crest; no change to the logo's position). */}
        <mesh ref={channel} position={[0, 0, dims.frontZ - 0.02]}>
          <planeGeometry args={[0.1, dims.seamHeight * 1.02]} />
          <meshBasicMaterial color="#05030a" transparent opacity={0.92} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
