import titanLogo from "../assets/titan-logo.png";

/**
 * Dark Titan logo - the metallic angular titan crest split by a glowing violet seam.
 * The asset is a transparent PNG (the original pure-black field was removed with a
 * smooth luminance ramp, so the crest's fade-to-black lower edges dissolve cleanly
 * onto any dark surface). Display it normally - no blend tricks needed.
 *
 * - variant "mark"   -> crest only (used in the nav + footer)
 * - variant "lockup" -> crest + wordmark (used inside the Factory product mock)
 */
export default function Logo({
  variant = "lockup",
  className = "",
}: {
  variant?: "mark" | "lockup";
  className?: string;
}) {
  const mark = (
    <img
      src={titanLogo}
      alt="Dark Titan"
      draggable={false}
      className="block h-full w-full select-none object-contain"
      // mild lift so the dark metal reads at small nav/footer sizes; affects RGB
      // only (alpha is already baked), so no black field reappears.
      style={{ filter: "brightness(1.32) contrast(1.04)" }}
    />
  );

  if (variant === "mark") {
    return (
      <span className={`inline-block ${className}`} style={{ aspectRatio: "1 / 1" }}>
        {mark}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className="inline-block h-9 w-9 shrink-0">{mark}</span>
      <span className="leading-none">
        <span className="block font-display text-cloud tracking-[0.25em] text-sm">DARK TITAN</span>
        <span className="mt-0.5 hidden font-mono text-[9px] tracking-[0.3em] text-violet sm:block">LIGHT OFF. CODE OUT.</span>
      </span>
    </span>
  );
}
