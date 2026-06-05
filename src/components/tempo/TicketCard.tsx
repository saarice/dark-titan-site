import { motion } from "framer-motion";
import { TAG_TOKEN, TAG_LABEL, type Ticket } from "../../lib/tempoData";

export const CARD_H = 74;
export const ROW_GAP = 12;
export const ROW = CARD_H + ROW_GAP;

const GLIDE = { duration: 0.72, ease: [0.22, 1, 0.36, 1] as const };
const SNAP = { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };

/**
 * A single kanban ticket, absolutely positioned within the board field.
 * The board feeds it a target (x, y, width); when `moving` is true the card
 * lifts — scales up, tilts, and casts a violet shadow — then settles. No
 * cursor: the drag-and-drop feel is entirely automated.
 */
export default function TicketCard({
  ticket,
  x,
  y,
  width,
  moving,
  done,
}: {
  ticket: Ticket;
  x: number;
  y: number;
  width: number;
  moving: boolean;
  done: boolean;
}) {
  const token = TAG_TOKEN[ticket.tag];

  return (
    <motion.div
      className="absolute left-0 top-0 select-none rounded-xl border bg-charcoal/95 p-3.5 backdrop-blur-sm"
      style={{
        width,
        height: CARD_H,
        borderColor: moving ? `rgb(var(--lavender) / 0.7)` : `rgb(var(--steel))`,
        zIndex: moving ? 60 : 1,
      }}
      initial={false}
      animate={{
        x,
        y,
        scale: moving ? 1.045 : 1,
        rotate: moving ? -2.4 : 0,
        boxShadow: moving
          ? "0 22px 48px -12px rgba(138,86,247,0.55), 0 0 0 1px rgba(179,56,255,0.35)"
          : "0 1px 0 0 rgba(0,0,0,0.4)",
      }}
      transition={{ x: GLIDE, y: GLIDE, scale: SNAP, rotate: SNAP, boxShadow: SNAP }}
    >
      <div className="flex items-center justify-between">
        <span
          className="rounded-md px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide"
          style={{ background: `rgb(var(--steel))`, color: `rgb(var(--fg-muted))` }}
        >
          {ticket.code}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="font-mono text-[9px] uppercase tracking-[0.12em]"
            style={{ color: `rgb(var(${token}))` }}
          >
            {TAG_LABEL[ticket.tag]}
          </span>
          <span className="h-2 w-2 rounded-full" style={{ background: `rgb(var(${token}))` }} />
        </span>
      </div>
      <p className="mt-1.5 truncate font-body text-[13px] leading-tight text-cloud">
        {ticket.title}
      </p>
      {/* a thin tag-colored progress sliver; full + check once shipped */}
      <div className="mt-2 flex items-center gap-2">
        <span className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-slate">
          <span
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: done ? "100%" : "45%", background: `rgb(var(${token}))` }}
          />
        </span>
        {done && (
          <span className="font-mono text-[10px]" style={{ color: `rgb(var(--sig-green))` }}>
            ✓
          </span>
        )}
      </div>
    </motion.div>
  );
}
