import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

// Each link points at its beat's section id. The Infrastructure/Ecosystem
// pillar split is gone (Saar, 2026-06-10) — links name the value directly.
const LINKS: [string, string][] = [
  ["Platform", "process"],
  ["Integrations", "integrations"],
  ["Modernize", "break"],
  ["Why", "offer-table"],
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Active-section highlight: whichever tracked section is crossing the upper
  // third of the viewport owns the nav state.
  useEffect(() => {
    const ids = LINKS.map(([, id]) => id);
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "border-b border-slate bg-charcoal/80 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4 md:px-10">
        <a href="#home" aria-label="Dark Titan home" className="block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet">
          {/* smaller on phones — full-size lockup + demo pill + burger overflow 390px */}
          <Logo variant="lockup" className="h-5 md:h-7" />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map(([label, id]) => (
            <a
              key={label}
              href={`#${id}`}
              aria-current={active === id ? "true" : undefined}
              className={`group relative font-mono text-xs uppercase tracking-[0.18em] transition-colors focus-visible:text-cloud focus-visible:outline-none ${
                active === id ? "text-cloud" : "text-muted hover:text-cloud"
              }`}
            >
              {label}
              <span
                className={`absolute -bottom-1 left-0 h-px w-full origin-left bg-violet transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100 ${
                  active === id ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </a>
          ))}
          <Link
            to="/docs"
            className="group relative font-mono text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-cloud focus-visible:text-cloud focus-visible:outline-none"
          >
            Docs
            <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-violet transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100" />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* hidden on phones: lockup + pill + burger can't share 360-390px
              (the burger menu and the hero both carry the Book-a-demo CTA) */}
          <a
            href="#contact"
            className="hidden whitespace-nowrap rounded-full bg-violet px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-obsidian transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-lavender hover:shadow-[0_0_24px_rgba(155,109,255,0.5)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet sm:inline-block md:px-5 md:py-2.5 md:text-xs md:tracking-[0.15em]"
          >
            Book a demo
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-steel text-cloud transition-colors hover:border-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet md:hidden"
          >
            <span className="relative block h-3 w-4">
              <span className={`absolute left-0 top-0 h-0.5 w-4 bg-current transition-transform duration-200 ${open ? "translate-y-[5px] rotate-45" : ""}`} />
              <span className={`absolute left-0 top-[5px] h-0.5 w-4 bg-current transition-opacity duration-200 ${open ? "opacity-0" : "opacity-100"}`} />
              <span className={`absolute left-0 top-[10px] h-0.5 w-4 bg-current transition-transform duration-200 ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </nav>

      {/* mobile menu panel */}
      {open && (
        <div className="border-t border-slate bg-charcoal/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col px-5 py-4">
            {LINKS.map(([label, id]) => (
              <a
                key={label}
                href={`#${id}`}
                onClick={() => setOpen(false)}
                className="border-b border-slate/60 py-4 font-mono text-sm uppercase tracking-[0.18em] text-muted transition-colors hover:text-cloud focus-visible:text-cloud focus-visible:outline-none"
              >
                {label}
              </a>
            ))}
            <Link
              to="/docs"
              onClick={() => setOpen(false)}
              className="border-b border-slate/60 py-4 font-mono text-sm uppercase tracking-[0.18em] text-muted transition-colors hover:text-cloud focus-visible:text-cloud focus-visible:outline-none"
            >
              Docs
            </Link>
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-4 rounded-full bg-violet px-4 py-3 text-center font-mono text-sm uppercase tracking-[0.12em] text-obsidian"
            >
              Book a demo
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
