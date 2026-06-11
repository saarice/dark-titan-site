import { DOCS_NAV } from "./manifest";

/**
 * Client-side full-text search over the 32 docs pages. The raw markdown is
 * loaded lazily (first focus on the search box), indexed once per session, and
 * scored with title > heading > body weighting, AND-semantics across terms,
 * heading deep-links and snippet extraction. No external deps — 32 small docs
 * don't need a search engine, they need good ranking.
 */

export type DocHeading = { text: string; id: string; level: 2 | 3 };

export type DocEntry = {
  slug: string;
  title: string;
  section: string;
  headings: DocHeading[];
  body: string; // plain text, original case (for snippets)
  bodyLower: string;
  titleLower: string;
};

export type SearchHit = {
  slug: string;
  title: string;
  section: string;
  score: number;
  /** best matching heading — used as a deep link (#id) */
  heading?: DocHeading;
  snippet?: string;
};

const PAGES = import.meta.glob("../content/docs/**/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

export function loaderFor(slug: string): (() => Promise<string>) | undefined {
  const key = `../content/docs/${slug === "" ? "index" : slug}.md`;
  return PAGES[key] ?? PAGES[`../content/docs/${slug}/index.md`];
}

/** Same slug for extracted headings and the rendered h2/h3 ids — keep in sync. */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** plain text of an inline-markdown fragment */
function plainInline(md: string): string {
  return md
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .trim();
}

export function extractHeadings(md: string): DocHeading[] {
  const noCode = md.replace(/```[\s\S]*?```/g, "");
  const out: DocHeading[] = [];
  for (const m of noCode.matchAll(/^(##|###)\s+(.+)$/gm)) {
    const text = plainInline(m[2]);
    if (text) out.push({ text, id: slugifyHeading(text), level: m[1] === "##" ? 2 : 3 });
  }
  return out;
}

function stripMd(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^#{1,6}\s+/gm, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_>|~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

let indexPromise: Promise<DocEntry[]> | null = null;

/** Build (once) and cache the index — all pages fetched in parallel. */
export function buildSearchIndex(): Promise<DocEntry[]> {
  if (!indexPromise) {
    indexPromise = Promise.all(
      DOCS_NAV.flatMap((g) =>
        g.items.map(async (it): Promise<DocEntry> => {
          const raw = (await loaderFor(it.slug)?.()) ?? "";
          const body = stripMd(raw);
          return {
            slug: it.slug,
            title: it.label,
            section: g.section,
            headings: extractHeadings(raw),
            body,
            bodyLower: body.toLowerCase(),
            titleLower: it.label.toLowerCase(),
          };
        }),
      ),
    );
  }
  return indexPromise;
}

function countOccurrences(haystack: string, needle: string): number {
  let n = 0;
  let i = haystack.indexOf(needle);
  while (i !== -1 && n < 12) {
    n++;
    i = haystack.indexOf(needle, i + needle.length);
  }
  return n;
}

export function searchDocs(index: DocEntry[], query: string, limit = 10): SearchHit[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const hits: SearchHit[] = [];
  for (const e of index) {
    let score = 0;
    let allMatch = true;
    let bestHeading: DocHeading | undefined;
    let bestHeadingTerms = 0;

    for (const term of terms) {
      let termScore = 0;
      if (e.titleLower.startsWith(term)) termScore += 60;
      else if (e.titleLower.includes(term)) termScore += 40;
      const bodyCount = countOccurrences(e.bodyLower, term);
      if (bodyCount > 0) termScore += Math.min(bodyCount, 5) * 4;
      let headingMatched = false;
      for (const h of e.headings) {
        if (h.text.toLowerCase().includes(term)) {
          headingMatched = true;
          // prefer the heading matching the most terms (computed per-heading below)
        }
      }
      if (headingMatched) termScore += 22;
      if (termScore === 0) {
        allMatch = false;
        break;
      }
      score += termScore;
    }
    if (!allMatch) continue;

    // deep-link target: the heading matching the most query terms
    for (const h of e.headings) {
      const hl = h.text.toLowerCase();
      const matched = terms.filter((t) => hl.includes(t)).length;
      if (matched > bestHeadingTerms) {
        bestHeadingTerms = matched;
        bestHeading = h;
      }
    }

    // snippet around the first body occurrence of the first matching term
    let snippet: string | undefined;
    for (const term of terms) {
      const at = e.bodyLower.indexOf(term);
      if (at !== -1) {
        const from = Math.max(0, at - 60);
        const to = Math.min(e.body.length, at + term.length + 80);
        snippet = `${from > 0 ? "…" : ""}${e.body.slice(from, to).trim()}${to < e.body.length ? "…" : ""}`;
        break;
      }
    }

    hits.push({
      slug: e.slug,
      title: e.title,
      section: e.section,
      score,
      heading: bestHeadingTerms > 0 ? bestHeading : undefined,
      snippet,
    });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
