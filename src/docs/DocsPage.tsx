import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Logo from "../components/Logo";
import { DOCS_NAV, docNeighbors, docTitle } from "./manifest";

/**
 * The product docs (#/docs/...), carried over from the old docs site
 * (darktitan.develeap.com) and restyled to the landing page's brand: same
 * palette, Archivo Black headings, Plex body/mono. Deliberately NO 3D scene —
 * docs are for reading. Content is lazy-loaded per page from src/content/docs.
 */
const PAGES = import.meta.glob("../content/docs/**/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

function loaderFor(slug: string): (() => Promise<string>) | undefined {
  const key = `../content/docs/${slug === "" ? "index" : slug}.md`;
  return PAGES[key] ?? PAGES[`../content/docs/${slug}/index.md`];
}

export default function DocsPage() {
  const slug = (useParams()["*"] ?? "").replace(/\/+$/, "");
  const [md, setMd] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const load = loaderFor(slug);
    setMd(null);
    setMissing(!load);
    setMenuOpen(false);
    window.scrollTo(0, 0);
    document.title = `${docTitle(slug) ?? "Docs"} · DarkTitan Docs`;
    load?.().then(setMd);
  }, [slug]);

  const { prev, next } = docNeighbors(slug);

  return (
    <div className="min-h-screen bg-obsidian font-body text-cloud">
      {/* slim docs header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate bg-charcoal/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <Link to="/" aria-label="Dark Titan home" className="block">
              <Logo variant="lockup" className="h-5" />
            </Link>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-violet sm:inline">
              docs
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="font-mono text-xs uppercase tracking-[0.15em] text-muted transition-colors hover:text-cloud"
            >
              ← Site
            </Link>
            <button
              type="button"
              className="rounded-md border border-steel px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-cloud lg:hidden"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-10 px-5 pt-20 md:px-8">
        {/* sidebar — fixed column on desktop, slide-down panel on mobile */}
        <aside
          className={`${
            menuOpen ? "block" : "hidden"
          } fixed inset-x-0 top-[57px] z-40 max-h-[calc(100vh-57px)] overflow-y-auto border-b border-slate bg-charcoal/95 px-5 pb-8 backdrop-blur-xl lg:static lg:z-auto lg:block lg:max-h-none lg:w-60 lg:flex-none lg:overflow-visible lg:border-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:backdrop-blur-0`}
        >
          <nav aria-label="Docs sections" className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pb-10 lg:pr-2">
            {DOCS_NAV.map((group) => (
              <div key={group.section} className="pt-6">
                <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-faint">
                  {group.section}
                </p>
                <ul className="space-y-0.5 border-l border-slate">
                  {group.items.map((it) => {
                    const active = it.slug === slug;
                    return (
                      <li key={it.slug}>
                        <Link
                          to={`/docs${it.slug ? `/${it.slug}` : ""}`}
                          aria-current={active ? "page" : undefined}
                          className={`-ml-px block border-l py-1.5 pl-4 text-[13.5px] leading-snug transition-colors ${
                            active
                              ? "border-violet font-medium text-lavender"
                              : "border-transparent text-muted hover:border-steel hover:text-cloud"
                          }`}
                        >
                          {it.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* content */}
        <main className="min-w-0 flex-1 pb-24">
          {missing ? (
            <div className="pt-16">
              <h1 className="font-display text-h3 text-cloud">Page not found</h1>
              <p className="mt-4 text-muted">
                No doc at <code className="font-mono text-lavender">/{slug}</code>.
              </p>
              <Link to="/docs" className="mt-6 inline-block text-lavender underline underline-offset-4">
                Back to docs home
              </Link>
            </div>
          ) : md === null ? (
            <p className="pt-16 font-mono text-xs uppercase tracking-[0.2em] text-faint">Loading…</p>
          ) : (
            <article className="docs-prose max-w-3xl pt-10">
              <Markdown md={md} />
            </article>
          )}

          {/* pager */}
          {!missing && (prev || next) && (
            <nav aria-label="Docs pager" className="mt-16 flex max-w-3xl justify-between gap-4 border-t border-slate pt-6">
              {prev ? (
                <Link to={`/docs${prev.slug ? `/${prev.slug}` : ""}`} className="group text-sm text-muted transition-colors hover:text-cloud">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">← Previous</span>
                  <span className="mt-1 block text-lavender group-hover:underline">{prev.label}</span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link to={`/docs/${next.slug}`} className="group text-right text-sm text-muted transition-colors hover:text-cloud">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Next →</span>
                  <span className="mt-1 block text-lavender group-hover:underline">{next.label}</span>
                </Link>
              )}
            </nav>
          )}
        </main>
      </div>
    </div>
  );
}

/** Markdown → brand-styled elements. Internal /docs links stay in the router. */
function Markdown({ md }: { md: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: (p) => <h1 className="font-display text-h3 leading-tight tracking-tight text-cloud md:text-[2.5rem]" {...p} />,
        h2: (p) => <h2 className="mt-12 border-b border-slate pb-2 font-display text-xl tracking-tight text-cloud md:text-2xl" {...p} />,
        h3: (p) => <h3 className="mt-8 font-display text-base text-cloud md:text-lg" {...p} />,
        p: (p) => <p className="mt-4 leading-relaxed text-muted" {...p} />,
        ul: (p) => <ul className="mt-4 list-disc space-y-1.5 pl-6 leading-relaxed text-muted marker:text-violet" {...p} />,
        ol: (p) => <ol className="mt-4 list-decimal space-y-1.5 pl-6 leading-relaxed text-muted marker:text-violet" {...p} />,
        blockquote: (p) => (
          <blockquote className="mt-4 rounded-r-lg border-l-2 border-violet bg-violet/5 px-4 py-2 text-muted [&>p]:mt-0" {...p} />
        ),
        hr: () => <hr className="mt-8 border-slate" />,
        table: (p) => (
          <div className="mt-5 overflow-x-auto rounded-xl border border-slate">
            <table className="w-full border-collapse text-sm" {...p} />
          </div>
        ),
        thead: (p) => <thead className="bg-charcoal/80 text-left font-mono text-[11px] uppercase tracking-[0.12em] text-lavender" {...p} />,
        th: (p) => <th className="px-4 py-2.5 font-medium" {...p} />,
        td: (p) => <td className="border-t border-slate/70 px-4 py-2.5 align-top leading-relaxed text-muted" {...p} />,
        pre: (p) => (
          <pre className="mt-5 overflow-x-auto rounded-xl border border-slate bg-charcoal/80 p-4 font-mono text-[13px] leading-relaxed text-cloud" {...p} />
        ),
        code: ({ className, children, ...rest }) => {
          const block = /language-/.test(className ?? "") || String(children).includes("\n");
          return block ? (
            <code className={className} {...rest}>
              {children}
            </code>
          ) : (
            <code className="rounded bg-violet/15 px-1.5 py-0.5 font-mono text-[0.85em] text-lavender" {...rest}>
              {children}
            </code>
          );
        },
        a: ({ href, children, ...rest }) => {
          const h = href ?? "";
          if (h.startsWith("/docs")) {
            return (
              <Link to={h.replace(/\/$/, "")} className="text-lavender underline decoration-violet/50 underline-offset-4 hover:decoration-lavender">
                {children}
              </Link>
            );
          }
          const external = /^https?:/.test(h);
          return (
            <a
              href={h}
              {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="text-lavender underline decoration-violet/50 underline-offset-4 hover:decoration-lavender"
              {...rest}
            >
              {children}
            </a>
          );
        },
      }}
    >
      {md}
    </ReactMarkdown>
  );
}
