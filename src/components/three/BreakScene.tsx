import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Preload } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three-stdlib";
import { useObsidianMaterial } from "./obsidian";
import { useBladeGlow } from "./glows";
import { sampleCrestVoxels } from "../../lib/logoMorph";

/**
 * Beat M — the monolith → microservices → CREST build (the centerpiece).
 * Three acts on one timed performance (`progress` 0..1, driven by Break.tsx):
 *   A (0 → 0.40)  the packed slab breaks apart, blocks arc out
 *   B (0.40→0.50) they hold as an ordered service grid
 *   C (0.50→0.95) the services fly together and BUILD the Dark Titan crest,
 *                 bottom-up, each brick shrinking into its mosaic voxel
 *   (0.88→1)      the crest's seam light ignites — the wow payoff
 * One instanced draw call for all bricks. Reduced motion: the finished crest,
 * seam lit, no animation.
 */
const GAP = 0.02;
const SLAB_COLS = 5;
const SLAB_W = 0.42; // brick footprint in the packed slab
const SLAB_D = 0.42;
const GRID_COLS = 10; // act-B service grid
const GRID_DX = 0.6;
const GRID_DY = 0.52;
const MOSAIC = 0.86; // voxels sit slightly apart so the crest reads as built-from-blocks

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
/** 0..1 over [a, b] */
function seg(t: number, a: number, b: number) {
  return THREE.MathUtils.clamp((t - a) / (b - a), 0, 1);
}

type Block = {
  packed: THREE.Vector3;
  grid: THREE.Vector3;
  crest: THREE.Vector3;
  delayA: number;
  delayB: number;
  rot: number;
};

function Blocks({ progress, reduced }: { progress: React.RefObject<number>; reduced: boolean }) {
  // The crest's own obsidian dialling (see LogoSolid): many small faces catch
  // far more of the violet lights than big slabs, so the defaults blow out.
  // crest-style dialling (see LogoSolid): small faces catch more violet light
  const material = useObsidianMaterial({ roughness: 0.32, envMapIntensity: 0.6, metalness: 0.5 });
  const bladeGlow = useBladeGlow();
  const inst = useRef<THREE.InstancedMesh>(null);
  const seam = useRef<THREE.Mesh>(null);
  const cur = useRef(reduced ? 1 : 0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const { blocks, brickH, voxel, crestH, geom } = useMemo(() => {
    // The crest sampled as voxels — these are the act-C targets and define N.
    const vox = sampleCrestVoxels(3.0, 22);
    // Build bottom-up: rank voxels by height so the crest assembles like a build.
    const order = [...vox.positions].sort((a, b) => a.y - b.y || a.x - b.x);
    const n = order.length;

    // Packed slab sized to hold n bricks at roughly monolith proportions.
    const rows = Math.ceil(n / SLAB_COLS);
    const slabH = 3.1;
    const bh = slabH / rows - GAP;

    const gridRows = Math.ceil(n / GRID_COLS);

    const arr: Block[] = [];
    for (let i = 0; i < n; i++) {
      const c = i % SLAB_COLS;
      const r = Math.floor(i / SLAB_COLS);
      const packed = new THREE.Vector3(
        (c - (SLAB_COLS - 1) / 2) * (SLAB_W + GAP),
        (r - (rows - 1) / 2) * (bh + GAP),
        0,
      );
      const gc = i % GRID_COLS;
      const gr = Math.floor(i / GRID_COLS);
      const grid = new THREE.Vector3(
        (gc - (GRID_COLS - 1) / 2) * GRID_DX,
        (gr - (gridRows - 1) / 2) * GRID_DY,
        ((gc + gr) % 2) * 0.3 - 0.15,
      );
      // slab row r ↔ bottom-up crest rank: low bricks build the crest's base
      arr.push({
        packed,
        grid,
        crest: order[i],
        delayA: (i / n) * 0.1,
        delayB: (i / n) * 0.16,
        rot: ((i % 3) - 1) * 0.12,
      });
    }
    const g = new RoundedBoxGeometry(SLAB_W, bh, SLAB_D, 3, 0.03);
    return { blocks: arr, brickH: bh, voxel: vox.cell, crestH: vox.height, geom: g };
  }, []);

  useFrame((state, delta) => {
    const mesh = inst.current;
    if (!mesh) return;
    const t = reduced
      ? 1
      : (cur.current = THREE.MathUtils.damp(
          cur.current,
          THREE.MathUtils.clamp(progress.current ?? 0, 0, 1),
          4.5,
          delta,
        ));

    const vs = (voxel * MOSAIC) / SLAB_W;
    const vsy = (voxel * MOSAIC) / brickH;
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      // act A: slab → service grid; act C: grid → crest voxel
      const a = reduced ? 1 : easeInOut(seg(t, b.delayA, b.delayA + 0.3));
      const c = reduced ? 1 : easeInOut(seg(t, 0.5 + b.delayB, 0.5 + b.delayB + 0.29));

      dummy.position.lerpVectors(b.packed, b.grid, a);
      dummy.position.lerp(b.crest, c);
      // arcs: up-and-out while breaking, a rising sweep while building
      dummy.position.y += Math.sin(a * Math.PI) * 0.25 * (1 - c) + Math.sin(c * Math.PI) * 0.4;
      dummy.rotation.set(
        0,
        a * 0.5 * (i % 2 ? 1 : -1) * Math.sin(a * Math.PI) * (1 - c),
        b.rot * Math.sin(a * Math.PI) * (1 - c),
      );
      // bricks shrink into mosaic voxels as they land
      dummy.scale.set(
        THREE.MathUtils.lerp(1, vs, c),
        THREE.MathUtils.lerp(1, vsy, c),
        THREE.MathUtils.lerp(1, vs, c),
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // the seam ignites once the crest is built
    if (seam.current) {
      const on = reduced ? 1 : seg(t, 0.88, 1);
      (seam.current.material as THREE.MeshBasicMaterial).opacity =
        on * (0.7 + Math.sin(state.clock.elapsedTime * 0.9) * 0.08);
    }
  });

  return (
    <group position={[0, 0.35, 0]}>
      <instancedMesh ref={inst} args={[geom, material, blocks.length]} />
      {/* the crest's luminous seam — the same blade of light the brand carries */}
      <mesh ref={seam} position={[0, 0.1, voxel / 2 + 0.06]}>
        <planeGeometry args={[0.16, crestH * 0.94]} />
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
      <pointLight position={[0, 2, 6]} intensity={20} color="#B28AFF" distance={32} />
      <pointLight position={[-4, 1, 4]} intensity={8} color="#7C4AF0" distance={26} />
      {/* rim light far up and dim: at the old [0,1.5,-6]/16 it shone straight
          through the crest's mosaic gaps and bloomed into rows of hot slits */}
      <pointLight position={[0, 6, -9]} intensity={6} color="#9B6DFF" distance={30} />

      <Suspense fallback={null}>
        <Blocks progress={progress} reduced={reduced} />
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={4} color="#B28AFF" position={[-2.5, 1.5, 5]} scale={[4, 9, 1]} />
          <Lightformer intensity={2.2} color="#7C4AF0" position={[3, 0, 5]} scale={[3, 8, 1]} />
          <Lightformer intensity={1} color="#AEB4C7" position={[0, 4, -2]} scale={[9, 4, 1]} />
        </Environment>
        {/* compile shaders + upload textures at mount (1.5 viewports before the
            beat), so the first played frames don't hitch on first render */}
        <Preload all />
      </Suspense>

      <EffectComposer>
        <Bloom intensity={isMobile ? 0.6 : 0.85} luminanceThreshold={0.55} luminanceSmoothing={0.9} mipmapBlur radius={0.8} />
      </EffectComposer>
    </Canvas>
  );
}
