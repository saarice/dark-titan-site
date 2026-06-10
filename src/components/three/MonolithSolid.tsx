import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows, Grid, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { sceneStateFor, smoothstep } from "../../lib/choreography";
import { useObsidianMaterial } from "./obsidian";
import { useSlotGlow, usePoolGlow } from "./glows";

/**
 * "Main 2": one whole obsidian monolith that never breaks.
 *
 * The shape is the Main reading (a straight, flat-topped rectangular block,
 * not the F obelisk with a pyramidion), but rendered as a SINGLE upright stone
 * instead of two parting slabs. It stays sealed the whole way down the page,
 * only swaying with the pointer and drifting aside as the hero copy scrolls off.
 *
 * The material is the F "Obsidian" reading: near-black volcanic glass, low
 * roughness and a high environment intensity so the violet/pink lightformers
 * streak across the polished faces.
 *
 * Down the centre there is no bright seam line. Instead the block is split by a
 * narrow vertical GAP: a dark recess behind it reads as shadowed depth, and a
 * soft, blurred violet glow (F's seam colour #D4BBFF, the same family as the
 * shadowed interior) bleeds out of the slot - present, not a laser.
 */

const SLAB_H = 3.7; // monolith height
const HALF_W = 0.62; // width of each half
const DEPTH = 0.62;
const GAP = 0.1; // slot width between the two halves
const HALF_H = SLAB_H / 2;
const HALF_X = GAP / 2 + HALF_W / 2; // x of each half's centre
const DEBRIS = 420; // floating "stars" drifting around the monolith (from Main)

export default function MonolithSolid({
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
  const { camera, size } = useThree();
  const isMobile = size.width < 768;

  const group = useRef<THREE.Group>(null);
  const stoneGroup = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const pool = useRef<THREE.Mesh>(null);
  const debrisRef = useRef<THREE.InstancedMesh>(null);

  const slotGlow = useSlotGlow();
  const poolGlow = usePoolGlow();

  // "Stars": tiny octahedrons scattered in a spherical shell around the stone.
  // Kept from the Main scene; here they just drift gently (the stone never
  // breaks, so they stay put rather than exploding outward).
  const debrisHome = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < DEBRIS; i++) {
      const r = 2.6 + Math.random() * 6;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(Math.random() * 2 - 1);
      arr.push(
        new THREE.Vector3(
          Math.sin(ph) * Math.cos(th) * r * 1.5,
          Math.cos(ph) * r * 0.9,
          Math.sin(ph) * Math.sin(th) * r - 1,
        ),
      );
    }
    return arr;
  }, []);
  const debrisScale = useMemo(
    () => Array.from({ length: DEBRIS }, () => 0.012 + Math.random() * 0.02),
    [],
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // The shared Dark Titan "Obsidian" material (identical to the solid crest logo).
  const material = useObsidianMaterial();

  const rotY = useRef(0);
  const rotX = useRef(0);
  const posXCur = useRef(0);
  const posYCur = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = reduced ? 0 : scroll.current ?? 0;
    const s = sceneStateFor(p);

    // The solid stone owns the hero, then fades/scales out — and nothing
    // replaces it (the crest appears only in the Break finale). The grid, stars
    // and environment stay as the data sections' backdrop. Reduced motion keeps
    // the static monolith.
    const appear = reduced ? 1 : 1 - smoothstep(0.14, 0.2, p);
    if (stoneGroup.current) stoneGroup.current.scale.setScalar(appear);

    // Soft pulse on the slot glow + floor pool (whole, never breaks).
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.82 + Math.sin(t * 0.9) * 0.1;
    }
    if (pool.current) {
      (pool.current.material as THREE.MeshBasicMaterial).opacity =
        0.45 + Math.sin(t * 0.9) * 0.05;
      pool.current.scale.setScalar(1.2 + Math.sin(t * 0.8) * 0.05);
    }

    // Drift the "stars": each octahedron holds its home position and bobs/spins
    // slowly. Frozen (no spin/bob) under reduced motion.
    if (debrisRef.current) {
      for (let i = 0; i < DEBRIS; i++) {
        const h = debrisHome[i];
        const bob = reduced ? 0 : Math.sin(t * 0.3 + i) * 0.12;
        dummy.position.set(h.x, h.y + bob, h.z);
        dummy.scale.setScalar(debrisScale[i]);
        dummy.rotation.set(reduced ? i : t * 0.1 + i, reduced ? i : t * 0.13 + i, 0);
        dummy.updateMatrix();
        debrisRef.current.setMatrixAt(i, dummy.matrix);
      }
      debrisRef.current.instanceMatrix.needsUpdate = true;
    }

    // Pointer sway + gentle scroll rotation (restored 2026-06-10 — Saar wants
    // the stone following the mouse; overrides the earlier tester note).
    const ptX = reduced ? 0 : ptr.current?.x ?? 0;
    const ptY = reduced ? 0 : ptr.current?.y ?? 0;
    const sway = reduced ? 0 : Math.sin(t * 0.22) * 0.06;
    rotY.current = THREE.MathUtils.damp(rotY.current, sway + p * 0.28 + ptX * 0.16, 3, delta);
    rotX.current = THREE.MathUtils.damp(rotX.current, ptY * 0.07, 3, delta);

    // Lateral position is choreographed per section (right -> centre -> left ...)
    // by useMonolithX. Reduced motion parks the stone at its hero spot.
    const posXTarget = reduced ? 1.9 : posX.current ?? 0;
    // Centred against the hero copy (the monolith only shows through hero+Chaos
    // now, then hands off to the crest) — sits a touch below centre rather than
    // floating high near the nav.
    const posYTarget = -0.1;
    posXCur.current = THREE.MathUtils.damp(posXCur.current, posXTarget, 3, delta);
    posYCur.current = THREE.MathUtils.damp(posYCur.current, posYTarget, 3, delta);

    if (group.current) {
      group.current.rotation.y = rotY.current;
      group.current.rotation.x = rotX.current;
      group.current.position.x = posXCur.current;
      group.current.position.y = posYCur.current;
    }

    camera.position.z = THREE.MathUtils.damp(camera.position.z, s.cameraZ, 3, delta);
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={group}>
      {/* "stars": tiny octahedrons drifting around the stone (kept from Main) */}
      <instancedMesh ref={debrisRef} args={[undefined, undefined, DEBRIS]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#544a78" metalness={0.4} roughness={0.6} envMapIntensity={1} />
      </instancedMesh>

      {/* The solid stone, scaled in by `appear` once the morph cloud has gathered
          it. Everything that *is* the stone lives in here; the grid, stars and
          reflection environment stay outside so they're present from the start. */}
      <group ref={stoneGroup} scale={0}>
        {/* two obsidian halves with a fixed slot - reads as one sealed stone */}
        <RoundedBox
          args={[HALF_W, SLAB_H, DEPTH]}
          radius={0.05}
          smoothness={4}
          position={[-HALF_X, 0, 0]}
          material={material}
          castShadow
          receiveShadow
        />
        <RoundedBox
          args={[HALF_W, SLAB_H, DEPTH]}
          radius={0.05}
          smoothness={4}
          position={[HALF_X, 0, 0]}
          material={material}
          castShadow
          receiveShadow
        />

        {/* recessed dark backing inside the slot: shadowed depth, not a hole */}
        <mesh position={[0, 0, -0.04]}>
          <boxGeometry args={[GAP * 0.95, SLAB_H * 0.99, DEPTH * 0.7]} />
          <meshStandardMaterial color="#050308" roughness={1} metalness={0} />
        </mesh>

        {/* soft pink glow bleeding out of the slot (sits just inside the front) */}
        <mesh ref={glowRef} position={[0, 0, DEPTH / 2 - 0.05]}>
          <planeGeometry args={[GAP * 2.6, SLAB_H * 0.97]} />
          <meshBasicMaterial
            map={slotGlow}
            color="#9A4DFF"
            transparent
            opacity={0.95}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        {/* soft pink pool spilling onto the floor */}
        <mesh ref={pool} rotation={[-Math.PI / 2, 0, 0]} position={[0, -HALF_H + 0.02, 0.12]}>
          <planeGeometry args={[2.4, 2.4]} />
          <meshBasicMaterial
            map={poolGlow}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        {/* Baked once (frames={1}): the shadow lives inside this group, so it
            rides along as the stone translates - no need to re-render the depth
            pass every frame, which is a big per-frame GPU saving. */}
        <ContactShadows
          position={[0, -HALF_H + 0.01, 0]}
          scale={9}
          resolution={isMobile ? 512 : 1024}
          blur={2.6}
          opacity={0.55}
          far={5}
          frames={1}
          color="#05040a"
        />
      </group>

      {/* the "net": infinite violet grid floor (kept from Main) */}
      <Grid
        position={[0, -HALF_H - 0.6, 0]}
        args={[40, 40]}
        cellSize={0.6}
        cellThickness={0.6}
        cellColor="#2a2350"
        sectionSize={3}
        sectionColor="#3a2f66"
        fadeDistance={26}
        fadeStrength={3}
        infiniteGrid
      />

      <Environment resolution={256} frames={1}>
        <Lightformer intensity={4} color="#B28AFF" position={[-2.5, 1.5, 5]} scale={[4, 9, 1]} />
        <Lightformer intensity={2.2} color="#7C4AF0" position={[3, 0, 5]} scale={[3, 8, 1]} />
        <Lightformer intensity={1} color="#AEB4C7" position={[0, 4, -2]} scale={[9, 4, 1]} />
        <Lightformer intensity={0.7} color="#ffffff" position={[2.5, -2, 5]} scale={[2, 3, 1]} />
      </Environment>
    </group>
  );
}
