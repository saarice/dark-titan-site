import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import LoadingScreen from "./components/LoadingScreen";
import Scene3D from "./components/three/Scene3D";
import Nav from "./components/Nav";
import Hero from "./components/sections/Hero";
import Chaos from "./components/sections/Chaos";
import Factory from "./components/sections/Factory";
import Agents from "./components/sections/Agents";
import Rivers from "./components/sections/Rivers";
import Proof from "./components/sections/Proof";
import Manifesto from "./components/sections/Manifesto";
import Footer from "./components/sections/Footer";

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {/* fixed WebGL backdrop - decorative, behind everything */}
      <Scene3D />

      <Nav />

      <main className="relative z-10">
        <Hero />
        <Chaos />
        <Factory />
        <Agents />
        <Rivers />
        <Proof />
        <Manifesto />
        <Footer />
      </main>
    </>
  );
}
