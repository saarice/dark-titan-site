import Section from "../Section";
import { useCountUp } from "../../hooks/useCountUp";

function DaysReceipt() {
  const { ref, display } = useCountUp(3, { duration: 1100 });
  return (
    <span ref={ref} className="font-display text-6xl leading-none text-cloud md:text-7xl">
      ~{display}
    </span>
  );
}

function CostReceipt() {
  const { ref, display } = useCountUp(30, { duration: 1300 });
  return (
    <span ref={ref} className="font-display text-6xl leading-none text-cloud md:text-7xl">
      ${display}
    </span>
  );
}

const RECEIPTS = [
  { value: <DaysReceipt />, unit: "days", caption: "to rebuild this site end-to-end" },
  { value: <CostReceipt />, unit: "total", caption: "compute cost, start to finish" },
  {
    value: (
      <span className="font-display text-6xl leading-none text-cloud md:text-7xl">&lt;1</span>
    ),
    unit: "engineer-week",
    caption: "of human time spent",
  },
];

export default function Proof() {
  return (
    <Section id="proof" className="px-6 py-32 md:px-10" scrim>
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-16 max-w-2xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.35em] text-violet">
            No hype. Just results.
          </p>
          <h2 className="font-display text-4xl leading-[0.95] tracking-tight text-cloud md:text-6xl">
            Built for control, not demos.
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-steel bg-steel md:grid-cols-3">
          {RECEIPTS.map((r, i) => (
            <div key={i} className="bg-charcoal p-8">
              <div className="flex items-baseline gap-2">
                {r.value}
                <span className="font-mono text-xs uppercase tracking-[0.15em] text-violet">
                  {r.unit}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">{r.caption}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 max-w-xl text-base leading-relaxed text-muted">
          This site is its own proof. The factory built it, ran it, and shipped it, with a human
          in the loop only for taste and final say.
        </p>
      </div>
    </Section>
  );
}
