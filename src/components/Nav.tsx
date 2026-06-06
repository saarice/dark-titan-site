import { useEffect, useState } from "react";
import Logo from "./Logo";

const LINKS = ["Platform", "Solutions", "Resources", "Company"];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-slate bg-charcoal/80 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4 md:px-10">
        <a href="#home" aria-label="Dark Titan home" className="block">
          <Logo variant="lockup" />
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l}
              href="#"
              className="font-mono text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-cloud"
            >
              {l}
            </a>
          ))}
        </div>
        <a
          href="#contact"
          className="rounded-full bg-violet px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-obsidian transition-colors hover:bg-lavender focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
        >
          Book a Demo
        </a>
      </nav>
    </header>
  );
}
