import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three-stdlib";
import { useObsidianMaterial } from "./obsidian";
import { useBladeGlow, usePoolGlow, useSlotGlow } from "./glows";
import { buildLogoGeometry, sampleCrestVoxels } from "../../lib/logoMorph";

/**
 * Beat M — MONOLITH TO MONOLITH, performed INSIDE the global fixed canvas.
 * ONE element, no handoff: the stone that receded at the Chaos turn returns
 * from the depth, shatters, regroups as a service grid, builds the crest — and
 * that very crest then rides the track to the bottom of the page. The Break
 * section is just the scroll runway + overlay copy; `progress` is its scrub.
 *
 *   t 0    → 0.12  RETURN — the slab glides forward out of the fog, centre stage
 *   t 0.14 → 0.18  a tremor builds…
 *   t 0.18 → 0.34  EXPLOSION — the slab shatters into tumbling shards
 *   t 0.36 → 0.56  the shards regroup into an ordered service grid
 *   t 0.54 → 0.79  the services fly in bottom-up and trace the crest silhouette
 *   t 0.70 → 0.84  the cloud MORPHS into the solid crest; the seam blade ignites
 *   t 0.84 → 1.00  HOLD — the finished crest stays pinned, then simply CONTINUES
 *                  (straight down first, easing onto the track as the section
 *                  leaves; the forge pool/blade dim behind it).
 *
 * Reduced motion: the assembled crest, shown while the section is on screen.
 */

// the site monolith, verbatim proportions (MonolithSolid) — the SAME stone returns
const SLAB_H = 3.7;
const HALF_W = 0.62;
const DEPTH = 0.62;
const GAP = 0.1;
const HALF_X = GAP / 2 + HALF_W / 2;
const SLAB_Y = -0.1; // the monolith's resting height — continuity with the recede

// act-B service grid
const GRID_COLS = 10;
const GRID_DX = 0.6;
const GRID_DY = 0.52;

// The brand mark's locked SCREEN size (the old Break stage read: 2.43 world tall
// at camera z 7.4). The global camera dollies (6.4 + p·0.85), so the crest is
// scale-compensated by the live camera distance every frame — constant on screen.
const CREST_ANGULAR = 2.43 / 7.4;
const CREST_Y_ANGULAR = 0.17 / 7.4;
const CH = 2.31; // crest geometry build height (≈ on-screen target at camZ ~7.05)

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
  burst: THREE.Vector3;
  grid: THREE.Vector3;
  crest: THREE.Vector3; // crest-LOCAL voxel position (offset + scaled per frame)
  spin: THREE.Vector3;
  size: number;
  dB: number;
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

export default function ForgeStage({
  progress,
  posX,
  ptr,
  reduced,
}: {
  /** the Break section's scrub progress (0..1), shared ref */
  progress: React.RefObject<number>;
  posX: React.RefObject<number>;
  ptr: React.RefObject<{ x: number; y: number }>;
  reduced: boolean;
}) {
  const camera = useThree((s) => s.camera);

  const slabMaterial = useObsidianMaterial();
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

  const root = useRef<THREE.Group>(null);
  const slab = useRef<THREE.Group>(null);
  const slabGlowRef = useRef<THREE.Mesh>(null);
  const shardsRef = useRef<THREE.InstancedMesh>(null);
  const crestGroup = useRef<THREE.Group>(null);
  const channelRef = useRef<THREE.Mesh>(null);
  const bladeRef = useRef<THREE.Mesh>(null);
  const poolRef = useRef<THREE.Mesh>(null);
  const breakEl = useRef<HTMLElement | null>(null);

  const cur = useRef(0);
  const crestXCur = useRef(0);
  const rotY = useRef(0);
  const rotX = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  const { shards, shardGeom, crestGeom, crestDims, voxel } = useMemo(() => {
    const rand = mulberry(7);
    // crest voxels define the shard count and the build targets (bottom-up),
    // stored crest-LOCAL — offset + camera-scale applied per frame
    const vox = sampleCrestVoxels(CH, 13);
    const order = [...vox.positions].sort((a, b) => a.y - b.y || a.x - b.x);
    const n = order.length;

    const rows = Math.ceil(n / 4);
    const sh = SLAB_H / rows;
    const sw = HALF_W / 2;
    const gridRows = Math.ceil(n / GRID_COLS);

    const arr: Shard[] = [];
    for (let i = 0; i < n; i++) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const hx = col < 2 ? -HALF_X : HALF_X;
      const packed = new THREE.Vector3(
        hx + (col % 2 === 0 ? -sw / 2 : sw / 2),
        SLAB_Y + (row - (rows - 1) / 2) * sh,
        0,
      );
      const dir = new THREE.Vector3(packed.x * 2.2, (packed.y - SLAB_Y) * 0.8, 0)
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
    const cg = buildLogoGeometry(CH);
    cg.computeBoundingBox();
    const bb = cg.boundingBox!;
    const dims = { seamHeight: (bb.max.y - bb.min.y) * 0.94, frontZ: bb.max.z + 0.03 };
    return { shards: arr, shardGeom: sg, crestGeom: cg, crestDims: dims, voxel: vox.cell };
  }, []);

  useEffect(() => () => crestGeom.dispose(), [crestGeom]);
  useEffect(() => () => shardGeom.dispose(), [shardGeom]);

  useFrame((state, delta) => {
    const clock = state.clock.elapsedTime;
    const camZ = camera.position.z || 6.4;
    const sizeLock = (CREST_ANGULAR * camZ) / CH;
    const crestY = -CREST_Y_ANGULAR * camZ;

    if (!breakEl.current) breakEl.current = document.getElementById("break");
    const rect = breakEl.current?.getBoundingClientRect();
    const vh = window.innerHeight;

    // ——— reduced motion: the assembled crest, while the section is on screen ———
    if (reduced) {
      const onScreen = !!rect && rect.bottom > 0 && rect.top < vh;
      if (root.current) root.current.visible = onScreen;
      if (slab.current) slab.current.visible = false;
      if (shardsRef.current) shardsRef.current.visible = false;
      if (crestGroup.current) {
        crestGroup.current.visible = true;
        crestGroup.current.scale.setScalar(sizeLock);
        crestGroup.current.position.set(0, crestY, 0);
      }
      crestMaterial.opacity = 1;
      if (bladeRef.current) (bladeRef.current.material as THREE.MeshBasicMaterial).opacity = 0.62;
      if (poolRef.current) (poolRef.current.material as THREE.MeshBasicMaterial).opacity = 0.6;
      return;
    }

    const t = (cur.current = THREE.MathUtils.damp(
      cur.current,
      THREE.MathUtils.clamp(progress.current ?? 0, 0, 1),
      4.5,
      delta,
    ));

    // nothing exists before the runway starts (and after a full rewind)
    if (root.current) root.current.visible = t > 0.002;
    if (t <= 0.002) return;

    // ——— ride release: hold centre while the section leaves, then ease onto
    // the track (straight down first — no diagonal at the moment it continues)
    let release = 0;
    if (rect) {
      const r = THREE.MathUtils.clamp((vh - rect.bottom) / (vh * 1.4), 0, 1);
      release = r * r * (3 - 2 * r);
    }

    // ——— the slab RETURNS from the depth, stands whole, then blows ———
    if (slab.current) {
      slab.current.visible = t < 0.18;
      const entry = easeOutCubic(seg(t, 0, 0.12));
      slab.current.position.z = -16 * (1 - entry);
      const tremor = seg(t, 0.14, 0.18);
      slab.current.rotation.z = Math.sin(clock * 60) * 0.006 * tremor;
      slab.current.position.x = Math.sin(clock * 47) * 0.015 * tremor;
    }
    if (slabGlowRef.current) {
      (slabGlowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.85 + Math.sin(clock * 0.9) * 0.1 + seg(t, 0.14, 0.18) * 0.6;
    }

    // ——— crest placement: centre stage during the forge, riding after ———
    const crestXTarget = (posX.current ?? 0) * release;
    crestXCur.current = THREE.MathUtils.damp(crestXCur.current, crestXTarget, 3, delta);
    // face the camera as it drifts off-centre (pointer-follow only once riding,
    // so the shards converge onto an unrotated crest during the build)
    const ptX = ptr.current?.x ?? 0;
    const ptY = ptr.current?.y ?? 0;
    const faceCam = Math.atan2(-crestXCur.current, camZ) * 0.45;
    const sway = Math.sin(clock * 0.22) * 0.02;
    rotY.current = THREE.MathUtils.damp(rotY.current, (faceCam + sway + ptX * 0.35) * release, 3, delta);
    rotX.current = THREE.MathUtils.damp(rotX.current, ptY * 0.1 * release, 3, delta);

    const crestIn = seg(t, 0.7, 0.78);
    if (crestGroup.current) {
      crestGroup.current.visible = crestIn > 0;
      crestGroup.current.scale.setScalar(sizeLock * (0.96 + 0.04 * crestIn));
      crestGroup.current.position.set(crestXCur.current, crestY, 0);
      crestGroup.current.rotation.set(rotX.current, rotY.current, 0);
    }
    crestMaterial.opacity = crestIn;
    if (channelRef.current) {
      (channelRef.current.material as THREE.MeshBasicMaterial).opacity = 0.92 * crestIn;
    }

    // ——— shards: explosion → grid → crest (converging onto the live crest spot) ———
    const inst = shardsRef.current;
    if (inst) {
      inst.visible = t >= 0.18 && t < 0.82;
      if (inst.visible) {
        const rows = Math.ceil(shards.length / 4);
        const vs = (voxel * 0.92) / (HALF_W / 2);
        const vsy = (voxel * 0.92) / (SLAB_H / rows);
        const melt = seg(t, 0.72, 0.8);
        for (let i = 0; i < shards.length; i++) {
          const s = shards[i];
          const e = easeOutCubic(seg(t, 0.18, 0.34));
          const g = easeInOut(seg(t, 0.36 + s.dB * 0.4, 0.5 + s.dB * 0.4));
          const c = easeInOut(seg(t, 0.54 + s.dB * 0.7, 0.68 + s.dB * 0.7));

          // crest target = live crest anchor + voxel local (camera-scaled)
          tmp.copy(s.crest).multiplyScalar(sizeLock);
          tmp.x += crestXCur.current;
          tmp.y += crestY;

          dummy.position.lerpVectors(s.packed, s.burst, e);
          dummy.position.lerp(s.grid, g);
          dummy.position.lerp(tmp, c);
          dummy.position.y += Math.sin(c * Math.PI) * 0.35;
          const tumble = e * (1 - g);
          dummy.rotation.set(s.spin.x * tumble, s.spin.y * tumble, s.spin.z * tumble);
          const sc = s.size * (1 - melt);
          dummy.scale.set(
            THREE.MathUtils.lerp(1, vs * sizeLock, c) * sc,
            THREE.MathUtils.lerp(1, vsy * sizeLock, c) * sc,
            THREE.MathUtils.lerp(1, vs * sizeLock, c) * sc,
          );
          dummy.updateMatrix();
          inst.setMatrixAt(i, dummy.matrix);
        }
        inst.instanceMatrix.needsUpdate = true;
      }
    }

    // ——— forge lights: the blade ignites with the crest, and the stage glow
    // (blade + floor pool) dims away as the crest departs — no hard cuts ———
    const stay = 1 - release;
    if (bladeRef.current) {
      const on = seg(t, 0.76, 0.84);
      (bladeRef.current.material as THREE.MeshBasicMaterial).opacity =
        on * stay * (0.62 + Math.sin(clock * 0.9) * 0.08);
    }
    if (poolRef.current) {
      (poolRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.9 * seg(t, 0.02, 0.12) * stay;
    }
  });

  return (
    <group ref={root} visible={false}>
      {/* ACT 1 — the sealed monolith returns (exact MonolithSolid reading) */}
      <group ref={slab} position={[0, SLAB_Y, 0]} visible={false}>
        <mesh position={[-HALF_X, 0, 0]} material={slabMaterial}>
          <boxGeometry args={[HALF_W, SLAB_H, DEPTH]} />
        </mesh>
        <mesh position={[HALF_X, 0, 0]} material={slabMaterial}>
          <boxGeometry args={[HALF_W, SLAB_H, DEPTH]} />
        </mesh>
        <mesh position={[0, 0, -0.04]}>
          <boxGeometry args={[GAP * 0.95, SLAB_H * 0.99, DEPTH * 0.7]} />
          <meshStandardMaterial color="#050308" roughness={1} metalness={0} />
        </mesh>
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

      {/* THE MARK — built here, and it KEEPS GOING down the page (no handoff) */}
      <group ref={crestGroup} visible={false}>
        <mesh geometry={crestGeom} material={crestMaterial} />
        <mesh ref={channelRef} position={[0, 0, crestDims.frontZ - 0.02]}>
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

      {/* floor pool — under the forge stage; dims as the crest departs */}
      <mesh ref={poolRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, SLAB_Y - SLAB_H / 2 + 0.02, 0.12]}>
        <planeGeometry args={[2.4, 2.4]} />
        <meshBasicMaterial map={poolGlow} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}
