import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Preload } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three-stdlib";
import { useObsidianMaterial } from "./obsidian";
import { useBladeGlow, usePoolGlow, useSlotGlow } from "./glows";
import { buildLogoGeometry, sampleCrestVoxels } from "../../lib/logoMorph";

/**
 * Beat M — MONOLITH TO MONOLITH (the wow centerpiece).
 * One timed performance (`progress` 0..1, driven by Break.tsx):
 *
 *   t 0    → 0.10  the EXACT site monolith stands whole: two sealed obsidian
 *                  halves, violet slot glow, floor pool. Smooth, solid.
 *   t 0.08 → 0.10  a tremor builds…
 *   t 0.10 → 0.32  EXPLOSION — the slab shatters into tumbling shards
 *   t 0.34 → 0.52  the shards are pulled back under control into an ordered
 *                  service grid (the microservices reading; chips overlay)
 *   t 0.58 → 0.90  the services fly in bottom-up and trace the CREST silhouette
 *   t 0.86 → 1.00  the cloud MORPHS into the real solid 3D crest — shards melt
 *                  into its faces as it fades in, and the seam blade IGNITES.
 *
 * Chaos → governed → brand. Reduced motion: the finished crest, seam lit.
 */

// the site monolith, verbatim proportions (MonolithSolid)
const SLAB_H = 3.4;
const HALF_W = 0.58;
const DEPTH = 0.58;
const GAP = 0.1;
const HALF_X = GAP / 2 + HALF_W / 2;

// act-B service grid
const GRID_COLS = 10;
const GRID_DX = 0.6;
const GRID_DY = 0.52;

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
/** 0..1 over [a, b] */
function seg(t: number, a: number, b: number) {
  return THREE.MathUtils.clamp((t - a) / (b - a), 0, 1);
}

type Shard = {
  packed: THREE.Vector3;
  burst: THREE.Vector3; // explosion apex
  grid: THREE.Vector3;
  crest: THREE.Vector3;
  spin: THREE.Vector3; // tumble axis amounts
  size: number; // per-shard scale variance
  dB: number; // build stagger (bottom-up)
};

function mulberry(seed: number) {
  // deterministic rand — Math.random() would reshuffle the shards every mount
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let z = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

function Scenery({ progress, reduced }: { progress: React.RefObject<number>; reduced: boolean }) {
  const slabMaterial = useObsidianMaterial();
  // crest dialling (see LogoSolid): faceted geometry catches far more violet
  const crestMaterial = useObsidianMaterial({
    repeat: [0.017, 0.006],
    roughness: 0.2,
    envMapIntensity: 0.6,
    metalness: 0.55,
  });
  const shardMaterial = useObsidianMaterial({ roughness: 0.32, envMapIntensity: 0.6, metalness: 0.5 });
  const slotGlow = useSlotGlow();
  const bladeGlow = useBladeGlow();
  const poolGlow = usePoolGlow();

  const slab = useRef<THREE.Group>(null);
  const slabGlowRef = useRef<THREE.Mesh>(null);
  const shardsRef = useRef<THREE.InstancedMesh>(null);
  const crestRef = useRef<THREE.Group>(null);
  const bladeRef = useRef<THREE.Mesh>(null);
  const cur = useRef(reduced ? 1 : 0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const { shards, shardGeom, crestGeom, crestDims, voxel } = useMemo(() => {
    const rand = mulberry(7);
    // crest voxels define the shard count and the act-C targets (bottom-up)
    const vox = sampleCrestVoxels(2.9, 13);
    const order = [...vox.positions].sort((a, b) => a.y - b.y || a.x - b.x);
    const n = order.length;

    // pack n shards to tile the slab's two halves exactly (2 columns per half)
    const rows = Math.ceil(n / 4);
    const sh = SLAB_H / rows;
    const sw = HALF_W / 2;
    const gridRows = Math.ceil(n / GRID_COLS);

    const arr: Shard[] = [];
    for (let i = 0; i < n; i++) {
      const col = i % 4; // 0,1 left half · 2,3 right half
      const row = Math.floor(i / 4);
      const hx = col < 2 ? -HALF_X : HALF_X;
      const packed = new THREE.Vector3(
        hx + (col % 2 === 0 ? -sw / 2 : sw / 2),
        (row - (rows - 1) / 2) * sh,
        0,
      );
      // explosion: radially out from the slab core + jitter, forward scatter
      const dir = new THREE.Vector3(packed.x * 2.2, packed.y * 0.8, 0)
        .add(new THREE.Vector3((rand() - 0.5) * 3, (rand() - 0.5) * 2.4, (rand() - 0.5) * 2.6))
        .normalize();
      const burst = packed.clone().add(dir.multiplyScalar(2.1 + rand() * 1.7));
      const gc = i % GRID_COLS;
      const gr = Math.floor(i / GRID_COLS);
      const grid = new THREE.Vector3(
        (gc - (GRID_COLS - 1) / 2) * GRID_DX,
        (gr - (gridRows - 1) / 2) * GRID_DY,
        ((gc + gr) % 2) * 0.3 - 0.15,
      );
      arr.push({
        packed,
        burst,
        grid,
        crest: order[i],
        spin: new THREE.Vector3((rand() - 0.5) * 7, (rand() - 0.5) * 7, (rand() - 0.5) * 5),
        size: 0.9 + rand() * 0.2,
        dB: (i / n) * 0.16,
      });
    }
    const sg = new RoundedBoxGeometry(sw, sh, DEPTH, 2, 0.02);
    const cg = buildLogoGeometry(2.9);
    cg.computeBoundingBox();
    const bb = cg.boundingBox!;
    const dims = { seamHeight: (bb.max.y - bb.min.y) * 0.94, frontZ: bb.max.z + 0.03, bottomY: bb.min.y };
    return { shards: arr, shardGeom: sg, crestGeom: cg, crestDims: dims, voxel: vox.cell };
  }, []);

  useEffect(() => () => crestGeom.dispose(), [crestGeom]);
  useEffect(() => () => shardGeom.dispose(), [shardGeom]);

  useFrame((state, delta) => {
    const t = reduced
      ? 1
      : (cur.current = THREE.MathUtils.damp(
          cur.current,
          THREE.MathUtils.clamp(progress.current ?? 0, 0, 1),
          4.5,
          delta,
        ));
    const clock = state.clock.elapsedTime;

    // ——— the whole slab, until the moment it blows ———
    if (slab.current) {
      slab.current.visible = !reduced && t < 0.1;
      // tremor: a fast, growing shiver right before the blast
      const tremor = seg(t, 0.05, 0.1);
      slab.current.rotation.z = Math.sin(clock * 60) * 0.006 * tremor;
      slab.current.position.x = Math.sin(clock * 47) * 0.015 * tremor;
    }
    if (slabGlowRef.current) {
      // the slot glow flares as the tremor builds — the seam is the fault line
      (slabGlowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.85 + Math.sin(clock * 0.9) * 0.1 + seg(t, 0.05, 0.1) * 0.6;
    }

    // ——— shards: explosion → grid → crest ———
    const inst = shardsRef.current;
    if (inst) {
      inst.visible = !reduced && t >= 0.1 && t < 0.97;
      if (inst.visible) {
        const vs = (voxel * 0.92) / (HALF_W / 2);
        const vsy = (voxel * 0.92) / (SLAB_H / Math.ceil(shards.length / 4));
        const melt = seg(t, 0.9, 0.97); // shards shrink into the crest faces
        for (let i = 0; i < shards.length; i++) {
          const s = shards[i];
          const e = easeOutCubic(seg(t, 0.1, 0.32)); // blast out
          const g = easeInOut(seg(t, 0.34 + s.dB * 0.4, 0.52 + s.dB * 0.4)); // regroup
          const c = easeInOut(seg(t, 0.58 + s.dB, 0.78 + s.dB)); // build the crest

          dummy.position.lerpVectors(s.packed, s.burst, e);
          dummy.position.lerp(s.grid, g);
          dummy.position.lerp(s.crest, c);
          dummy.position.y += Math.sin(c * Math.PI) * 0.35; // rising sweep into place
          const tumble = e * (1 - g);
          dummy.rotation.set(s.spin.x * tumble, s.spin.y * tumble, s.spin.z * tumble);
          const sc = s.size * (1 - melt);
          dummy.scale.set(
            THREE.MathUtils.lerp(1, vs, c) * sc,
            THREE.MathUtils.lerp(1, vsy, c) * sc,
            THREE.MathUtils.lerp(1, vs, c) * sc,
          );
          dummy.updateMatrix();
          inst.setMatrixAt(i, dummy.matrix);
        }
        inst.instanceMatrix.needsUpdate = true;
      }
    }

    // ——— the real crest fades in under the converging cloud ———
    const crestIn = reduced ? 1 : seg(t, 0.86, 0.96);
    if (crestRef.current) {
      crestRef.current.visible = crestIn > 0;
      const sc = 0.96 + 0.04 * crestIn;
      crestRef.current.scale.setScalar(sc);
    }
    crestMaterial.opacity = crestIn;
    if (bladeRef.current) {
      const on = reduced ? 1 : seg(t, 0.92, 1);
      (bladeRef.current.material as THREE.MeshBasicMaterial).opacity =
        on * (0.62 + Math.sin(clock * 0.9) * 0.08);
    }
  });

  return (
    <group position={[0, 0.2, 0]}>
      {/* ACT 1 — the sealed monolith (exact MonolithSolid reading) */}
      <group ref={slab} visible={!reduced}>
        <mesh position={[-HALF_X, 0, 0]} material={slabMaterial}>
          <boxGeometry args={[HALF_W, SLAB_H, DEPTH]} />
        </mesh>
        <mesh position={[HALF_X, 0, 0]} material={slabMaterial}>
          <boxGeometry args={[HALF_W, SLAB_H, DEPTH]} />
        </mesh>
        {/* recessed dark backing inside the slot */}
        <mesh position={[0, 0, -0.04]}>
          <boxGeometry args={[GAP * 0.95, SLAB_H * 0.99, DEPTH * 0.7]} />
          <meshStandardMaterial color="#050308" roughness={1} metalness={0} />
        </mesh>
        {/* slot glow — flares right before the break */}
        <mesh ref={slabGlowRef} position={[0, 0, DEPTH / 2 - 0.05]}>
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
      </group>

      {/* ACTS 2–4 — the shards (one instanced draw call) */}
      <instancedMesh ref={shardsRef} args={[shardGeom, shardMaterial, shards.length]} visible={false} />

      {/* FINALE — the real solid crest, seam blade igniting */}
      <group ref={crestRef} visible={reduced}>
        <mesh geometry={crestGeom} material={crestMaterial} />
        {/* dark recessed channel down the centre (same trick as LogoSolid) */}
        <mesh position={[0, 0, crestDims.frontZ - 0.02]}>
          <planeGeometry args={[0.1, crestDims.seamHeight * 1.02]} />
          <meshBasicMaterial color="#05030a" transparent opacity={0.92} toneMapped={false} />
        </mesh>
        <mesh ref={bladeRef} position={[0, 0, crestDims.frontZ]}>
          <planeGeometry args={[0.18, crestDims.seamHeight * 0.96]} />
          <meshBasicMaterial
            map={bladeGlow}
            color="#9A4DFF"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* floor pool — under the slab, stays for the crest */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -SLAB_H / 2 + 0.02, 0.12]}>
        <planeGeometry args={[2.4, 2.4]} />
        <meshBasicMaterial map={poolGlow} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function BreakScene({ progress, reduced }: { progress: React.RefObject<number>; reduced: boolean }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  return (
    <Canvas
      camera={{ position: [0, 0, 7.4], fov: 50 }}
      gl={{ antialias: !isMobile, powerPreference: "high-performance" }}
      dpr={isMobile ? [1, 1.25] : [1, 1.5]}
      frameloop={reduced ? "demand" : "always"}
    >
      <color attach="background" args={["#0A0A0C"]} />
      <fog attach="fog" args={["#0A0A0C", 9, 30]} />
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 2, 6]} intensity={22} color="#B28AFF" distance={32} />
      <pointLight position={[-4, 1, 4]} intensity={8} color="#7C4AF0" distance={26} />
      {/* rim far up + dim — straight behind, it shines through the shard gaps */}
      <pointLight position={[0, 6, -9]} intensity={6} color="#9B6DFF" distance={30} />

      <Suspense fallback={null}>
        <Scenery progress={progress} reduced={reduced} />
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={4} color="#B28AFF" position={[-2.5, 1.5, 5]} scale={[4, 9, 1]} />
          <Lightformer intensity={2.2} color="#7C4AF0" position={[3, 0, 5]} scale={[3, 8, 1]} />
          <Lightformer intensity={1} color="#AEB4C7" position={[0, 4, -2]} scale={[9, 4, 1]} />
        </Environment>
        {/* compile shaders + upload textures at mount (1.5 viewports early) */}
        <Preload all />
      </Suspense>

      <EffectComposer>
        <Bloom intensity={isMobile ? 0.6 : 0.85} luminanceThreshold={0.5} luminanceSmoothing={0.9} mipmapBlur radius={0.8} />
      </EffectComposer>
    </Canvas>
  );
}
