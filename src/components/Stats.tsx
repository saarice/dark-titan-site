import Tilt3D from "./Tilt3D";

const STATS = [
  { value: "{X}+", label: "Agents shipped" },
  { value: "{X}+", label: "Production deploys" },
  { value: "10+", label: "Yrs Develeap pedigree" },
];

export default function Stats() {
  return (
    <section className="bg-bg/50 py-16 backdrop-blur-xl md:py-24">
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-10 px-6 sm:grid-cols-3 md:px-10">
        {STATS.map((s) => (
          <Tilt3D key={s.label} className="text-center" rotate={18} depth={70} axis="x">
            <div className="font-display text-5xl font-extrabold tracking-tight text-text-primary md:text-7xl">
              {s.value}
            </div>
            <div className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-muted">
              {s.label}
            </div>
          </Tilt3D>
        ))}
      </div>
    </section>
  );
}
