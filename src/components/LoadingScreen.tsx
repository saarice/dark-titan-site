import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WORDS = ["Imagine", "Build", "Operate"];

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduced ? 600 : 2400;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setCount(Math.round(t * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(onComplete, 350);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  useEffect(() => {
    const id = setInterval(() => setWordIndex((i) => (i + 1) % WORDS.length), 800);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-obsidian"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="absolute left-6 top-6 font-mono text-xs uppercase tracking-[0.3em] text-muted md:left-10 md:top-10"
      >
        Dark Titan
      </motion.div>

      {/* seam spine */}
      <div className="seam-line glow-seam pointer-events-none absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 opacity-50" />

      <div className="flex h-full items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={wordIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="font-display text-4xl text-cloud/80 md:text-6xl lg:text-7xl"
          >
            {WORDS[wordIndex]}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 right-6 font-display tabular-nums text-6xl text-cloud md:bottom-10 md:right-10 md:text-8xl lg:text-9xl">
        {String(count).padStart(3, "0")}
      </div>

      <div className="absolute bottom-0 left-0 h-[3px] w-full bg-slate">
        <div
          className="h-full origin-left bg-gradient-to-r from-violet to-lavender"
          style={{
            transform: `scaleX(${count / 100})`,
            boxShadow: "0 0 8px rgba(138,86,247,0.5)",
          }}
        />
      </div>
    </motion.div>
  );
}
