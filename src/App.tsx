import { useState } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";
import LoadingScreen from "./components/LoadingScreen";
import Scene3D from "./components/three/Scene3D";
import Nav from "./components/Nav";
import PillarRail from "./components/PillarRail";
import Hero from "./components/sections/Hero";
import Chaos from "./components/sections/Chaos";
import TwoWays from "./components/sections/TwoWays";
import PillarDivider from "./components/sections/PillarDivider";
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
import Proof from "./components/sections/Proof";
import OfferTable from "./components/sections/OfferTable";
import Footer from "./components/sections/Footer";

export default function App() {
  const [loading, setLoading] = useState(true);
  // Beat M pins a full-screen 3D scene; pause the global canvas while it's active.
  const [breakActive, setBreakActive] = useState(false);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {/* fixed WebGL backdrop - decorative, behind everything */}
      <Scene3D paused={breakActive} />

      <Nav />

      {/* Pillar progress rails (Beats 4 & 11) — the demoted chip words, now functional */}
      <PillarRail
        label="Pillar 01"
        items={[
          { label: "Process as code", id: "process" },
          { label: "Agent control", id: "agents" },
          { label: "Runtime control UI", id: "runtime" },
          { label: "Scale on Kubernetes", id: "scale" },
          { label: "One instance", id: "team" },
        ]}
      />
      <PillarRail
        label="Pillar 02"
        items={[
          { label: "Integrations", id: "integrations" },
          { label: "Pre-baked flows", id: "flows" },
        ]}
      />

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
          index="01"
          eyebrow="Pillar one — the engine"
          title="As Infrastructure"
          sub="Not a black box you hand the keys to."
        />
        {/* Beats 5–9 — the five infrastructure capabilities */}
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
          index="02"
          eyebrow="Pillar two — the methodology"
          title="As an Ecosystem"
          sub="Wired into the systems you already run."
          align="right"
        />
        {/* Beats 12–13 — the ecosystem */}
        <Integrations />
        <PreBakedFlows />

        {/* Beat M — the monolith → microservices break (centerpiece) */}
        <Break onActiveChange={setBreakActive} />

        {/* Beats 14–16 — proof / demo */}
        <Tempo />
        <Proof />
        <OfferTable />
        {/* Beat 18 — closing CTA */}
        <Footer />
      </main>
    </MotionConfig>
  );
}
