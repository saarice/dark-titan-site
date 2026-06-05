import Section from "../Section";
import Board from "../tempo/Board";

/**
 * Tempo — a ~10s auto-playing "build replay". A living kanban board streams
 * tickets Planned -> In Progress -> Done in fast-forward: delivery velocity
 * rendered as motion. The static Factory section shows the control surface;
 * this shows it shipping.
 */
export default function Tempo() {
  return (
    <Section id="tempo" className="px-6 py-32 md:px-10" scrim>
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-12 max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.35em] text-violet">Tempo</p>
          <h2 className="font-display text-4xl leading-[0.95] tracking-tight text-cloud md:text-6xl">
            Watch a quarter ship in ten seconds.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">
            Work moves on its own: planned, built, shipped. No standups, no
            dragging tickets by hand. This is what control at scale looks like in
            motion.
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
