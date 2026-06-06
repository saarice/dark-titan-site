import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import MonolithSolid from "./MonolithSolid";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import { usePointer } from "../../hooks/usePointer";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/**
 * Fixed full-screen WebGL layer behind all content, driven by scroll.
 * Renders the single sealed obsidian monolith (the only hero reading).
 */
export default function Scene3D() {
  const scroll = useScrollProgress();
  const ptr = usePointer();
  const reduced = useReducedMotion();
  // Phones get a lighter render budget: lower max DPR and softer bloom.
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div className="fixed inset-0" style={{ zIndex: 0, pointerEvents: "none" }} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 6.4], fov: 50 }}
        gl={{ antialias: !isMobile, powerPreference: "high-performance" }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
      >
        <color attach="background" args={["#0A0A0C"]} />
        <fog attach="fog" args={["#0A0A0C", 8, 30]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 2, 6]} intensity={26} color="#B28AFF" distance={32} />
        <pointLight position={[-4, 1, 4]} intensity={9} color="#7C4AF0" distance={26} />
        {/* rim light behind the tower so its edges separate from the black bg */}
        <pointLight position={[0, 1.5, -6]} intensity={16} color="#9B6DFF" distance={28} />

        <Suspense fallback={null}>
          <MonolithSolid scroll={scroll} ptr={ptr} reduced={reduced} />
        </Suspense>

        <EffectComposer>
          <Bloom
            intensity={reduced ? 0.4 : isMobile ? 0.7 : 1.2}
            luminanceThreshold={0.4}
            luminanceSmoothing={0.9}
            mipmapBlur
            radius={0.8}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
