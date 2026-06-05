import SectionHeader from "./SectionHeader";
import CardVisual from "./CardVisual";
import Tilt3D from "./Tilt3D";

const ENTRIES = [
  { title: "What a looping agent actually is", read: "4 min read", date: "MAY 2026" },
  { title: "From backlog to shipped, lights off", read: "6 min read", date: "APR 2026" },
  { title: "Source-grounded answers, no hallucinations", read: "5 min read", date: "APR 2026" },
  { title: "Multi-tenant isolation by default", read: "7 min read", date: "MAR 2026" },
];

export default function Journal() {
  return (
    <section id="journal" className="bg-bg/60 py-16 backdrop-blur-2xl md:py-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <SectionHeader
          eyebrow="Field notes"
          title={
            <>
              Recent <span className="italic text-accent-hi">thinking</span>
            </>
          }
          subtext="Notes from the factory floor on agents, delivery, and production."
          cta="View all"
        />

        <div className="flex flex-col gap-4">
          {ENTRIES.map((e, i) => (
            <Tilt3D key={e.title} rotate={7} depth={50} axis="y">
            <a
              href="#"
              className="group flex items-center gap-6 rounded-[40px] border border-stroke bg-surface/30 p-4 transition-colors hover:bg-surface sm:rounded-full"
            >
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-3xl sm:rounded-full">
                <CardVisual variant={i + 1} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-lg font-semibold text-text-primary">
                  {e.title}
                </h3>
                <p className="font-mono text-xs uppercase tracking-wider text-muted">{e.read}</p>
              </div>
              <span className="hidden font-mono text-xs uppercase tracking-wider text-faint sm:block">
                {e.date}
              </span>
              <span className="pr-4 text-accent transition-transform group-hover:translate-x-1">→</span>
            </a>
            </Tilt3D>
          ))}
        </div>
      </div>
    </section>
  );
}
