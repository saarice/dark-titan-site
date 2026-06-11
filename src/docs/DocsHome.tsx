import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { DOCS_NAV } from "./manifest";
import fullLogo from "../assets/brand/darktitan-web.svg";

/**
 * The docs landing, one-to-one with the reference structure (OpenClaw docs):
 * h1 → big centred logo → quoted tagline → bold lead → muted lead → card grid
 * → the Introduction article below (rendered by DocsPage). Flat and digital:
 * hairline borders, geometric line icons, violet accents — no 3D art, no
 * gradients, no shadows. The lead copy is index.md's own tagline, split.
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

/**
 * The opener, ONE centred axis and CLEAN: the full stacked brand logo (crest +
 * wordmark) is the hero visual, "Documentation" names the page, one muted lead
 * (index.md's tagline, verbatim) — no quote block, no extra captions. The h1
 * stays for semantics, visually the logo carries it.
 */
export function DocsHomeHero() {
  return (
    <div className="pt-14 text-center">
      <h1 className="sr-only">DarkTitan Documentation</h1>

      <div className="flex justify-center">
        <img
          src={fullLogo}
          alt=""
          aria-hidden
          draggable={false}
          className="h-44 w-auto select-none md:h-52"
        />
      </div>
      <p aria-hidden className="mt-7 font-display text-2xl tracking-tight text-cloud md:text-3xl">
        Documentation
      </p>

      <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-muted">
        DarkTitan is an autonomous software pipeline tool. Write a YAML flow, point it at your
        codebase, and let Claude Code agents execute each stage — implement, review, test,
        refactor — without interruption.
      </p>
    </div>
  );
}

/** Reference-style cards, right under the hero: icon top-left, title, line. */
export function DocsHomeCards() {
  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-2">
      {DOCS_NAV.map((group) => {
        const first = group.items.find((it) => it.slug !== "") ?? group.items[0];
        return (
          <Link
            key={group.section}
            to={`/docs${first.slug ? `/${first.slug}` : ""}`}
            className="group rounded-xl border border-slate bg-charcoal/40 p-6 transition-colors hover:border-violet/60 hover:bg-charcoal/70"
          >
            {ICONS[group.section]}
            <h2 className="mt-4 font-display text-lg leading-tight text-cloud">
              {group.section}
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
              {DESCRIPTIONS[group.section]}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
