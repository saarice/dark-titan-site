import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import MonolithSolid from "./MonolithSolid";
import LogoSolid from "./LogoSolid";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import { useMonolithX, type TrackStop } from "../../hooks/useSectionFocus";
import { usePointer } from "../../hooks/usePointer";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/**
 * The stone's journey down the page: it slides right -> left -> centre from
 * section to section, always landing opposite that section's copy, arrives
 * CENTRED at the principle statement and recedes back into the dark there.
 * From the Break's finale onward the CREST takes its place (crestLive) and
 * rides the same track to the bottom of the page.
 */
const TRACK: TrackStop[] = [
  { id: "home", x: 2.2 }, // hero: copy left, monolith centred opposite it (not pushed to the edge)
  { id: "chaos", x: 2.2 }, // pain beat — stone on the RIGHT, the type stack reads from the left
  { id: "process", x: -0.5 }, // process as code — stone centred in the gap (text left, timeline right)
  { id: "agents", x: 1.9 }, // agent control
  { id: "runtime", x: -1.9 }, // runtime UI
  { id: "scale", x: 1.9 }, // scale on K8s
  { id: "team", x: -1.9 }, // one instance
  { id: "principle", x: 0 }, // Infrastructure Principle, centred climax — the stone EXITS here
  { id: "integrations", x: 1.9 },
  { id: "flows", x: -1.9 },
  { id: "break", x: 0 }, // centerpiece — global scene paused while it owns the screen
  { id: "tempo", x: 1.9 }, // build replay — the crest rides from here
  { id: "offer-table", x: 3.3 }, // table spans the page; crest parks at the right edge
  { id: "contact", x: 0 }, // closing CTA, centred
];

/**
 * Fixed full-screen WebGL layer behind all content, driven by scroll.
 */
export default function Scene3D({
  paused = false,
  crestLive = false,
}: {
  paused?: boolean;
  /** true from the Break finale onward — the crest joins the backdrop and rides
   *  the track to the bottom of the page (scrubbing back up dismisses it) */
  crestLive?: boolean;
}) {
  const scroll = useScrollProgress();
  const posX = useMonolithX(TRACK);
  const ptr = usePointer();
  const reduced = useReducedMotion();
  // Phones get a lighter render budget: lower max DPR and softer bloom.
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div className="fixed inset-0" style={{ zIndex: 0, pointerEvents: "none" }} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 6.4], fov: 50 }}
        gl={{ antialias: !isMobile, powerPreference: "high-performance" }}
        dpr={isMobile ? [1, 1.25] : [1, 1.5]}
        frameloop={paused ? "never" : "always"}
      >
        <color attach="background" args={["#0A0A0C"]} />
        <fog attach="fog" args={["#0A0A0C", 8, 30]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 2, 6]} intensity={26} color="#B28AFF" distance={32} />
        <pointLight position={[-4, 1, 4]} intensity={9} color="#7C4AF0" distance={26} />
        {/* rim light behind the tower so its edges separate from the black bg */}
        <pointLight position={[0, 1.5, -6]} intensity={16} color="#9B6DFF" distance={28} />

        <Suspense fallback={null}>
          {/* The monolith owns the hero + every data beat, lands centred at the
              principle and RECEDES into the dark there. Nothing replaces it
              until the Break forges the crest — from there LogoSolid carries the
              brand to the bottom. (CrestForge light-carve alternative is parked
              on branch crest-forge-prototype.) */}
          <MonolithSolid scroll={scroll} posX={posX} ptr={ptr} reduced={reduced} />
          <LogoSolid posX={posX} ptr={ptr} reduced={reduced} live={crestLive} />
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
