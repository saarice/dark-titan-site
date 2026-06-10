import { useRef, useState } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";
import LoadingScreen from "./components/LoadingScreen";
import Scene3D from "./components/three/Scene3D";
import Nav from "./components/Nav";
import Hero from "./components/sections/Hero";
import Chaos from "./components/sections/Chaos";
import Pipeline from "./components/sections/Pipeline";
import AgentControl from "./components/sections/AgentControl";
import Factory from "./components/sections/Factory";
import Scale from "./components/sections/Scale";
import OneInstance from "./components/sections/OneInstance";
import Manifesto from "./components/sections/Manifesto";
import Integrations from "./components/sections/Integrations";
import PreBakedFlows from "./components/sections/PreBakedFlows";
import Break from "./components/sections/Break";
import Tempo from "./components/sections/Tempo";
import OfferTable from "./components/sections/OfferTable";
import Footer from "./components/sections/Footer";

/**
 * One continuous story, no chapter framing. Saar (2026-06-10): the
 * Infrastructure/Ecosystem 01-02 split is gone — pillar dividers, side rails
 * and the TwoWays cards all cut; every remaining beat demos value directly.
 */
export default function App() {
  const [loading, setLoading] = useState(true);
  // The Break section's scrub progress, shared with the global canvas: the
  // whole monolith→crest performance (ForgeStage) plays THERE, so the forged
  // crest is the same object that rides to the bottom — one canvas, no handoff.
  const breakProgress = useRef(0);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {/* fixed WebGL backdrop - decorative, behind everything */}
      <Scene3D breakProgress={breakProgress} />

      <Nav />

      <main className="relative z-10 overflow-x-clip">
        <Hero revealed={!loading} />
        {/* pain → turn */}
        <Chaos />
        {/* the engine, beat by beat */}
        <Pipeline />
        <AgentControl />
        <Factory />
        <Scale />
        <OneInstance />
        <Manifesto />
        {/* wired into what you already run */}
        <Integrations />
        <PreBakedFlows />
        {/* the centerpiece — monolith to monolith (3D in the global canvas) */}
        <Break progress={breakProgress} />
        {/* proof in motion + the offer */}
        <Tempo />
        <OfferTable />
        <Footer />
      </main>
    </MotionConfig>
  );
}
