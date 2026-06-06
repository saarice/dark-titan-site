import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Grid, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { sceneStateFor, smoothstep, clamp } from "../../lib/choreography";

/**
 * One monolith that breaks into the pieces.
 *
 * The tower is built from K flush vertical shards. At the hero they sit edge to
 * edge with no internal seams, so the silhouette reads as a single sealed
 * monolith with one bright line of light. As you scroll, the shards peel apart
 * in sequence (the "break") and drift, then reseal into one monolith for the
 * footer. A single scroll source of truth (`scroll`) drives the seam, the
 * break, and the camera via the pure sceneStateFor(), so nothing can disagree.
 *
 * variant:
 *  - "obelisk": slim tapered tower + pyramidion cap, intense seam and a glowing
 *    light-pool at the base. The cinematic reading (D).
 *  - "slabs": equal-height rectangular monolith. The restrained reading (E).
 */

const K = 9; // number of vertical shards
const COL_W = 1.18; // total tower width (slim)
const SHARD_W = COL_W / K;
const H = 4.3; // full tower height
const DEPTH = 0.66;
const HALF_H = H / 2;
const CENTER = (K - 1) / 2;
const CAP_H = 0.6; // pyramidion height (obelisk only)

type Variant = "obelisk" | "slabs";

type Shard = {
  i: number;
  restX: number;
  dist: number; // 0 center .. 1 edge
  height: number;
  yOffset: number; // box offset so all shards share a base at y = -HALF_H
  release: number; // scroll point where this shard starts to peel
  dirX: number;
};

function buildShards(variant: Variant): Shard[] {
  const base = Array.from({ length: K }, (_, i) => {
    const restX = -COL_W / 2 + SHARD_W * (i + 0.5);
    const dist = Math.abs(i - CENTER) / CENTER;
    // Gentle taper so the outline reads as one smooth obelisk, not a skyline.
    const height = variant === "obelisk" ? H * (1 - 0.2 * Math.pow(dist, 1.35)) : H;
    return { i, restX, dist, height, yOffset: height / 2 - HALF_H, dirX: Math.sign(restX) };
  });
  // Peel order: outermost shards calve first, the core last.
  const order = [...base].sort((a, b) => b.dist - a.dist || a.i - b.i);
  const rank = new Map(order.map((s, r) => [s.i, r]));
  return base.map((s) => ({ ...s, release: 0.1 + 0.08 * (rank.get(s.i) ?? 0) }));
}

/** Soft radial-gradient texture for the base light-pool (no network fetch). */
function useGlowTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, "rgba(178,138,255,0.95)");
    grad.addColorStop(0.35, "rgba(124,74,240,0.45)");
    grad.addColorStop(1, "rgba(124,74,240,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

export default function MonolithShards({
  variant,
  scroll,
  ptr,
  reduced,
}: {
  variant: Variant;
  scroll: React.RefObject<number>;
  ptr: React.RefObject<{ x: number; y: number }>;
  reduced: boolean;
}) {
  const { camera, size } = useThree();
  const group = useRef<THREE.Group>(null);
  const shardRefs = useRef<THREE.Group[]>([]);
  const seam = useRef<THREE.Mesh>(null);
  const pool = useRef<THREE.Mesh>(null);
  const isObelisk = variant === "obelisk";

  const shards = useMemo(() => buildShards(variant), [variant]);
  const glow = useGlowTexture();

  // Damped per-shard openness (0 sealed .. 1 fully peeled).
  const openCur = useRef<number[]>(new Array(K).fill(0));
  const rotY = useRef(0);
  const rotX = useRef(0);
  const posXCur = useRef(0);
  const posYCur = useRef(0);

  // Matte dark stone, not chrome: low metalness + high roughness so the narrow
  // shard faces read as one continuous surface when flush (a glossy metal would
  // give each face its own reflection band and the tower would look striped).
  const slabMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isObelisk ? "#1b1530" : "#181426",
        metalness: 0.35,
        roughness: isObelisk ? 0.58 : 0.62,
        envMapIntensity: isObelisk ? 1.5 : 1.2,
      }),
    [isObelisk],
  );
  const seamMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#B28AFF", transparent: true, toneMapped: false }),
    [],
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = reduced ? 0 : scroll.current ?? 0;
    const s = sceneStateFor(p);

    // Per-shard peel. Gate by (1 - reform) so the tower reseals for the footer.
    for (let i = 0; i < K; i++) {
      const sh = shards[i];
      const target = smoothstep(sh.release, sh.release + 0.2, p) * (1 - s.reform);
      const o = (openCur.current[i] = THREE.MathUtils.damp(openCur.current[i], target, 2.6, delta));
      const g = shardRefs.current[i];
      if (!g) continue;
      const swing = i % 2 ? 1 : -1;
      // Center shard has no sideways direction; it stays as the core and only
      // drifts forward + tips, so the monolith always has a last piece standing.
      g.position.x = sh.restX + sh.dirX * o * (1.15 + sh.dist * 0.7);
      g.position.z = o * (sh.dirX === 0 ? 0.5 : swing * (0.7 + sh.dist * 0.45));
      g.position.y = o * Math.sin(i * 1.3) * 0.5;
      g.rotation.z = o * swing * 0.42;
      g.rotation.x = o * 0.28 * Math.sin(i * 0.7 + 0.5);
      g.scale.setScalar(1 - o * 0.1);
    }

    // The seam is the light holding the monolith together: brightest when sealed
    // (hero + footer reform), gone while it is broken apart.
    const seamVis = clamp(s.form);
    if (seam.current) {
      seam.current.scale.y = 0.25 + seamVis * 1.0;
      (seam.current.material as THREE.MeshBasicMaterial).opacity = seamVis * (isObelisk ? 0.95 : 0.7);
    }
    if (pool.current) {
      (pool.current.material as THREE.MeshBasicMaterial).opacity = seamVis * (isObelisk ? 0.85 : 0.45);
      pool.current.scale.setScalar((isObelisk ? 1.5 : 1.2) * (1 + Math.sin(t * 0.8) * 0.05));
    }

    // Pointer sway + gentle scroll rotation on the parent group.
    const ptX = reduced ? 0 : ptr.current?.x ?? 0;
    const ptY = reduced ? 0 : ptr.current?.y ?? 0;
    const sway = reduced ? 0 : Math.sin(t * 0.22) * 0.06;
    rotY.current = THREE.MathUtils.damp(rotY.current, sway + p * 0.3 + ptX * 0.16, 3, delta);
    rotX.current = THREE.MathUtils.damp(rotX.current, ptY * 0.07, 3, delta);

    const heroOnly = 1 - smoothstep(0.05, 0.16, p);
    const isMobile = size.width < 768;
    const posXTarget = isMobile ? 1.5 + heroOnly * 1.7 : heroOnly * 1.9;
    const posYTarget = 0.5 * (1 - smoothstep(0, 0.9, p));
    posXCur.current = THREE.MathUtils.damp(posXCur.current, posXTarget, 3, delta);
    posYCur.current = THREE.MathUtils.damp(posYCur.current, posYTarget, 3, delta);

    if (group.current) {
      group.current.rotation.y = rotY.current;
      group.current.rotation.x = rotX.current;
      group.current.position.x = posXCur.current;
      group.current.position.y = posYCur.current;
    }

    camera.position.z = THREE.MathUtils.damp(camera.position.z, s.cameraZ, 3, delta);
    camera.lookAt(0, isObelisk ? 0.25 : 0, 0);
  });

  return (
    <group ref={group}>
      {shards.map((sh) => {
        const isCore = sh.dirX === 0;
        return (
          <group key={sh.i} ref={(el) => { if (el) shardRefs.current[sh.i] = el; }}>
            {/* sharp, flush box so shards tile seamlessly into one solid tower.
                Local x is 0; the group carries restX + the peel offset, so the
                shard is never positioned twice. */}
            <mesh position={[0, sh.yOffset, 0]} material={slabMat}>
              <boxGeometry args={[SHARD_W, sh.height, DEPTH]} />
            </mesh>
            {/* pyramidion cap rides the core shard (obelisk only) */}
            {isObelisk && isCore && (
              <mesh position={[0, HALF_H + CAP_H / 2, 0]} rotation={[0, Math.PI / 4, 0]} material={slabMat}>
                <cylinderGeometry args={[0, COL_W * 0.16, CAP_H, 4]} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* the single seam of light down the front face */}
      <mesh ref={seam} material={seamMat} position={[0, 0, DEPTH / 2 + 0.02]}>
        <boxGeometry args={[isObelisk ? 0.05 : 0.055, H * 0.94, 0.05]} />
      </mesh>

      {/* light pool spilling onto the ground beneath the seam */}
      <mesh ref={pool} rotation={[-Math.PI / 2, 0, 0]} position={[0, -HALF_H + 0.02, 0.15]}>
        <planeGeometry args={[2.6, 2.6]} />
        <meshBasicMaterial
          map={glow}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <Grid
        position={[0, -HALF_H - 0.05, 0]}
        args={[40, 40]}
        cellSize={0.6}
        cellThickness={0.6}
        cellColor={isObelisk ? "#241d44" : "#2a2350"}
        sectionSize={3}
        sectionColor={isObelisk ? "#33285c" : "#3a2f66"}
        fadeDistance={isObelisk ? 30 : 26}
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
