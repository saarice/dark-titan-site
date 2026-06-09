/**
 * Docs catalog — mirrors the sidebar of the old docs site (darktitan.develeap.com),
 * plus the pages its stale-docs audit flagged as written-but-unlinked (import,
 * set, edit, rm, the TODO example). Content lives in src/content/docs/*.md,
 * copied verbatim from the old repo (develeap/darktitan-lp @ content/docs).
 *
 * Slug = route under #/docs/ and the md path under src/content/docs/
 * ("" = index.md, "cli/run" = cli/run.md).
 */
export type DocsNavItem = { label: string; slug: string };
export type DocsNavSection = { section: string; items: DocsNavItem[] };

export const DOCS_NAV: DocsNavSection[] = [
  {
    section: "Getting Started",
    items: [
      { label: "Introduction", slug: "" },
      { label: "Installation", slug: "getting-started" },
      { label: "Quick Start", slug: "quick-start" },
    ],
  },
  {
    section: "Core Concepts",
    items: [
      { label: "Projects", slug: "concepts/projects" },
      { label: "Flows", slug: "concepts/flows" },
      { label: "Stages", slug: "concepts/stages" },
      { label: "Gates & Loops", slug: "concepts/gates" },
      { label: "Agents", slug: "concepts/agents" },
    ],
  },
  {
    section: "CLI Reference",
    items: [
      { label: "Overview", slug: "cli" },
      { label: "darktitan init", slug: "cli/init" },
      { label: "darktitan new", slug: "cli/new" },
      { label: "darktitan import", slug: "cli/import" },
      { label: "darktitan run", slug: "cli/run" },
      { label: "darktitan set", slug: "cli/set" },
      { label: "darktitan ui", slug: "cli/ui" },
      { label: "darktitan status", slug: "cli/status" },
      { label: "darktitan logs", slug: "cli/logs" },
      { label: "darktitan edit", slug: "cli/edit" },
      { label: "darktitan rm", slug: "cli/rm" },
    ],
  },
  {
    section: "Flow YAML Reference",
    items: [
      { label: "Schema Overview", slug: "yaml" },
      { label: "Stages", slug: "yaml/stages" },
      { label: "Gates", slug: "yaml/gates" },
      { label: "Loops", slug: "yaml/loops" },
    ],
  },
  {
    section: "REST API",
    items: [
      { label: "Overview", slug: "api" },
      { label: "Flows", slug: "api/flows" },
      { label: "Projects", slug: "api/projects" },
      { label: "Stages", slug: "api/stages" },
    ],
  },
  {
    section: "Guides",
    items: [
      { label: "Your First Flow", slug: "guides/first-flow" },
      { label: "Multi-Stage Pipelines", slug: "guides/pipelines" },
      { label: "Gate Strategies", slug: "guides/gates" },
      { label: "Worker Mode", slug: "guides/worker-mode" },
    ],
  },
  {
    section: "Examples",
    items: [{ label: "TODO task file", slug: "examples/tasks" }],
  },
];

const flat = DOCS_NAV.flatMap((s) => s.items);

export function docTitle(slug: string): string | undefined {
  return flat.find((i) => i.slug === slug)?.label;
}

/** prev/next pager across the flattened sidebar order */
export function docNeighbors(slug: string): { prev?: DocsNavItem; next?: DocsNavItem } {
  const i = flat.findIndex((it) => it.slug === slug);
  if (i < 0) return {};
  return { prev: flat[i - 1], next: flat[i + 1] };
}
