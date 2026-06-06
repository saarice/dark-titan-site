import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Clouds, Cloud, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import MonolithShards from "./MonolithShards";
import MonolithSolid from "./MonolithSolid";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import { usePointer } from "../../hooks/usePointer";
import { useReducedMotion } from "../../hooks/useReducedMotion";

// "main2" is the single non-breaking obsidian monolith (default hero); "f" is
// the Obsidian obelisk that still breaks apart, kept for comparison.
export type MonolithVersion = "main2" | "f";

/** Fixed full-screen WebGL layer behind all content, driven by scroll. */
export default function Scene3D({ version = "main2" }: { version?: MonolithVersion }) {
  const scroll = useScrollProgress();
  const ptr = usePointer();
  const reduced = useReducedMotion();
  // Phones get a lighter render budget: lower max DPR and softer bloom.
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Both readings are polished obsidian: clean air, no storm. Only the breaking
  // F obelisk gets sparkles; Main 2 stays calm and premium. Both run lush light.
  const stormy = false;
  const sparkly = version === "f" && !reduced;
  const lush = true; // richer light + bloom

  return (
    <div className="fixed inset-0" style={{ zIndex: 0, pointerEvents: "none" }} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 6.4], fov: 50 }}
        gl={{ antialias: !isMobile, powerPreference: "high-performance" }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
      >
        <color attach="background" args={["#0A0A0C"]} />
        <fog attach="fog" args={["#0A0A0C", lush ? 8 : 9, lush ? 30 : 26]} />
        <ambientLight intensity={lush ? 0.3 : 0.4} />
        <pointLight position={[0, 2, 6]} intensity={26} color="#B28AFF" distance={32} />
        <pointLight position={[-4, 1, 4]} intensity={9} color="#7C4AF0" distance={26} />
        {/* rim light behind the tower so its edges separate from the black bg */}
        <pointLight position={[0, 1.5, -6]} intensity={lush ? 16 : 12} color="#9B6DFF" distance={28} />

        {stormy && (
          <Clouds material={THREE.MeshBasicMaterial} limit={120} range={80}>
            <Cloud
              seed={7}
              segments={26}
              bounds={[11, 4, 3]}
              volume={7}
              color="#2c2740"
              opacity={0.32}
              fade={28}
              speed={0.12}
              position={[0, 2.6, -7]}
            />
            <Cloud
              seed={13}
              segments={18}
              bounds={[9, 3, 2]}
              volume={5}
              color="#4a3f6e"
              opacity={0.18}
              fade={24}
              speed={0.18}
              position={[1.5, 3.6, -5]}
            />
          </Clouds>
        )}
        {sparkly && (
          <Sparkles
            count={60}
            scale={[12, 1.2, 6]}
            position={[0, -1.7, 0]}
            size={2.4}
            speed={0.25}
            opacity={0.7}
            color="#B28AFF"
          />
        )}

        <Suspense fallback={null}>
          {version === "f" ? (
            <MonolithShards version="f" scroll={scroll} ptr={ptr} reduced={reduced} />
          ) : (
            <MonolithSolid scroll={scroll} ptr={ptr} reduced={reduced} />
          )}
        </Suspense>

        <EffectComposer>
          <Bloom
            intensity={reduced ? 0.4 : isMobile ? 0.7 : lush ? 1.2 : 0.95}
            luminanceThreshold={lush ? 0.4 : 0.45}
            luminanceSmoothing={0.9}
            mipmapBlur
            radius={lush ? 0.8 : 0.7}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
