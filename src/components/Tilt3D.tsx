import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

type Props = {
  children: ReactNode;
  className?: string;
  /** degrees of rotation at the top/bottom of the scroll range */
  rotate?: number;
  /** z-depth translation in px (element pushes back at the edges) */
  depth?: number;
  /** which axis to rotate around as you scroll */
  axis?: "x" | "y";
  /** fade the element near the edges of the viewport */
  fade?: boolean;
  /** perspective strength: lower = more dramatic 3D */
  perspective?: number;
};

/**
 * Scroll-driven 3D tilt wrapper.
 * As the element travels through the viewport its child rotates in 3D and
 * recedes in depth, producing the "scrolling deck" effect. Pure CSS transforms
 * driven by Framer Motion scroll progress, so it is GPU-cheap and works on mobile.
 */
export default function Tilt3D({
  children,
  className = "",
  rotate = 12,
  depth = 80,
  axis = "x",
  fade = true,
  perspective = 1000,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rot = useTransform(scrollYProgress, [0, 0.5, 1], [rotate, 0, -rotate]);
  const z = useTransform(scrollYProgress, [0, 0.5, 1], [-depth, 0, -depth]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    fade ? [0.35, 1, 1, 0.35] : [1, 1, 1, 1],
  );

  return (
    <div ref={ref} className={className} style={{ perspective }}>
      <motion.div
        style={{
          rotateX: axis === "x" ? rot : 0,
          rotateY: axis === "y" ? rot : 0,
          z,
          opacity,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
