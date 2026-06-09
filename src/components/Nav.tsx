import { useEffect, useState } from "react";
import Logo from "./Logo";

const LINKS: [string, string][] = [
  ["Factory", "#factory"],
  ["Pipeline", "#pipeline"],
  ["Tempo", "#tempo"],
  ["Trust", "#trust"],
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
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
          <Logo variant="lockup" />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="group relative font-mono text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-cloud focus-visible:text-cloud focus-visible:outline-none"
            >
              {label}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-violet transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className="whitespace-nowrap rounded-full bg-violet px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-obsidian transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-lavender hover:shadow-[0_0_24px_rgba(155,109,255,0.5)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet md:px-5 md:py-2.5 md:text-xs md:tracking-[0.15em]"
          >
            Book a Demo
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
            {LINKS.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="border-b border-slate/60 py-4 font-mono text-sm uppercase tracking-[0.18em] text-muted transition-colors hover:text-cloud focus-visible:text-cloud focus-visible:outline-none"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
