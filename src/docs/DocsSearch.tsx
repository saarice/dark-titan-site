import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildSearchIndex, searchDocs, type DocEntry, type SearchHit } from "./searchIndex";

/**
 * The docs search — an OPEN, always-visible input (no hidden modal), with the
 * advanced behaviours of a docs engine: lazy-built full-text index, ranked
 * results (title > heading > body), heading deep-links, highlighted snippets,
 * full keyboard control (Ctrl/⌘K to focus, ↑↓ to move, Enter to go, Esc to
 * close) and grouped section labels. `hero` is the large variant on the docs
 * home; `header` is the compact one in the top bar.
 */
export default function DocsSearch({
  variant = "header",
  hotkey = true,
}: {
  variant?: "header" | "hero";
  hotkey?: boolean;
}) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState<DocEntry[] | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(0);

  const ensureIndex = () => {
    if (!index) buildSearchIndex().then(setIndex);
  };

  // Ctrl/⌘K focuses the search from anywhere in the docs.
  useEffect(() => {
    if (!hotkey) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hotkey]);

  // close when clicking anywhere outside
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  const hits = useMemo<SearchHit[]>(
    () => (index && q.trim() ? searchDocs(index, q) : []),
    [index, q],
  );
  const terms = useMemo(() => q.toLowerCase().split(/\s+/).filter(Boolean), [q]);

  const go = (h: SearchHit) => {
    setOpen(false);
    setQ("");
    inputRef.current?.blur();
    navigate(`/docs${h.slug ? `/${h.slug}` : ""}${h.heading ? `#${h.heading.id}` : ""}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && hits[sel]) {
      e.preventDefault();
      go(hits[sel]);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const hero = variant === "hero";

  return (
    <div ref={boxRef} className={`relative ${hero ? "mx-auto w-full max-w-xl" : "w-full max-w-sm"}`}>
      <div
        className={`flex items-center gap-2.5 rounded-xl border bg-charcoal/80 backdrop-blur-sm transition-colors focus-within:border-violet/70 ${
          hero ? "border-steel px-4 py-3.5" : "border-slate px-3 py-2"
        }`}
      >
        <svg viewBox="0 0 20 20" className={`flex-none text-faint ${hero ? "h-5 w-5" : "h-4 w-4"}`} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <circle cx="9" cy="9" r="5.5" />
          <path d="m13.5 13.5 3.5 3.5" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={open && hits.length > 0}
          aria-label="Search docs"
          placeholder="Search the docs…"
          value={q}
          onChange={(e) => {
            ensureIndex(); // typing implies intent even if focus never registered
            setQ(e.target.value);
            setSel(0);
            setOpen(true);
          }}
          onFocus={() => {
            ensureIndex();
            if (q.trim()) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className={`min-w-0 flex-1 bg-transparent text-cloud placeholder:text-faint focus:outline-none [&::-webkit-search-cancel-button]:hidden ${
            hero ? "text-base" : "text-sm"
          }`}
        />
        <kbd
          className={`flex-none rounded-md border border-steel px-1.5 py-0.5 font-mono text-[10px] text-faint ${
            hero ? "" : "hidden md:block"
          }`}
        >
          Ctrl K
        </kbd>
      </div>

      {/* results */}
      {open && q.trim() && (
        <div
          role="listbox"
          className="absolute inset-x-0 top-full z-50 mt-2 max-h-[26rem] overflow-y-auto rounded-xl border border-steel bg-charcoal/95 p-1.5 shadow-2xl backdrop-blur-xl"
        >
          {!index ? (
            <p className="px-3 py-4 font-mono text-[11px] uppercase tracking-[0.15em] text-faint">
              Indexing…
            </p>
          ) : hits.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted">
              No results for <span className="text-lavender">“{q}”</span>
            </p>
          ) : (
            hits.map((h, i) => (
              <button
                key={`${h.slug}-${h.heading?.id ?? ""}`}
                type="button"
                role="option"
                aria-selected={i === sel}
                onMouseEnter={() => setSel(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  go(h);
                }}
                className={`block w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                  i === sel ? "bg-violet/15" : ""
                }`}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-sm text-cloud">
                    <Highlight text={h.title} terms={terms} />
                    {h.heading && (
                      <span className="text-muted">
                        {" · "}
                        <Highlight text={h.heading.text} terms={terms} />
                      </span>
                    )}
                  </span>
                  <span className="flex-none font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
                    {h.section}
                  </span>
                </span>
                {h.snippet && (
                  <span className="mt-1 block truncate text-[12.5px] leading-snug text-muted">
                    <Highlight text={h.snippet} terms={terms} />
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** wraps query-term matches in <mark>, brand-tinted */
function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>;
  const re = new RegExp(`(${terms.map(escapeRe).join("|")})`, "ig");
  const parts = text.split(re);
  return (
    <>
      {parts.map((part, i) =>
        terms.some((t) => part.toLowerCase() === t) ? (
          <mark key={i} className="rounded-[2px] bg-violet/30 px-0.5 text-lavender">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
