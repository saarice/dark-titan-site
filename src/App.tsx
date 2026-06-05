import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import LoadingScreen from "./components/LoadingScreen";
import Scene3D from "./components/Scene3D";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Works from "./components/Works";
import Journal from "./components/Journal";
import Lab from "./components/Lab";
import Stats from "./components/Stats";
import Footer from "./components/Footer";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {/* live WebGL crystal, fixed behind everything, driven by scroll */}
      <Scene3D />

      <Navbar />
      <main className="relative z-10">
        <Hero />
        <Works />
        <Journal />
        <Lab />
        <Stats />
        <Footer />
      </main>
    </>
  );
}
