import { motion } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/**
 * Visualization for the Pillar I sub-line: "agent pipelines versioned in git,
 * executed deterministically, governed by hard limits, and scaled across
 * Kubernetes." One schematic maps each claim:
 *   · a git commit graph feeding the pipeline      → versioned in git
 *   · a run that sweeps the same path every cycle   → deterministic
 *   · a hard-limit ceiling the runs never cross     → governed by hard limits
 *   · the pipeline replicated across stacked rows   → scaled on Kubernetes
 */

// design tokens (mirror src/index.css)
const VIOLET = "#9B6DFF";
const LAVENDER = "#C57AFF";
const AMBER = "#FFB100";
const DIM = "#463a63"; // muted violet line
const NODE_STROKE = "#4a3f6b";
const NODE_FILL = "#15131f";
const MUTED = "#A6A6B4";
const FAINT = "#828294";

const STAGES = ["PLAN", "BUILD", "TEST", "SHIP"];
const NODE_X = [340, 520, 700, 880];
const ROW_X0 = 300;
const ROW_X1 = 912;
const DASH_PERIOD = ROW_X1 - ROW_X0 + 70; // segment(70) + gap = seamless loop period

// lead row first, then two dimmer replicas (the cluster)
const ROWS = [
  { y: 92, lead: true, delay: 0 },
  { y: 150, lead: false, delay: 0.7 },
  { y: 208, lead: false, delay: 1.4 },
];

export default function EngineDiagram() {
  const reduced = useReducedMotion();

  return (
    <div className="rounded-2xl border border-steel bg-charcoal/30 p-4 backdrop-blur-sm sm:p-6">
      <svg
        viewBox="0 0 1040 280"
        className="h-auto w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="An agent pipeline sourced from a git commit graph, running deterministically beneath a hard-limit ceiling, replicated across a Kubernetes cluster."
      >
        {/* ── hard-limit ceiling ───────────────────────────────── */}
        <line x1={300} y1={46} x2={912} y2={46} stroke={AMBER} strokeWidth={1.5} strokeDasharray="6 6" opacity={0.6} />
        <line x1={300} y1={40} x2={300} y2={52} stroke={AMBER} strokeWidth={1.5} opacity={0.7} />
        <line x1={912} y1={40} x2={912} y2={52} stroke={AMBER} strokeWidth={1.5} opacity={0.7} />
        <text x={300} y={34} fill={AMBER} fontSize={11} fontFamily="monospace" letterSpacing="2" opacity={0.85}>
          HARD LIMITS
        </text>

        {/* ── git commit graph (versioned in git) ──────────────── */}
        <line x1={100} y1={78} x2={100} y2={236} stroke={DIM} strokeWidth={2} />
        {/* a branch off the trunk and back */}
        <path d="M100 150 C 130 150 158 144 158 121" stroke={DIM} strokeWidth={2} fill="none" />
        <path d="M158 121 C 158 104 130 92 100 92" stroke={DIM} strokeWidth={2} fill="none" />
        {[92, 150, 208].map((cy) => (
          <circle key={cy} cx={100} cy={cy} r={6} fill={NODE_FILL} stroke={VIOLET} strokeWidth={1.6} />
        ))}
        <circle cx={158} cy={121} r={5} fill={NODE_FILL} stroke={VIOLET} strokeWidth={1.6} />
        {/* commit pulse travelling down the trunk */}
        {!reduced && (
          <motion.circle
            cx={100}
            r={4}
            fill={LAVENDER}
            style={{ filter: `drop-shadow(0 0 5px ${VIOLET})` }}
            initial={{ cy: 78, opacity: 0 }}
            animate={{ cy: [78, 236], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.6, ease: "linear", repeat: Infinity, repeatDelay: 0.4 }}
          />
        )}
        <text x={100} y={256} fill={FAINT} fontSize={11} fontFamily="monospace" letterSpacing="1.5" textAnchor="middle">
          GIT · main
        </text>

        {/* feed: git → the cluster of pipelines */}
        <path d="M100 150 H 286" stroke={DIM} strokeWidth={2} fill="none" />
        <circle cx={286} cy={150} r={3.5} fill={NODE_FILL} stroke={VIOLET} strokeWidth={1.4} />
        <path d="M286 150 C 294 150 300 118 300 92" stroke={DIM} strokeWidth={2} fill="none" />
        <path d="M286 150 H 300" stroke={DIM} strokeWidth={2} fill="none" />
        <path d="M286 150 C 294 150 300 182 300 208" stroke={DIM} strokeWidth={2} fill="none" />

        {/* ── kubernetes bracket (scaled on K8s) ───────────────── */}
        <path d="M922 84 H934 V216 H922" stroke={DIM} strokeWidth={1.5} fill="none" />
        <text x={944} y={146} fill={FAINT} fontSize={11} fontFamily="monospace" letterSpacing="1.5">
          K8S
        </text>
        <text x={944} y={162} fill={VIOLET} fontSize={11} fontFamily="monospace" letterSpacing="1.5">
          × N
        </text>

        {/* ── pipeline rows ────────────────────────────────────── */}
        {ROWS.map((row) => {
          const cometColor = row.lead ? LAVENDER : VIOLET;
          return (
            <g key={row.y} opacity={row.lead ? 1 : 0.5}>
              {/* base rail */}
              <line x1={ROW_X0} y1={row.y} x2={ROW_X1} y2={row.y} stroke={DIM} strokeWidth={2} />
              {/* travelling run pulse — identical sweep every cycle */}
              {!reduced && (
                <motion.path
                  d={`M${ROW_X0} ${row.y} H${ROW_X1}`}
                  stroke={cometColor}
                  strokeWidth={3}
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={`70 ${ROW_X1 - ROW_X0}`}
                  style={{ filter: `drop-shadow(0 0 4px ${cometColor})` }}
                  initial={{ strokeDashoffset: DASH_PERIOD }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 2.2, ease: "linear", repeat: Infinity, delay: row.delay }}
                />
              )}
              {/* stage nodes */}
              {NODE_X.map((cx, i) => (
                <g key={cx}>
                  <rect
                    x={cx - 32}
                    y={row.y - 15}
                    width={64}
                    height={30}
                    rx={7}
                    fill={NODE_FILL}
                    stroke={row.lead ? VIOLET : NODE_STROKE}
                    strokeWidth={1.5}
                  />
                  {/* glow that lights as the run passes (lead row only) */}
                  {row.lead && !reduced && (
                    <motion.rect
                      x={cx - 32}
                      y={row.y - 15}
                      width={64}
                      height={30}
                      rx={7}
                      fill={VIOLET}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.5, 0] }}
                      transition={{ duration: 0.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.6, delay: 0.15 + i * 0.5 }}
                    />
                  )}
                  {row.lead && (
                    <text
                      x={cx}
                      y={row.y + 1}
                      fill="#F7F7F7"
                      fontSize={10.5}
                      fontFamily="monospace"
                      letterSpacing="1"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {STAGES[i]}
                    </text>
                  )}
                </g>
              ))}
            </g>
          );
        })}

        {/* supporting caption — names the one property the motion can't fully show */}
        <text x={606} y={266} fill={MUTED} fontSize={11} fontFamily="monospace" letterSpacing="1" textAnchor="middle">
          Same versioned pipeline — deterministic on every run.
        </text>
      </svg>
    </div>
  );
}
