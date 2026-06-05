import SectionHeader from "./SectionHeader";
import CardVisual from "./CardVisual";
import Tilt3D from "./Tilt3D";

const CARDS = [
  { title: "Agentic Apps", span: "md:col-span-7", ratio: "aspect-[16/10]", img: "/works-1.png" },
  { title: "Operational Intelligence", span: "md:col-span-5", ratio: "aspect-[16/10]", img: "/works-2.png" },
  { title: "DevOps Automation", span: "md:col-span-5", ratio: "aspect-[16/10]", img: "/works-3.png" },
  { title: "Custom Agents", span: "md:col-span-7", ratio: "aspect-[16/10]", img: "" },
];

export default function Works() {
  return (
    <section id="work" className="bg-bg/60 py-12 backdrop-blur-2xl md:py-16">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <SectionHeader
          eyebrow="What we ship"
          title={
            <>
              Built by <span className="italic text-accent-hi">agents</span>
            </>
          }
          subtext="From a vision to a running system, assembled by the factory."
          cta="View all work"
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
          {CARDS.map((card, i) => (
            <Tilt3D
              key={card.title}
              className={card.span}
              rotate={11}
              depth={110}
              axis="x"
            >
            <article
              className={`group relative overflow-hidden rounded-3xl border border-stroke bg-surface ${card.ratio}`}
            >
              {card.img ? (
                <img
                  src={card.img}
                  alt={card.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <CardVisual variant={i} className="transition-transform duration-700 group-hover:scale-105" />
              )}

              {/* hover veil */}
              <div className="absolute inset-0 flex items-center justify-center bg-bg/70 opacity-0 backdrop-blur-lg transition-opacity duration-300 group-hover:opacity-100">
                <span className="group relative inline-flex rounded-full text-sm">
                  <span className="gradient-border-animated absolute -inset-[2px] rounded-full" />
                  <span className="relative rounded-full bg-text-primary px-5 py-2.5 font-medium text-bg">
                    View — <span className="font-display italic">{card.title}</span>
                  </span>
                </span>
              </div>

              {/* resting label */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-bg/90 to-transparent p-5 transition-opacity group-hover:opacity-0">
                <span className="font-display text-lg font-semibold text-text-primary">{card.title}</span>
                <span className="font-mono text-xs text-muted">0{i + 1}</span>
              </div>
            </article>
            </Tilt3D>
          ))}
        </div>
      </div>
    </section>
  );
}
