import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { buildLogoPieceGeometries } from "../../lib/logoMorph";
import { useObsidianMaterial } from "./obsidian";
import { useSlotGlow } from "./glows";

/**
 * The monolith → crest "light-carve" (prototype). Over the handoff scroll window
 * the sealed monolith splits into 4 quadrant blocks (violet light flaring in the
 * fresh cuts), each block travels to its crest-piece's resting place, and a
 * horizontal light-blade sweeps it — behind the sweep line the stone block is
 * clipped away and the real crest piece is clipped IN (one clipping plane each,
 * opposite halves). Same obsidian material on both sides, so it reads as one
 * stone being carved, not a swap. Requires renderer localClippingEnabled.
 *
 * NOT a topology morph (those were all rejected) — a choreographed substitution
 * masked by the brand's "light cuts the stone" language.
 */

// Forge scroll window: starts where MonolithSolid hard-hands-off, ends where
// LogoSolid takes over at full scale.
const P0 = 0.095;
const P1 = 0.272;

// Monolith dims — mirror MonolithSolid exactly so the t=0 frame is identical.
const HALF_W = 0.62;
const SLAB_H = 3.7;
const DEPTH = 0.62;
const GAP = 0.1;
const HALF_X = GAP / 2 + HALF_W / 2;
const BLOCK_H = SLAB_H / 2;

// Quadrant home positions; order matches buildLogoPieceGeometries:
// [left wing, left core, right wing, right core] → [LT, LB, RT, RB].
const HOMES = [
  { x: -HALF_X, y: BLOCK_H / 2 },
  { x: -HALF_X, y: -BLOCK_H / 2 },
  { x: HALF_X, y: BLOCK_H / 2 },
  { x: HALF_X, y: -BLOCK_H / 2 },
];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export default function CrestForge({
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

  // 4 crest pieces sharing the assembled crest's transform (targetHeight = 3.0,
  // same as LogoSolid's buildLogoGeometry(3.0)).
  const pieceGeoms = useMemo(() => buildLogoPieceGeometries(3.0), []);
  const pieceInfo = useMemo(
    () =>
      pieceGeoms.map((g) => {
        const bb = g.boundingBox!;
        const c = new THREE.Vector3();
        const s = new THREE.Vector3();
        bb.getCenter(c);
        bb.getSize(s);
        return { c, s };
      }),
    [pieceGeoms],
  );
  useEffect(() => () => pieceGeoms.forEach((g) => g.dispose()), [pieceGeoms]);

  // Materials: blocks read like the monolith, pieces like the LogoSolid crest.
  // DoubleSide so the clipped-open cut shows a dark interior, not a see-through.
  // Each mesh needs its OWN material instance (clippingPlanes are per-material).
  const blockBase = useObsidianMaterial({ side: THREE.DoubleSide });
  const pieceBase = useObsidianMaterial({
    side: THREE.DoubleSide,
    repeat: [0.017, 0.006],
    roughness: 0.2,
    envMapIntensity: 0.6,
    metalness: 0.55,
    color: "#140f20",
  });

  // One clip plane per block (keep y <= sweep) and per piece (keep y >= sweep).
  const blockPlanes = useMemo(
    () => Array.from({ length: 4 }, () => new THREE.Plane(new THREE.Vector3(0, -1, 0), 1e9)),
    [],
  );
  const piecePlanes = useMemo(
    () => Array.from({ length: 4 }, () => new THREE.Plane(new THREE.Vector3(0, 1, 0), -1e9)),
    [],
  );
  const blockMats = useMemo(
    () =>
      blockPlanes.map((pl) => {
        const m = blockBase.clone();
        m.clippingPlanes = [pl];
        return m;
      }),
    [blockBase, blockPlanes],
  );
  const pieceMats = useMemo(
    () =>
      piecePlanes.map((pl) => {
        const m = pieceBase.clone();
        m.clippingPlanes = [pl];
        return m;
      }),
    [pieceBase, piecePlanes],
  );
  useEffect(
    () => () => {
      blockMats.forEach((m) => m.dispose());
      pieceMats.forEach((m) => m.dispose());
    },
    [blockMats, pieceMats],
  );

  // Glow textures: the shared slot blade; a 90°-rotated clone for horizontal bars.
  const slotGlow = useSlotGlow();
  const hGlowTex = useMemo(() => {
    const t = slotGlow.clone();
    t.center.set(0.5, 0.5);
    t.rotation = Math.PI / 2;
    t.needsUpdate = true;
    return t;
  }, [slotGlow]);
  useEffect(() => () => hGlowTex.dispose(), [hGlowTex]);

  const group = useRef<THREE.Group>(null);
  const blocks = useRef<(THREE.Mesh | null)[]>([]);
  const pieces = useRef<(THREE.Mesh | null)[]>([]);
  const sweeps = useRef<(THREE.Mesh | null)[]>([]);
  const vCut = useRef<THREE.Mesh>(null);
  const hCut = useRef<THREE.Mesh>(null);

  const posXCur = useRef(0);
  const rotY = useRef(0);
  const rotX = useRef(0);

  useFrame((state, delta) => {
    const tNow = state.clock.elapsedTime;
    const p = reduced ? 0 : scroll.current ?? 0;
    const active = !reduced && p >= P0 && p < P1;
    if (group.current) group.current.visible = active;
    if (!active || !group.current) return;

    const t = clamp01((p - P0) / (P1 - P0));
    const g = group.current;

    // Group glide: same TRACK x as everything; face the camera like LogoSolid so
    // the t=1 frame matches the crest's resting pose exactly (seamless takeover).
    const posXTarget = posX.current ?? 0;
    posXCur.current = THREE.MathUtils.damp(posXCur.current, posXTarget, 3, delta);
    const faceCam = Math.atan2(-posXCur.current, camera.position.z || 6.4) * 0.45;
    const ptX = ptr.current?.x ?? 0;
    const ptY = ptr.current?.y ?? 0;
    const sway = Math.sin(tNow * 0.22) * 0.02;
    rotY.current = THREE.MathUtils.damp(rotY.current, faceCam + sway + ptX * 0.35, 3, delta);
    rotX.current = THREE.MathUtils.damp(rotX.current, ptY * 0.1, 3, delta);
    g.rotation.set(rotX.current, rotY.current, 0);
    g.position.set(posXCur.current, THREE.MathUtils.lerp(-0.1, -0.15, t), 0);

    // Stage 1: the cuts — vertical seam widens, then the horizontal cut opens.
    const sepX = easeIO(clamp01(t / 0.16));
    const sepY = easeIO(clamp01((t - 0.07) / 0.15));
    // The cut glows flare while the blocks are still in formation, then fade as
    // the travel begins (the cuts no longer exist once the blocks leave).
    const cutFade = 1 - clamp01((t - 0.24) / 0.16);
    if (vCut.current) {
      (vCut.current.material as THREE.MeshBasicMaterial).opacity =
        (0.8 + Math.sin(tNow * 0.9) * 0.1) * cutFade;
    }
    if (hCut.current) {
      (hCut.current.material as THREE.MeshBasicMaterial).opacity =
        (0.85 + Math.sin(tNow * 1.1) * 0.1) * sepY * cutFade;
    }

    for (let i = 0; i < 4; i++) {
      // Stage 2: travel (staggered) — Stage 3: the light-sweep carve.
      const trav = easeIO(clamp01((t - (0.24 + i * 0.055)) / 0.28));
      const swp = clamp01((t - (0.57 + i * 0.055)) / 0.15);
      const home = HOMES[i];
      const { c, s } = pieceInfo[i];

      const sx = home.x + Math.sign(home.x) * 0.11 * sepX;
      const sy = home.y + Math.sign(home.y) * 0.1 * sepY;

      const block = blocks.current[i];
      if (block) {
        block.position.set(
          THREE.MathUtils.lerp(sx, c.x, trav),
          THREE.MathUtils.lerp(sy, c.y, trav),
          THREE.MathUtils.lerp(0, c.z, trav),
        );
        // Shrink-wrap toward the piece's bounding box during travel so the swap
        // doesn't pop on proportions.
        block.scale.set(
          THREE.MathUtils.lerp(1, s.x / HALF_W, trav),
          THREE.MathUtils.lerp(1, s.y / BLOCK_H, trav),
          THREE.MathUtils.lerp(1, s.z / DEPTH, trav),
        );
        block.rotation.z = 0.07 * Math.sin(trav * Math.PI) * (i % 2 ? 1 : -1);
        block.visible = swp < 1;
      }

      // The sweep line runs top → bottom across the piece, with overshoot so the
      // clip fully clears both ends. Planes are world-space: group rotation is
      // (mostly) around Y, which leaves world heights intact, so adding the
      // group's y is enough.
      const yTop = c.y + s.y / 2 + 0.18;
      const yBot = c.y - s.y / 2 - 0.18;
      const sweepLocal = THREE.MathUtils.lerp(yTop, yBot, swp);
      const sweepWorld = g.position.y + sweepLocal;
      blockPlanes[i].constant = swp > 0 ? sweepWorld : 1e9; // stone below the line
      piecePlanes[i].constant = swp > 0 ? -sweepWorld : -1e9; // crest above it

      const piece = pieces.current[i];
      if (piece) piece.visible = swp > 0;

      const sweep = sweeps.current[i];
      if (sweep) {
        sweep.visible = swp > 0 && swp < 1;
        sweep.position.set(c.x, sweepLocal, c.z + s.z / 2 + 0.06);
        (sweep.material as THREE.MeshBasicMaterial).opacity = Math.sin(swp * Math.PI) * 0.95;
      }
    }
  });

  if (reduced) return null;

  return (
    <group ref={group} visible={false}>
      {/* the 4 stone blocks (start as the sealed monolith's quadrants) */}
      {HOMES.map((h, i) => (
        <RoundedBox
          key={`b${i}`}
          ref={(m) => {
            blocks.current[i] = m;
          }}
          args={[HALF_W, BLOCK_H, DEPTH]}
          radius={0.05}
          smoothness={4}
          position={[h.x, h.y, 0]}
          material={blockMats[i]}
        />
      ))}

      {/* the 4 crest pieces, parked at their assembled positions, clip-revealed.
          Tiny z lift avoids z-fighting with LogoSolid during the takeover overlap. */}
      {pieceGeoms.map((geom, i) => (
        <mesh
          key={`p${i}`}
          ref={(m) => {
            pieces.current[i] = m;
          }}
          geometry={geom}
          material={pieceMats[i]}
          position={[0, 0, 0.003]}
          visible={false}
        />
      ))}

      {/* per-piece horizontal sweep blade */}
      {pieceInfo.map(({ s }, i) => (
        <mesh
          key={`s${i}`}
          ref={(m) => {
            sweeps.current[i] = m;
          }}
          visible={false}
        >
          <planeGeometry args={[s.x * 1.5, 0.34]} />
          <meshBasicMaterial
            map={hGlowTex}
            color="#9A4DFF"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* the cut glows: the existing vertical seam + the new horizontal cut */}
      <mesh ref={vCut} position={[0, 0, DEPTH / 2 - 0.05]}>
        <planeGeometry args={[GAP * 2.6, SLAB_H * 0.97]} />
        <meshBasicMaterial
          map={slotGlow}
          color="#9A4DFF"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={hCut} position={[0, 0, DEPTH / 2 - 0.05]}>
        <planeGeometry args={[(HALF_W * 2 + GAP) * 1.05, GAP * 2.6]} />
        <meshBasicMaterial
          map={hGlowTex}
          color="#9A4DFF"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
