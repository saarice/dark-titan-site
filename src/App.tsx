import { useState } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";
import LoadingScreen from "./components/LoadingScreen";
import Scene3D from "./components/three/Scene3D";
import Nav from "./components/Nav";
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

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {/* fixed WebGL backdrop - decorative, behind everything */}
      <Scene3D />

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
