import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import Monolith from "./Monolith";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import { usePointer } from "../../hooks/usePointer";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/** Fixed full-screen WebGL layer behind all content, driven by scroll. */
export default function Scene3D() {
  const scroll = useScrollProgress();
  const ptr = usePointer();
  const reduced = useReducedMotion();

  return (
    <div className="fixed inset-0" style={{ zIndex: 0, pointerEvents: "none" }} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 6.4], fov: 50 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#0A0A0C"]} />
        <fog attach="fog" args={["#0A0A0C", 9, 26]} />
        <ambientLight intensity={0.25} />
        <pointLight position={[0, 2, 6]} intensity={18} color="#B338FF" distance={30} />
        <pointLight position={[-4, 1, 4]} intensity={6} color="#6020D9" distance={24} />
        <Monolith scroll={scroll} ptr={ptr} reduced={reduced} />
        <EffectComposer>
          <Bloom
            intensity={reduced ? 0.5 : 1.1}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
            radius={0.7}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
