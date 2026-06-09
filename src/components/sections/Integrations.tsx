import { motion } from "framer-motion";
import Section from "../Section";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/**
 * Beat 12 (v2) — Integration with external systems, as a scroll-built wiring
 * diagram (not a chip row). The systems you already run are endpoints that wire
 * themselves into a central DarkTitan hub: connectors draw in, each system snaps
 * to the hub, data pulses inward. Reduced-motion: fully wired diagram.
 */
const VIOLET = "#9B6DFF";
const LAVENDER = "#C57AFF";
const DIM = "#463a63";
const NODE_FILL = "#15131f";
const HUB = { x: 500, y: 250 };

const NODES = [
  { label: "SSO", sub: "identity", x: 168, y: 110 },
  { label: "Jira", sub: "issue tracking", x: 168, y: 392 },
  { label: "Code scanners", sub: "static analysis", x: 832, y: 110 },
  { label: "Env allocation", sub: "provisioning", x: 832, y: 392 },
  { label: "… and more", sub: "", x: 500, y: 70 },
];

export default function Integrations() {
  const r = useReducedMotion();
  const vp = { once: true, margin: "-15%" } as const;

  return (
    <Section id="integrations" className="px-6 py-32 md:px-10" scrim>
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="mb-10 max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-violet">
            External systems
          </p>
          <h2 className="font-display text-h2 tracking-tight text-cloud">
            Integration with external systems
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            DarkTitan operates inside your existing toolchain — authenticated, ticketed, scanned and
            provisioned through the systems your organization already trusts.
          </p>
        </div>

        <svg viewBox="0 0 1000 470" className="h-auto w-full" role="img" aria-label="External systems — SSO, Jira, code scanners, environment allocation and more — wiring into a central DarkTitan hub.">
          {/* connectors (drawn behind the nodes) */}
          {NODES.map((n, i) => (
            <motion.line
              key={`l-${n.label}`}
              x1={n.x}
              y1={n.y}
              x2={HUB.x}
              y2={HUB.y}
              stroke={DIM}
              strokeWidth={1.5}
              initial={{ pathLength: r ? 1 : 0, opacity: r ? 1 : 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={vp}
              transition={{ delay: r ? 0 : 0.2 + i * 0.12, duration: r ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}

          {/* data pulses flowing inward to the hub */}
          {!r &&
            NODES.map((n, i) => (
              <motion.circle
                key={`p-${n.label}`}
                r={3.5}
                fill={LAVENDER}
                style={{ filter: `drop-shadow(0 0 5px ${VIOLET})` }}
                initial={{ cx: n.x, cy: n.y, opacity: 0 }}
                animate={{ cx: [n.x, HUB.x], cy: [n.y, HUB.y], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeIn", delay: 1 + i * 0.3, repeatDelay: 1.2 }}
              />
            ))}

          {/* endpoint chips */}
          {NODES.map((n, i) => (
            <motion.g
              key={`n-${n.label}`}
              initial={{ opacity: r ? 1 : 0, scale: r ? 1 : 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={vp}
              transition={{ delay: r ? 0 : 0.3 + i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: `${n.x}px ${n.y}px` }}
            >
              <rect x={n.x - 88} y={n.y - 23} width={176} height={46} rx={10} fill={NODE_FILL} stroke={VIOLET} strokeWidth={1.4} />
              <text x={n.x} y={n.sub ? n.y - 2 : n.y + 5} fill="#F7F7F7" fontSize={14} fontFamily="monospace" textAnchor="middle">
                {n.label}
              </text>
              {n.sub && (
                <text x={n.x} y={n.y + 14} fill="#828294" fontSize={10} fontFamily="monospace" letterSpacing="1" textAnchor="middle">
                  {n.sub}
                </text>
              )}
            </motion.g>
          ))}

          {/* the hub (drawn on top) */}
          <motion.g
            initial={{ opacity: r ? 1 : 0, scale: r ? 1 : 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={vp}
            transition={{ delay: r ? 0 : 0.15, duration: 0.6 }}
            style={{ transformOrigin: `${HUB.x}px ${HUB.y}px` }}
          >
            {!r && (
              <motion.circle
                cx={HUB.x}
                cy={HUB.y}
                r={62}
                fill="none"
                stroke={VIOLET}
                strokeWidth={1}
                animate={{ opacity: [0.5, 0.12, 0.5], scale: [1, 1.08, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: `${HUB.x}px ${HUB.y}px` }}
              />
            )}
            <rect x={HUB.x - 78} y={HUB.y - 44} width={156} height={88} rx={14} fill={NODE_FILL} stroke={LAVENDER} strokeWidth={1.8} />
            <text x={HUB.x} y={HUB.y - 2} fill="#F7F7F7" fontSize={19} fontFamily="'Archivo Black', sans-serif" textAnchor="middle">
              DARKTITAN
            </text>
            <text x={HUB.x} y={HUB.y + 20} fill={VIOLET} fontSize={11} fontFamily="monospace" letterSpacing="2" textAnchor="middle">
              hub
            </text>
          </motion.g>
        </svg>
      </div>
    </Section>
  );
}
