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
  // Beat M pins a full-screen 3D scene; pause the global canvas while it owns
  // the viewport. No hide needed: the stone recedes away at the Chaos turn, so
  // the Break's monolith is the only stone in sight.
  const [breakActive, setBreakActive] = useState(false);
  // The Break scrub's raw progress, SHARED with the global scene: its crest
  // opacity-fades in over the exact window the Break's crest fades out, so the
  // handoff is a perfect in-place cross-dissolve (and reverses on scroll-up).
  const breakProgress = useRef(0);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {/* fixed WebGL backdrop - decorative, behind everything */}
      <Scene3D paused={breakActive} breakProgress={breakProgress} />

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
        {/* the centerpiece — monolith to monolith */}
        <Break onActiveChange={setBreakActive} progress={breakProgress} />
        {/* proof in motion + the offer */}
        <Tempo />
        <OfferTable />
        <Footer />
      </main>
    </MotionConfig>
  );
}
