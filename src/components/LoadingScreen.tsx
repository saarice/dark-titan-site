import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WORDS = ["Imagine", "Build", "Operate"];

// Expo-style ease so the doors snap apart fast, then glide to a stop.
const EASE_DOOR = [0.7, 0, 0.2, 1] as const;
const DOOR = { duration: 0.9, delay: 0.28, ease: EASE_DOOR };

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
      else setTimeout(onComplete, 320);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  useEffect(() => {
    const id = setInterval(() => setWordIndex((i) => (i + 1) % WORDS.length), 800);
    return () => clearInterval(id);
  }, []);

  return (
    // Transparent shell — the doors carry the fill, so the page behind shows
    // through the moment they part. pointer-events-none here + solid doors means
    // the doors block during load, then clicks pass through as they slide away.
    <motion.div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden>
      {/* LEFT door */}
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2 bg-obsidian"
        exit={{ x: "-101%", transition: DOOR }}
      />
      {/* RIGHT door */}
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2 bg-obsidian"
        exit={{ x: "101%", transition: DOOR }}
      />

      {/* Symmetric seam glow — one CENTRED element so the violet halo bleeds
          evenly to BOTH sides of the line (edge box-shadows on the doors occluded
          each other, so the glow only showed on one side). Fades as doors part. */}
      <motion.div
        className="absolute inset-y-0 left-1/2 w-[260px] -translate-x-1/2"
        style={{
          background:
            "linear-gradient(90deg, rgba(138,63,255,0) 0%, rgba(138,63,255,0.2) 38%, rgba(197,122,255,0.55) 50%, rgba(138,63,255,0.2) 62%, rgba(138,63,255,0) 100%)",
          filter: "blur(6px)",
        }}
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 0.9 }}
        exit={{ opacity: 0, transition: { duration: 0.75, delay: 0.32 } }}
      />

      {/* the bright core line — just fades out cleanly as the doors part (no flash). */}
      <motion.div
        className="seam-line glow-seam absolute left-1/2 top-0 h-full w-[2px]"
        initial={{ x: "-50%", opacity: 0.6 }}
        animate={{ x: "-50%", opacity: 0.6 }}
        exit={{ x: "-50%", opacity: 0, transition: { duration: 0.75, delay: 0.32, ease: "easeOut" } }}
      />

      {/* content layer — fades out first, before the doors open */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        exit={{ opacity: 0, transition: { duration: 0.26 } }}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="absolute left-6 top-6 font-mono text-xs uppercase tracking-[0.3em] text-muted md:left-10 md:top-10"
        >
          Dark Titan
        </motion.div>

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
    </motion.div>
  );
}
