import Section from "../Section";
import { useCountUp } from "../../hooks/useCountUp";

/**
 * Beat 15 (v2) — Self-build proof, as numeric monuments (archetype E), not a card
 * grid: one dominant figure + two supporting, then the site's own true line. The
 * factory built, ran and shipped this very site. Wording kept verbatim.
 */
function Dominant() {
  const { ref, display } = useCountUp(3, { duration: 1200 });
  return (
    <span ref={ref} className="font-display leading-[0.82] text-cloud text-glow-violet" style={{ fontSize: "clamp(5rem,18vw,13rem)" }}>
      ~{display}
    </span>
  );
}

function Cost() {
  const { ref, display } = useCountUp(30, { duration: 1300 });
  return (
    <span ref={ref} className="font-display text-5xl leading-none text-cloud md:text-6xl">
      ${display}
    </span>
  );
}

export default function Proof() {
  return (
    <Section id="proof" className="px-6 py-32 md:px-10" scrim>
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-14 max-w-2xl">
          <h2 className="font-display text-h2 tracking-tight text-cloud">
            Built for control, not demos.
          </h2>
        </div>

        <div className="flex flex-col gap-12 md:flex-row md:items-end md:gap-20">
          {/* the dominant monument */}
          <div>
            <Dominant />
            <p className="mt-3 max-w-[16rem] font-mono text-xs uppercase tracking-[0.18em] text-lavender">
              days to rebuild this site end-to-end
            </p>
          </div>

          {/* two supporting figures */}
          <div className="flex gap-12 md:gap-16 md:pb-4">
            <div>
              <Cost />
              <p className="mt-3 max-w-[12rem] font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
                total compute cost, start to finish
              </p>
            </div>
            <div>
              <span className="font-display text-5xl leading-none text-cloud md:text-6xl">&lt;1</span>
              <p className="mt-3 max-w-[12rem] font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
                engineer-week of human time
              </p>
            </div>
          </div>
        </div>

        <p className="mt-14 max-w-xl border-t border-slate pt-6 text-base leading-relaxed text-muted">
          This site is its own proof. The factory built it, ran it, and shipped it, with a human in
          the loop only for taste and final say.
        </p>
      </div>
    </Section>
  );
}
