import { useState } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";
import LoadingScreen from "./components/LoadingScreen";
import Scene3D from "./components/three/Scene3D";
import Nav from "./components/Nav";
import Hero from "./components/sections/Hero";
import Chaos from "./components/sections/Chaos";
import TwoWays from "./components/sections/TwoWays";
import PillarDivider from "./components/sections/PillarDivider";
import Rivers from "./components/sections/Rivers";
import Pipeline from "./components/sections/Pipeline";
import AgentControl from "./components/sections/AgentControl";
import Factory from "./components/sections/Factory";
import Scale from "./components/sections/Scale";
import OneInstance from "./components/sections/OneInstance";
import EngineDiagram from "./components/sections/EngineDiagram";
import Manifesto from "./components/sections/Manifesto";
import Integrations from "./components/sections/Integrations";
import PreBakedFlows from "./components/sections/PreBakedFlows";
import Tempo from "./components/sections/Tempo";
import Proof from "./components/sections/Proof";
import OfferTable from "./components/sections/OfferTable";
import Trust from "./components/sections/Trust";
import Footer from "./components/sections/Footer";

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {/* fixed WebGL backdrop - decorative, behind everything */}
      <Scene3D />

      <Nav />

      <main className="relative z-10 overflow-x-clip">
        {/* Beat 1 — hero */}
        <Hero revealed={!loading} />
        {/* Beat 2 — pain → turn */}
        <Chaos />
        {/* Beat 3 — orientation: two ways */}
        <TwoWays />

        {/* Beat 4 — Pillar I: As Infrastructure */}
        <PillarDivider
          id="pillar-infra"
          eyebrow="Pillar 01 · As Infrastructure"
          title="The engine, as infrastructure."
          sub="The autonomous engine itself — agent pipelines versioned in git, executed deterministically, governed by hard limits, and scaled across Kubernetes."
          pills={[
            "Process as code",
            "Agent control",
            "Runtime control UI",
            "Scale on Kubernetes",
            "One instance",
          ]}
          visual={<EngineDiagram />}
        />
        {/* Beats 5–9 — the five infrastructure capabilities */}
        <Rivers />
        <Pipeline />
        <AgentControl />
        <Factory />
        <Scale />
        <OneInstance />
        {/* Beat 10 — the Infrastructure Principle (pillar payoff) */}
        <Manifesto />

        {/* Beat 11 — Pillar II: As an Ecosystem */}
        <PillarDivider
          id="pillar-eco"
          eyebrow="Pillar 02 · As an Ecosystem"
          title="The methodology, as an ecosystem."
          sub="Infrastructure plus coded methodology — wired into the systems you already run, and shipped with proven, pre-baked engineering flows."
          pills={["External integrations", "Pre-baked flows", "Compounding methodology"]}
        />
        {/* Beats 12–13 — the ecosystem */}
        <Integrations />
        <PreBakedFlows />

        {/* Beats 14–16 — proof / demo */}
        <Tempo />
        <Proof />
        <OfferTable />
        {/* Beat 17 — trust & control */}
        <Trust />
        {/* Beat 18 — closing CTA */}
        <Footer />
      </main>
    </MotionConfig>
  );
}
