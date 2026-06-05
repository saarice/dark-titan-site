import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { gsap } from "gsap";

const ROLES = ["vision", "code", "backlog", "data"];

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);
  const [roleIndex, setRoleIndex] = useState(0);

  const { scrollYProgress } = useScroll({ target: root, offset: ["start start", "end start"] });
  const heroRotate = useTransform(scrollYProgress, [0, 1], [0, 14]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  useEffect(() => {
    const id = setInterval(() => setRoleIndex((i) => (i + 1) % ROLES.length), 2000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(".name-reveal", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.2, delay: 0.1 });
      tl.fromTo(
        ".blur-in",
        { opacity: 0, filter: "blur(10px)", y: 20 },
        { opacity: 1, filter: "blur(0px)", y: 0, duration: 1, stagger: 0.1 },
        0.3,
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={root}
      className="relative flex min-h-screen flex-col justify-end overflow-hidden pb-24 md:pb-28"
      style={{ perspective: 1200 }}
    >
      {/* the 3D "DT" mark renders behind, in the upper half; this scrim keeps the lower copy crisp */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-3/4 w-full bg-gradient-to-t from-bg via-bg/85 to-transparent" />

      {/* accessible page title; the glowing particle mark above is the visual logotype */}
      <h1 className="sr-only">Dark Titan — the Agent Factory</h1>

      <motion.div
        style={{
          rotateX: heroRotate,
          y: heroY,
          scale: heroScale,
          opacity: heroOpacity,
          transformStyle: "preserve-3d",
        }}
        className="relative z-10 mx-auto max-w-2xl px-6 text-center"
      >
        <p className="blur-in mb-5 font-mono text-xs uppercase tracking-[0.35em] text-muted">
          The Agent Factory
        </p>

        <p className="name-reveal mb-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-text-primary md:text-6xl">
          Your{" "}
          <span
            key={roleIndex}
            className="inline-block animate-role-fade-in italic text-accent-hi"
          >
            {ROLES[roleIndex]}
          </span>{" "}
          becomes operational reality.
        </p>

        <p className="blur-in mx-auto mb-10 max-w-md text-sm text-muted md:text-base">
          An agent factory that turns ideas into production-grade software, built on 10+ years of
          Develeap's DevOps and production excellence. Lights off. Code out.
        </p>

        <div className="blur-in inline-flex flex-wrap items-center justify-center gap-4">
          <a
            href="#work"
            className="group relative inline-flex rounded-full text-sm transition-transform hover:scale-105"
          >
            <span className="gradient-border-animated absolute -inset-[2px] rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="relative rounded-full bg-text-primary px-7 py-3.5 font-medium text-bg transition-colors group-hover:bg-bg group-hover:text-text-primary">
              See it work
            </span>
          </a>
          <a
            href="mailto:saar.cohen@develeap.com"
            className="group relative inline-flex rounded-full text-sm transition-transform hover:scale-105"
          >
            <span className="gradient-border-animated absolute -inset-[2px] rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="relative rounded-full border-2 border-stroke bg-bg px-7 py-3.5 font-medium text-text-primary transition-colors group-hover:border-transparent">
              Book a demo
            </span>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
