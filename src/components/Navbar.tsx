import { useEffect, useState } from "react";

const LINKS = ["Home", "Work", "Approach"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("Home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-4 md:pt-6">
      <nav
        className={`inline-flex items-center rounded-full border border-white/10 bg-surface px-2 py-2 backdrop-blur-md transition-shadow ${
          scrolled ? "shadow-md shadow-black/40" : ""
        }`}
      >
        {/* logo */}
        <a href="#home" className="group relative mr-1 grid h-9 w-9 place-items-center">
          <span className="accent-gradient absolute inset-0 rounded-full transition-transform duration-500 group-hover:rotate-180" />
          <span className="absolute inset-[2px] grid place-items-center rounded-full bg-bg font-display text-[13px] font-bold leading-none text-text-primary transition-transform group-hover:scale-110">
            DT
            <span className="sr-only">Dark Titan home</span>
          </span>
        </a>

        <span className="mx-1 hidden h-5 w-px bg-stroke sm:block" />

        {LINKS.map((l) => (
          <a
            key={l}
            href={`#${l.toLowerCase()}`}
            onClick={() => setActive(l)}
            className={`rounded-full px-3 py-1.5 text-xs transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              active === l
                ? "bg-stroke/50 text-text-primary"
                : "text-muted hover:bg-stroke/50 hover:text-text-primary"
            }`}
          >
            {l}
          </a>
        ))}

        <span className="mx-1 hidden h-5 w-px bg-stroke sm:block" />

        <a href="mailto:saar.cohen@develeap.com" className="group relative ml-1">
          <span className="gradient-border-animated absolute -inset-[2px] rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
          <span className="relative inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1.5 text-xs backdrop-blur-md sm:px-4 sm:py-2 sm:text-sm">
            Talk to us <span className="text-accent">↗</span>
          </span>
        </a>
      </nav>
    </div>
  );
}
