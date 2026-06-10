import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Preload, RoundedBox } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useObsidianMaterial } from "./obsidian";

/**
 * Beat M — the monolith → microservices break (the centerpiece). The SAME obsidian
 * material/proportions the user has seen all along, here built from a stack of
 * blocks that, scroll-by-scroll, split apart deliberately and resolve into an
 * ordered constellation of microservices. Not chaotic shattering — governed.
 * `progress` (0..1) is scroll-scrubbed by the Break section.
 */
const COLS = 2;
const ROWS = 8;
const N = COLS * ROWS; // 16 blocks form the slab
const BW = 0.58;
const BH = 0.44;
const BD = 0.58;
const GAP = 0.02;

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

type Block = {
  packed: THREE.Vector3;
  target: THREE.Vector3;
  delay: number;
  rot: number;
};

function Blocks({ progress, reduced }: { progress: React.RefObject<number>; reduced: boolean }) {
  const material = useObsidianMaterial();
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const cur = useRef(reduced ? 1 : 0);

  const blocks = useMemo<Block[]>(() => {
    const arr: Block[] = [];
    for (let i = 0; i < N; i++) {
      const c = i % COLS;
      const r = Math.floor(i / COLS);
      // packed: the solid slab (a narrow vertical monolith, seam down the middle)
      const packed = new THREE.Vector3((c - (COLS - 1) / 2) * (BW + GAP), (r - (ROWS - 1) / 2) * (BH + GAP), 0);
      // target: an ordered 4×4 service constellation, spread and aligned
      const gc = i % 4;
      const gr = Math.floor(i / 4);
      const target = new THREE.Vector3((gc - 1.5) * 1.18, (gr - 1.5) * 1.0, ((gc + gr) % 2) * 0.35 - 0.17);
      // Tighter stagger (0.42 → 0.22): with the long window most blocks sat
      // frozen through the first half of the scrub and the break felt stuck.
      arr.push({ packed, target, delay: (i / N) * 0.22, rot: ((i % 3) - 1) * 0.12 });
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (reduced) return; // static resolved end-state (positions set via the position prop)
    const want = THREE.MathUtils.clamp(progress.current ?? 0, 0, 1);
    // Softer damp (6 → 4.5): scroll arrives in discrete steps; the lower lambda
    // glides between them instead of visibly stepping with each wheel tick.
    cur.current = THREE.MathUtils.damp(cur.current, want, 4.5, delta);
    // Choreography completes at 88% of the pin, not the very last pixel — the
    // tail otherwise read as the animation hanging unfinished ("stuck").
    const t = Math.min(1, cur.current / 0.88);
    for (let i = 0; i < N; i++) {
      const mesh = refs.current[i];
      if (!mesh) continue;
      const b = blocks[i];
      const local = THREE.MathUtils.clamp((t - b.delay) / (1 - 0.22), 0, 1);
      const e = easeInOut(local);
      mesh.position.lerpVectors(b.packed, b.target, e);
      // a gentle arc up-and-out during transit; settles flat (ordered) at the end
      mesh.position.y += Math.sin(e * Math.PI) * 0.25;
      mesh.rotation.z = b.rot * Math.sin(e * Math.PI);
      mesh.rotation.y = e * 0.5 * (i % 2 ? 1 : -1) * Math.sin(e * Math.PI);
    }
  });

  return (
    <group position={[0, 0.55, 0]}>
      {blocks.map((_, i) => (
        <RoundedBox
          key={i}
          ref={(m) => {
            refs.current[i] = m;
          }}
          args={[BW, BH, BD]}
          radius={0.04}
          smoothness={3}
          material={material}
          position={reduced ? blocks[i].target : blocks[i].packed}
        />
      ))}
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
      <pointLight position={[0, 2, 6]} intensity={26} color="#B28AFF" distance={32} />
      <pointLight position={[-4, 1, 4]} intensity={9} color="#7C4AF0" distance={26} />
      <pointLight position={[0, 1.5, -6]} intensity={16} color="#9B6DFF" distance={28} />

      <Suspense fallback={null}>
        <Blocks progress={progress} reduced={reduced} />
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={4} color="#B28AFF" position={[-2.5, 1.5, 5]} scale={[4, 9, 1]} />
          <Lightformer intensity={2.2} color="#7C4AF0" position={[3, 0, 5]} scale={[3, 8, 1]} />
          <Lightformer intensity={1} color="#AEB4C7" position={[0, 4, -2]} scale={[9, 4, 1]} />
        </Environment>
        {/* compile shaders + upload textures at mount (1.5 viewports before the
            pin), so the first scrubbed frames don't hitch on first render */}
        <Preload all />
      </Suspense>

      <EffectComposer>
        <Bloom intensity={isMobile ? 0.6 : 0.85} luminanceThreshold={0.4} luminanceSmoothing={0.9} mipmapBlur radius={0.8} />
      </EffectComposer>
    </Canvas>
  );
}
