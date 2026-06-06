import { useState } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";
import LoadingScreen from "./components/LoadingScreen";
import Scene3D, { type MonolithVersion } from "./components/three/Scene3D";
import VersionSwitcher from "./components/VersionSwitcher";
import Nav from "./components/Nav";

function initialVersion(): MonolithVersion {
  if (typeof window === "undefined") return "main2";
  const v = new URLSearchParams(window.location.search).get("v");
  const all: MonolithVersion[] = ["main2", "f"];
  return all.includes(v as MonolithVersion) ? (v as MonolithVersion) : "main2";
}
import Hero from "./components/sections/Hero";
import Chaos from "./components/sections/Chaos";
import Factory from "./components/sections/Factory";
import Pipeline from "./components/sections/Pipeline";
import Rivers from "./components/sections/Rivers";
import Tempo from "./components/sections/Tempo";
import Proof from "./components/sections/Proof";
import Trust from "./components/sections/Trust";
import Manifesto from "./components/sections/Manifesto";
import Footer from "./components/sections/Footer";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState<MonolithVersion>(initialVersion);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {/* fixed WebGL backdrop - decorative, behind everything */}
      <Scene3D version={version} />
      <VersionSwitcher version={version} onChange={setVersion} />

      <Nav />

      <main className="relative z-10 overflow-x-clip">
        <Hero />
        <Chaos />
        <Factory />
        <Pipeline />
        <Rivers />
        <Tempo />
        <Proof />
        <Trust />
        <Manifesto />
        <Footer />
      </main>
    </MotionConfig>
  );
}
