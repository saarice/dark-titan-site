import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { DOCS_NAV } from "./manifest";

/**
 * The docs landing pieces — flat and digital: hairline borders, mono details,
 * geometric line icons, violet accents. No 3D illustrations, no gradients, no
 * shadows. The HERO opens the page (search lives in the header only); the
 * CARDS close it, standing in for the old "Quick links" section.
 */

const ICON_CLS = "h-6 w-6 text-violet";
const ICONS: Record<string, ReactNode> = {
  "Getting Started": (
    <svg viewBox="0 0 24 24" className={ICON_CLS} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M5 19 12 4l7 15" strokeLinejoin="round" />
      <path d="M8.5 13.5h7" />
    </svg>
  ),
  "Core Concepts": (
    <svg viewBox="0 0 24 24" className={ICON_CLS} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="4" y="4" width="7" height="7" />
      <rect x="13" y="13" width="7" height="7" />
      <path d="M11 7.5h4.5V13" />
    </svg>
  ),
  "CLI Reference": (
    <svg viewBox="0 0 24 24" className={ICON_CLS} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3.5" y="5" width="17" height="14" rx="1.5" />
      <path d="m7 10 2.5 2L7 14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 14.5H17" strokeLinecap="round" />
    </svg>
  ),
  "Flow YAML Reference": (
    <svg viewBox="0 0 24 24" className={ICON_CLS} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M8 4C6 4 6.5 7 5 8c1.5 1 1 4-1 4 2 0 1.5 3 3 4-1.5 1-1 4 1 4" strokeLinecap="round" />
      <path d="M16 4c2 0 1.5 3 3 4-1.5 1-1 4 1 4-2 0-1.5 3-3 4 1.5 1 1 4-1 4" strokeLinecap="round" />
    </svg>
  ),
  "REST API": (
    <svg viewBox="0 0 24 24" className={ICON_CLS} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="6" cy="12" r="2.2" />
      <circle cx="18" cy="6" r="2.2" />
      <circle cx="18" cy="18" r="2.2" />
      <path d="M8 11 15.8 6.8M8 13l7.8 4.2" />
    </svg>
  ),
  Guides: (
    <svg viewBox="0 0 24 24" className={ICON_CLS} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 5.5C10 4 7 4 4.5 5v13.5C7 17.5 10 17.5 12 19c2-1.5 5-1.5 7.5 0V5C17 4 14 4 12 5.5Z" strokeLinejoin="round" />
      <path d="M12 5.5V19" />
    </svg>
  ),
  Examples: (
    <svg viewBox="0 0 24 24" className={ICON_CLS} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="m9 7-5 5 5 5M15 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const DESCRIPTIONS: Record<string, string> = {
  "Getting Started": "Install DarkTitan, onboard your project and run the first autonomous flow.",
  "Core Concepts": "Projects, flows, stages, gates and agents — the mental model behind the engine.",
  "CLI Reference": "Every darktitan command: init, new, run, status, logs and the rest.",
  "Flow YAML Reference": "The flow.yaml schema — stages, gates and loops, field by field.",
  "REST API": "Drive flows, projects and stages programmatically over HTTP.",
  Guides: "Hands-on walkthroughs: your first flow, pipelines, gate strategies, worker mode.",
  Examples: "Ready-made task definitions to copy from.",
};

// quick links under the grid — the pages people actually land on first
const POPULAR: { label: string; slug: string }[] = [
  { label: "Quick Start", slug: "quick-start" },
  { label: "darktitan run", slug: "cli/run" },
  { label: "Your First Flow", slug: "guides/first-flow" },
  { label: "flow.yaml schema", slug: "yaml" },
];

/** The home opener: eyebrow, title, one-line promise. Search is in the header. */
export function DocsHomeHero() {
  return (
    <div className="pt-12">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-violet">
        DarkTitan · Docs
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-cloud md:text-5xl">
        Documentation
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
        Everything you need to run governed, autonomous engineering — install, define flows,
        govern agents, ship.
      </p>
    </div>
  );
}

/** The home closer: section cards (the old md "Quick links", done properly). */
export function DocsHomeCards() {
  return (
    <div className="mt-16 border-t border-slate pt-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-faint">
        Browse the docs
      </p>

      {/* section cards — flat, digital, hairline-bordered */}
      <div className="mt-5 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
        {DOCS_NAV.map((group, gi) => {
          const first = group.items.find((it) => it.slug !== "") ?? group.items[0];
          return (
            <Link
              key={group.section}
              to={`/docs${first.slug ? `/${first.slug}` : ""}`}
              className="group flex flex-col rounded-xl border border-steel bg-charcoal/50 p-5 transition-colors hover:border-violet/60 hover:bg-charcoal/80"
            >
              <div className="flex items-center justify-between">
                {ICONS[group.section]}
                <span className="font-mono text-[10px] tracking-[0.2em] text-faint">
                  {String(gi + 1).padStart(2, "0")}
                </span>
              </div>
              <h2 className="mt-4 font-display text-lg leading-tight text-cloud">
                {group.section}
              </h2>
              <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-muted">
                {DESCRIPTIONS[group.section]}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-slate pt-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                  {group.items.length} {group.items.length === 1 ? "page" : "pages"}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-violet">
                  Open
                  <span className="ml-1 inline-block transition-transform duration-200 group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* popular shortcuts */}
      <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-slate pt-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-faint">
          Popular
        </span>
        {POPULAR.map((p) => (
          <Link
            key={p.slug}
            to={`/docs/${p.slug}`}
            className="rounded-full border border-steel px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-violet/60 hover:text-cloud"
          >
            {p.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
