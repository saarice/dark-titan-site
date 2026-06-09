import Section from "../Section";
import Board from "../tempo/Board";

/**
 * Tempo — an endless auto-playing "build replay". A living kanban board streams
 * tickets Planned -> In Progress -> Done forever: delivery velocity rendered as
 * motion. The static Factory section shows the control surface; this shows it
 * shipping. Everything is derived from a single clock, so there is no loop seam.
 */
export default function Tempo() {
  return (
    <Section id="tempo" className="px-6 py-32 md:px-10" scrim>
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-12 max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.35em] text-violet">
            Build replay
          </p>
          <h2 className="font-display text-4xl leading-[0.95] tracking-tight text-cloud md:text-6xl">
            Watch the work ship itself.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">
            The same runtime board, replayed: tickets move planned → in progress → done on their
            own, continuously and budget-aware.
          </p>
        </div>

        <Board />

        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-faint">
          Sample data: illustrative build replay
        </p>
      </div>
    </Section>
  );
}
