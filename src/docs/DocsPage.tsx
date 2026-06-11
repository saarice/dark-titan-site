import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Logo from "../components/Logo";
import { DOCS_NAV, docNeighbors, docTitle } from "./manifest";
import { extractHeadings, loaderFor, slugifyHeading, type DocHeading } from "./searchIndex";
import DocsSearch from "./DocsSearch";
import { DocsHomeHero, DocsHomeCards } from "./DocsHome";

/**
 * The product docs (/docs/...), restyled to the landing brand. Three-column
 * reading layout: section sidebar · article · "On this page" rail (scroll-spy).
 * The docs home is a card landing with the open search front-and-centre; the
 * header carries the compact search everywhere else (Ctrl/⌘K). Content is
 * lazy-loaded per page from src/content/docs.
 */
export default function DocsPage() {
  const slug = (useParams()["*"] ?? "").replace(/\/+$/, "");
  const { hash } = useLocation();
  const isHome = slug === "";
  const [md, setMd] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Reset during render when the slug changes (React's "adjusting state when a
  // prop changes" pattern) — the effect below only does the real side-effects.
  const [shownSlug, setShownSlug] = useState<string | null>(null);
  if (shownSlug !== slug) {
    setShownSlug(slug);
    setMd(null);
    setMissing(!loaderFor(slug));
    setMenuOpen(false);
  }

  useEffect(() => {
    document.title = `${docTitle(slug) ?? "Docs"} · DarkTitan Docs`;
    if (!hash) window.scrollTo(0, 0);
    let stale = false;
    loaderFor(slug)?.().then((text) => {
      if (!stale) setMd(text);
    });
    return () => {
      stale = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hash deep-links are handled below
  }, [slug]);

  // deep-link: once the article is in, jump to the #heading from the URL
  useEffect(() => {
    if (md === null || !hash) return;
    const id = decodeURIComponent(hash.slice(1));
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
  }, [md, hash]);

  // on the home the article is the Introduction minus its h1+tagline (the hero
  // says it) and minus "Quick links" (the cards below stand in for it) — the
  // TOC is extracted from what's actually rendered
  const articleMd = useMemo(() => (md && isHome ? homeArticle(md) : md), [md, isHome]);
  const headings = useMemo(() => (articleMd ? extractHeadings(articleMd) : []), [articleMd]);
  const { prev, next } = docNeighbors(slug);

  return (
    <div className="min-h-screen bg-obsidian font-body text-cloud">
      {/* slim docs header — logo · open search · site link */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate bg-charcoal/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1480px] items-center gap-4 px-5 py-3 md:px-8">
          <div className="flex flex-none items-center gap-3">
            <Link to="/" aria-label="Dark Titan home" className="block">
              <Logo variant="lockup" className="h-5" />
            </Link>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-violet sm:inline">
              docs
            </span>
          </div>
          <div className="flex min-w-0 flex-1 justify-center">
            <DocsSearch variant="header" />
          </div>
          <div className="flex flex-none items-center gap-4">
            <Link
              to="/"
              className="hidden font-mono text-xs uppercase tracking-[0.15em] text-muted transition-colors hover:text-cloud sm:block"
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

      <div className="mx-auto flex max-w-[1480px] gap-10 px-5 pt-20 md:px-8">
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
          ) : (
            // ONE shared, centred column for everything (hero, cards, article,
            // pager) — without it, wide screens showed a centred hero over a
            // left-hugging article and full-width cards: three different axes.
            <div className="mx-auto w-full max-w-3xl">
              {/* home order: hero → the Introduction content → the section
                  cards close the page (standing in for the old Quick links) */}
              {isHome && <DocsHomeHero />}
              {articleMd === null ? (
                isHome ? null : (
                  <p className="pt-16 font-mono text-xs uppercase tracking-[0.2em] text-faint">Loading…</p>
                )
              ) : (
                <article className={`docs-prose ${isHome ? "pt-14" : "pt-10"}`}>
                  <Markdown md={articleMd} />
                </article>
              )}
              {isHome && articleMd !== null && <DocsHomeCards />}
            </div>
          )}

          {/* pager */}
          {!missing && (prev || next) && (
            <nav aria-label="Docs pager" className="mx-auto mt-16 flex w-full max-w-3xl justify-between gap-4 border-t border-slate pt-6">
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

        {/* "On this page" rail — scroll-spy TOC, wide screens only */}
        {!missing && headings.length >= 2 && (
          <aside className="hidden w-52 flex-none xl:block" aria-label="On this page">
            <OnThisPage headings={headings} />
          </aside>
        )}
      </div>
    </div>
  );
}

/** Right-rail table of contents with a scroll-spy active state. */
function OnThisPage({ headings }: { headings: DocHeading[] }) {
  const [active, setActive] = useState("");
  const raf = useRef(0);

  useEffect(() => {
    const update = () => {
      let cur = "";
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= 130) cur = h.id;
      }
      setActive(cur);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [headings]);

  return (
    <nav className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-10 pt-10">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-faint">
        On this page
      </p>
      <ul className="space-y-0.5 border-l border-slate">
        {headings.map((h) => {
          const isActive = h.id === active;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                aria-current={isActive ? "location" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
                  history.replaceState(null, "", `#${h.id}`);
                }}
                className={`-ml-px block border-l py-1 text-[12.5px] leading-snug transition-colors ${
                  h.level === 3 ? "pl-7" : "pl-4"
                } ${
                  isActive
                    ? "border-violet text-lavender"
                    : "border-transparent text-faint hover:border-steel hover:text-cloud"
                }`}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** The home's article view of index.md: drop everything before the first "## "
 *  (the h1 + tagline duplicate the hero) and drop the "Quick links" section
 *  (the card grid below replaces it). */
function homeArticle(md: string): string {
  const i = md.indexOf("\n## ");
  const fromFirstH2 = i === -1 ? md : md.slice(i + 1);
  return fromFirstH2.replace(/^## Quick links\s*$[\s\S]*?(?=^## |\n*$(?![\s\S]))/m, "");
}

/** flatten a heading's children to plain text (for the anchor id) */
function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) {
    return textOf((node.props as { children?: ReactNode }).children);
  }
  return "";
}

/** Markdown → brand-styled elements. h2/h3 get anchor ids matching the TOC. */
function Markdown({ md }: { md: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: (p) => <h1 className="font-display text-h3 leading-tight tracking-tight text-cloud md:text-[2.5rem]" {...p} />,
        h2: ({ children, ...p }) => (
          <h2
            id={slugifyHeading(textOf(children))}
            className="mt-12 scroll-mt-24 border-b border-slate pb-2 font-display text-xl tracking-tight text-cloud md:text-2xl"
            {...p}
          >
            {children}
          </h2>
        ),
        h3: ({ children, ...p }) => (
          <h3
            id={slugifyHeading(textOf(children))}
            className="mt-8 scroll-mt-24 font-display text-base text-cloud md:text-lg"
            {...p}
          >
            {children}
          </h3>
        ),
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
