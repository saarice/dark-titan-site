import { motion } from "framer-motion";
import Section from "../Section";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/**
 * Beat 9 (v2) — One instance, the whole team, as a scroll-built system diagram.
 * Developer nodes wire into one shared DarkTitan instance (full redundancy), and
 * a memory core accumulates layer by layer (gets smarter every run). The two
 * ideas are diagram labels + annotations, not cards. Reduced-motion: assembled.
 */
const VIOLET = "#9B6DFF";
const LAVENDER = "#C57AFF";
const DIM = "#463a63";
const NODE_FILL = "#15131f";

const DEV_Y = [70, 145, 220, 295, 370];
const MEM_LAYERS = 6;

export default function OneInstance() {
  const r = useReducedMotion();
  const vp = { once: true, margin: "-15%" } as const;

  return (
    <Section id="team" className="px-6 py-32 md:px-10" scrim>
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="mb-12 max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-violet">
            Shared instance
          </p>
          <h2 className="font-display text-h2 tracking-tight text-cloud">
            One instance, the whole team
          </h2>
        </div>

        <svg viewBox="0 0 1000 440" className="h-auto w-full" role="img" aria-label="Several developer nodes wiring into one shared DarkTitan instance, which feeds an accumulating project-memory core.">
          {/* dev → hub connections (full redundancy) */}
          {DEV_Y.map((y, i) => (
            <motion.path
              key={y}
              d={`M118 ${y} C 250 ${y}, 300 220, 418 220`}
              stroke={DIM}
              strokeWidth={1.5}
              fill="none"
              initial={{ pathLength: r ? 1 : 0, opacity: r ? 1 : 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={vp}
              transition={{ delay: r ? 0 : i * 0.12, duration: r ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}

          {/* developer nodes */}
          {DEV_Y.map((y, i) => (
            <motion.g
              key={`dev-${y}`}
              initial={{ opacity: r ? 1 : 0 }}
              whileInView={{ opacity: 1 }}
              viewport={vp}
              transition={{ delay: r ? 0 : i * 0.12, duration: 0.5 }}
            >
              <circle cx={100} cy={y} r={15} fill={NODE_FILL} stroke={VIOLET} strokeWidth={1.6} />
              <circle cx={100} cy={y - 3} r={4} fill={VIOLET} />
              <path d={`M92 ${y + 7} a8 8 0 0 1 16 0`} fill={VIOLET} />
            </motion.g>
          ))}
          <text x={100} y={36} fill="#828294" fontSize={11} fontFamily="monospace" letterSpacing="2" textAnchor="middle">
            YOUR TEAM
          </text>

          {/* the shared instance hub */}
          <motion.g
            initial={{ opacity: r ? 1 : 0, scale: r ? 1 : 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={vp}
            transition={{ delay: r ? 0 : 0.4, duration: 0.6 }}
            style={{ transformOrigin: "500px 220px" }}
          >
            {!r && (
              <motion.rect
                x={408} y={166} width={184} height={108} rx={18}
                fill="none" stroke={VIOLET} strokeWidth={1}
                animate={{ opacity: [0.5, 0.15, 0.5], scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "500px 220px" }}
              />
            )}
            <rect x={420} y={172} width={160} height={96} rx={14} fill={NODE_FILL} stroke={LAVENDER} strokeWidth={1.6} />
            <text x={500} y={214} fill="#F7F7F7" fontSize={20} fontFamily="'Archivo Black', sans-serif" textAnchor="middle">
              DARKTITAN
            </text>
            <text x={500} y={236} fill={VIOLET} fontSize={11} fontFamily="monospace" letterSpacing="2" textAnchor="middle">
              one instance
            </text>
          </motion.g>

          {/* hub → memory feed */}
          <line x1={580} y1={220} x2={798} y2={220} stroke={DIM} strokeWidth={1.5} />
          {!r && (
            <motion.circle
              cy={220} r={4} fill={LAVENDER}
              style={{ filter: `drop-shadow(0 0 5px ${VIOLET})` }}
              initial={{ cx: 580, opacity: 0 }}
              animate={{ cx: [580, 798], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "linear", repeatDelay: 0.4 }}
            />
          )}

          {/* accumulating memory core (long-term project memory) */}
          {Array.from({ length: MEM_LAYERS }).map((_, i) => (
            <motion.rect
              key={i}
              x={800}
              y={280 - i * 19}
              width={114}
              height={13}
              rx={3}
              fill={VIOLET}
              fillOpacity={0.28 + i * 0.12}
              initial={{ opacity: r ? 1 : 0, scaleY: r ? 1 : 0 }}
              whileInView={{ opacity: 1, scaleY: 1 }}
              viewport={vp}
              transition={{ delay: r ? 0 : 0.6 + i * 0.13, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: `857px ${287 - i * 19}px` }}
            />
          ))}
          <text x={857} y={150} fill="#A6A6B4" fontSize={11} fontFamily="monospace" letterSpacing="2" textAnchor="middle">
            PROJECT MEMORY
          </text>
          <text x={857} y={312} fill="#828294" fontSize={10.5} fontFamily="monospace" letterSpacing="1" textAnchor="middle">
            + smarter every run
          </text>
        </svg>

        {/* the two ideas, as diagram annotations */}
        <div className="mt-10 grid gap-8 border-t border-slate pt-6 md:grid-cols-2">
          <div>
            <h3 className="font-display text-base text-cloud">Full redundancy</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Several team members share the same DarkTitan instance — every developer can support
              any ticket. No single point of failure, no siloed context.
            </p>
          </div>
          <div>
            <h3 className="font-display text-base text-cloud">Long-term project memory</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Persistent, project-based memory that accumulates over time — the instance gets
              smarter about your codebase with every run.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
