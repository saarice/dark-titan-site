import Logo from "../Logo";
import Section from "../Section";
import MetricCard from "../factory/MetricCard";
import ThroughputChart from "../factory/ThroughputChart";
import AgentStatus from "../factory/AgentStatus";
import ActivityList from "../factory/ActivityList";
import SystemHealth from "../factory/SystemHealth";
import { METRICS, NAV_ITEMS } from "../../lib/factoryData";

// Beat 7 (§5.6) — Infrastructure 3 of 5: Better UI for runtime control.
const POINTS = [
  {
    title: "Ticket-based",
    body: "Work is driven through a familiar ticket model — readable, assignable, trackable.",
  },
  {
    title: "Priorities, dependencies, releases",
    body: "First-class, built-in concepts — orchestrate complex delivery, not just isolated tasks.",
  },
  {
    title: "Continuous, budget-aware",
    body: "Works continuously — stopping and starting automatically within budget constraints.",
  },
];

export default function Factory() {
  return (
    <Section id="runtime" className="px-6 py-32 md:px-10" scrim>
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mb-12">
          <div className="max-w-2xl">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-violet">
              Infrastructure · 3 of 5
            </p>
            <h2 className="font-display text-h2 tracking-tight text-cloud">
              Better UI for runtime control
            </h2>
          </div>
          <div className="mt-10 grid gap-x-8 gap-y-6 md:grid-cols-3">
            {POINTS.map((p) => (
              <div key={p.title}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet shadow-[0_0_10px_2px_rgba(155,109,255,0.5)]" />
                  <h3 className="font-display text-base text-cloud">{p.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* product window — illustrative dashboard chrome (kept as-is) */}
        <div className="overflow-hidden rounded-2xl border border-steel bg-charcoal shadow-2xl">
          <div className="grid md:grid-cols-[200px_1fr]">
            {/* left rail */}
            <aside className="hidden flex-col border-r border-slate p-4 md:flex">
              <div className="mb-6 px-1">
                <Logo variant="lockup" />
              </div>
              <nav className="flex-1 space-y-1">
                {NAV_ITEMS.map((item, i) => (
                  <div
                    key={item}
                    className={`rounded-md px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] ${
                      i === 0 ? "bg-violet/15 text-violet" : "text-faint hover:text-muted"
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </nav>
              <div className="mt-6 flex items-center gap-2 border-t border-slate pt-4">
                <span className="h-2 w-2 animate-pulse-dot rounded-full bg-violet" />
                <div className="leading-tight">
                  <p className="font-body text-xs text-cloud">Alex Morgan</p>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-faint">Administrator</p>
                </div>
              </div>
            </aside>

            {/* main */}
            <div className="p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-lg text-cloud">Overview</h3>
                <span className="rounded-md border border-steel px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                  Last 24h
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {METRICS.map((m) => (
                  <MetricCard key={m.label} metric={m} />
                ))}
              </div>

              <div className="mt-3 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
                <ThroughputChart />
                <AgentStatus />
              </div>

              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <ActivityList />
                <SystemHealth />
              </div>
            </div>
          </div>
        </div>
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-faint">
          Sample data: illustrative dashboard
        </p>
      </div>
    </Section>
  );
}
