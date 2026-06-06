import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Grid,
  Environment,
  Lightformer,
  useTexture,
  ContactShadows,
  MeshReflectorMaterial,
} from "@react-three/drei";
import * as THREE from "three";
import { sceneStateFor, smoothstep, clamp } from "../../lib/choreography";

/**
 * One monolith of carved stone that breaks into the pieces.
 *
 * The tower is K flush vertical shards. At the hero they sit edge to edge with
 * no internal seams, so the silhouette reads as a single sealed block of stone
 * with one bright line of light. As you scroll the shards peel apart in
 * sequence (the "break") and drift, then reseal into one monolith for the
 * footer. A single scroll source of truth drives the seam, the break and the
 * camera via the pure sceneStateFor(), so nothing can disagree.
 *
 * The stone itself is real PBR rock (Poly Haven CC0 maps in /public/textures):
 * a normal map carves micro-relief, a roughness map breaks up the specular,
 * and a high envMapIntensity lets the violet Lightformer environment catch
 * every edge. The diffuse is tinted dark-violet so it stays on-brand instead
 * of grey gravel. Per-shard texture continuity (each shard samples its own
 * horizontal slice of one virtual texture) means the sealed tower looks like
 * one quarried block, never a row of identical tiles.
 *
 * Four readings, chosen with the version switcher:
 *  - d "Cinematic"  obelisk, honed dark granite, storm + base light-pool.
 *  - e "Monument"   straight slab, honed granite, restrained.
 *  - f "Obsidian"   obelisk, polished volcanic glass, mirror floor, deep glints.
 *  - g "Basalt"     obelisk, rough hewn basalt, heavy relief, grazing light.
 */

export type Version = "d" | "e" | "f" | "g";

const K = 9; // number of vertical shards
const COL_W = 1.18; // total tower width (slim)
const SHARD_W = COL_W / K;
const H = 4.3; // full tower height
const DEPTH = 0.66;
const HALF_H = H / 2;
const CENTER = (K - 1) / 2;
const CAP_H = 0.9; // pyramidion height (obelisk only)

type Shape = "obelisk" | "slab";
type TexSet = "stone" | "rock";

type Preset = {
  shape: Shape;
  tex: TexSet;
  /** dark tint multiplied over the (grey) rock diffuse to stay on-brand */
  color: string;
  metalness: number;
  /** multiplier over the roughness map: <1 polishes, 1 keeps it raw */
  roughness: number;
  normalScale: number;
  envMapIntensity: number;
  /** world units the texture spans across the full tower width + its vertical tiling */
  tileX: number;
  tileY: number;
  displacement: number;
  seamColor: string;
  seamOpacity: number;
  poolOpacity: number;
  reflectiveFloor: boolean;
};

const PRESETS: Record<Version, Preset> = {
  d: {
    shape: "obelisk",
    tex: "stone",
    color: "#2c2444",
    metalness: 0.28,
    roughness: 0.82,
    normalScale: 1.1,
    envMapIntensity: 1.7,
    tileX: 1.25,
    tileY: 2.4,
    displacement: 0,
    seamColor: "#C6A6FF",
    seamOpacity: 0.98,
    poolOpacity: 0.85,
    reflectiveFloor: false,
  },
  e: {
    shape: "slab",
    tex: "stone",
    color: "#221d30",
    metalness: 0.22,
    roughness: 0.92,
    normalScale: 0.85,
    envMapIntensity: 1.25,
    tileX: 1.2,
    tileY: 2.6,
    displacement: 0,
    seamColor: "#B28AFF",
    seamOpacity: 0.72,
    poolOpacity: 0.45,
    reflectiveFloor: false,
  },
  f: {
    shape: "obelisk",
    tex: "stone",
    color: "#140f20",
    metalness: 0.62,
    roughness: 0.16,
    normalScale: 0.4,
    envMapIntensity: 2.6,
    tileX: 1.0,
    tileY: 2.0,
    displacement: 0,
    seamColor: "#D4BBFF",
    seamOpacity: 1.0,
    poolOpacity: 0.7,
    reflectiveFloor: true,
  },
  g: {
    shape: "obelisk",
    tex: "rock",
    color: "#241d33",
    metalness: 0.04,
    roughness: 1.0,
    normalScale: 2.0,
    envMapIntensity: 0.95,
    tileX: 1.6,
    tileY: 2.2,
    displacement: 0.04,
    seamColor: "#B894FF",
    seamOpacity: 0.85,
    poolOpacity: 0.5,
    reflectiveFloor: false,
  },
};

type Shard = {
  i: number;
  restX: number;
  dist: number; // 0 center .. 1 edge
  height: number;
  yOffset: number; // box offset so all shards share a base at y = -HALF_H
  release: number; // scroll point where this shard starts to peel
  dirX: number;
};

function buildShards(shape: Shape): Shard[] {
  const base = Array.from({ length: K }, (_, i) => {
    const restX = -COL_W / 2 + SHARD_W * (i + 0.5);
    const dist = Math.abs(i - CENTER) / CENTER;
    // Flat-top shaft for both shapes: a height taper turns the discrete shards
    // into a jagged staircase. The obelisk gets its point from a single
    // full-width pyramidion cap instead, which reads as one clean carved tip.
    const height = H;
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
    grad.addColorStop(0, "rgba(190,150,255,0.95)");
    grad.addColorStop(0.35, "rgba(124,74,240,0.45)");
    grad.addColorStop(1, "rgba(124,74,240,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

const tx = (p: string) => import.meta.env.BASE_URL + p;

/** Load both rock map sets once so switching versions is instant. */
function useRockMaps() {
  const stone = useTexture({
    map: tx("textures/stone/stone_diff.jpg"),
    normalMap: tx("textures/stone/stone_nor_gl.jpg"),
    roughnessMap: tx("textures/stone/stone_rough.jpg"),
    aoMap: tx("textures/stone/stone_ao.jpg"),
    displacementMap: tx("textures/stone/stone_disp.jpg"),
  });
  const rock = useTexture({
    map: tx("textures/rock/rock_diff.jpg"),
    normalMap: tx("textures/rock/rock_nor_gl.jpg"),
    roughnessMap: tx("textures/rock/rock_rough.jpg"),
    aoMap: tx("textures/rock/rock_ao.jpg"),
    displacementMap: tx("textures/rock/rock_disp.jpg"),
  });
  useMemo(() => {
    for (const set of [stone, rock]) {
      set.map.colorSpace = THREE.SRGBColorSpace;
      for (const key of ["normalMap", "roughnessMap", "aoMap", "displacementMap"] as const) {
        set[key].colorSpace = THREE.NoColorSpace;
      }
    }
  }, [stone, rock]);
  return { stone, rock };
}

type MapSet = ReturnType<typeof useRockMaps>["stone"];

export default function MonolithShards({
  version,
  scroll,
  ptr,
  reduced,
}: {
  version: Version;
  scroll: React.RefObject<number>;
  ptr: React.RefObject<{ x: number; y: number }>;
  reduced: boolean;
}) {
  const { camera, size } = useThree();
  const preset = PRESETS[version];
  const isObelisk = preset.shape === "obelisk";
  const isMobile = size.width < 768;

  const group = useRef<THREE.Group>(null);
  const shardRefs = useRef<THREE.Group[]>([]);
  const seam = useRef<THREE.Mesh>(null);
  const pool = useRef<THREE.Mesh>(null);

  const shards = useMemo(() => buildShards(preset.shape), [preset.shape]);
  const glow = useGlowTexture();
  const maps = useRockMaps();
  const source: MapSet = preset.tex === "stone" ? maps.stone : maps.rock;

  // Per-shard geometry + material. Each shard clones the shared maps and offsets
  // them so the K shards together sample ONE continuous texture across the tower:
  // no repeated tile, no phantom vertical seams when sealed.
  const built = useMemo(() => {
    const geometries: THREE.BoxGeometry[] = [];
    const materials: THREE.MeshStandardMaterial[] = [];
    const segY = preset.displacement > 0 ? 24 : 1;

    for (const sh of shards) {
      const geo = new THREE.BoxGeometry(SHARD_W, sh.height, DEPTH, 1, segY, 1);
      // aoMap needs a second uv set; reuse uv.
      geo.setAttribute("uv2", new THREE.BufferAttribute((geo.attributes.uv as THREE.BufferAttribute).array, 2));
      geometries.push(geo);

      const clone = <T extends THREE.Texture>(t: T): T => {
        const c = t.clone() as T;
        c.wrapS = c.wrapT = THREE.RepeatWrapping;
        c.repeat.set(preset.tileX / K, preset.tileY);
        c.offset.set((sh.i * preset.tileX) / K, 0);
        c.needsUpdate = true;
        return c;
      };
      const map = clone(source.map);
      map.colorSpace = THREE.SRGBColorSpace;

      const mat = new THREE.MeshStandardMaterial({
        map,
        normalMap: clone(source.normalMap),
        roughnessMap: clone(source.roughnessMap),
        aoMap: clone(source.aoMap),
        ...(preset.displacement > 0
          ? { displacementMap: clone(source.displacementMap), displacementScale: preset.displacement, displacementBias: -preset.displacement / 2 }
          : {}),
        color: new THREE.Color(preset.color),
        metalness: preset.metalness,
        roughness: preset.roughness,
        envMapIntensity: preset.envMapIntensity,
        normalScale: new THREE.Vector2(preset.normalScale, preset.normalScale),
        aoMapIntensity: 1,
      });
      materials.push(mat);
    }
    return { geometries, materials };
  }, [shards, preset, source]);

  // Dispose GPU resources when the version (and thus built set) changes.
  useEffect(() => {
    const { geometries, materials } = built;
    return () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => {
        m.map?.dispose();
        m.normalMap?.dispose();
        m.roughnessMap?.dispose();
        m.aoMap?.dispose();
        m.displacementMap?.dispose();
        m.dispose();
      });
    };
  }, [built]);

  const seamMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: preset.seamColor, transparent: true, toneMapped: false }),
    [preset.seamColor],
  );

  // Damped per-shard openness (0 sealed .. 1 fully peeled).
  const openCur = useRef<number[]>(new Array(K).fill(0));
  const rotY = useRef(0);
  const rotX = useRef(0);
  const posXCur = useRef(0);
  const posYCur = useRef(0);

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
      (seam.current.material as THREE.MeshBasicMaterial).opacity = seamVis * preset.seamOpacity;
    }
    if (pool.current) {
      (pool.current.material as THREE.MeshBasicMaterial).opacity = seamVis * preset.poolOpacity;
      pool.current.scale.setScalar((isObelisk ? 1.5 : 1.2) * (1 + Math.sin(t * 0.8) * 0.05));
    }

    // Pointer sway + gentle scroll rotation on the parent group.
    const ptX = reduced ? 0 : ptr.current?.x ?? 0;
    const ptY = reduced ? 0 : ptr.current?.y ?? 0;
    const sway = reduced ? 0 : Math.sin(t * 0.22) * 0.06;
    rotY.current = THREE.MathUtils.damp(rotY.current, sway + p * 0.3 + ptX * 0.16, 3, delta);
    rotX.current = THREE.MathUtils.damp(rotX.current, ptY * 0.07, 3, delta);

    const heroOnly = 1 - smoothstep(0.05, 0.16, p);
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

  const reflective = preset.reflectiveFloor && !isMobile;

  return (
    <group ref={group}>
      {shards.map((sh, idx) => {
        const isCore = sh.dirX === 0;
        return (
          <group key={sh.i} ref={(el) => { if (el) shardRefs.current[sh.i] = el; }}>
            {/* sharp, flush box so shards tile seamlessly into one solid tower.
                Local x is 0; the group carries restX + the peel offset, so the
                shard is never positioned twice. */}
            <mesh
              position={[0, sh.yOffset, 0]}
              geometry={built.geometries[idx]}
              material={built.materials[idx]}
              castShadow
              receiveShadow
            />
            {/* full-width pyramidion cap rides the core shard (obelisk only).
                A 4-sided pyramid sized so its flat faces span the shaft width,
                squashed in z to match the slimmer depth: one clean stone tip. */}
            {isObelisk && isCore && (
              <mesh
                position={[0, HALF_H + CAP_H / 2, 0]}
                rotation={[0, Math.PI / 4, 0]}
                scale={[1, 1, DEPTH / COL_W]}
                material={built.materials[idx]}
              >
                <cylinderGeometry args={[0, COL_W / Math.SQRT2, CAP_H, 4]} />
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

      {/* contact shadow grounds the tower against the floor */}
      <ContactShadows
        position={[0, -HALF_H + 0.01, 0]}
        scale={9}
        resolution={isMobile ? 512 : 1024}
        blur={2.6}
        opacity={0.55}
        far={5}
        color="#05040a"
      />

      {reflective ? (
        // polished obsidian floor: the monolith + its seam reflect in the stone
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -HALF_H - 0.02, 0]}>
          <planeGeometry args={[60, 60]} />
          <MeshReflectorMaterial
            resolution={1024}
            mixBlur={1.1}
            mixStrength={2.2}
            roughness={0.65}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.3}
            color="#0a0810"
            metalness={0.7}
            mirror={0}
          />
        </mesh>
      ) : (
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
      )}

      <Environment resolution={256} frames={1}>
        <Lightformer intensity={4} color="#B28AFF" position={[-2.5, 1.5, 5]} scale={[4, 9, 1]} />
        <Lightformer intensity={2.2} color="#7C4AF0" position={[3, 0, 5]} scale={[3, 8, 1]} />
        <Lightformer intensity={1} color="#AEB4C7" position={[0, 4, -2]} scale={[9, 4, 1]} />
        <Lightformer intensity={0.7} color="#ffffff" position={[2.5, -2, 5]} scale={[2, 3, 1]} />
      </Environment>
    </group>
  );
}
