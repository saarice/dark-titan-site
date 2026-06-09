import lockupSvg from "../assets/brand/darktitan-lockup.svg";
import crestSvg from "../assets/brand/darktitan-crest.svg";

/**
 * Dark Titan logo for SMALL UI placements (nav, footer, dashboard rail) — the
 * canonical brand vector: the angular titan crest (dark-violet #3A0B77 with a
 * #7C4AF0→#C57AFF gradient core) + the "DARKTITAN" wordmark. The big textured 3D
 * crest/monolith stays the page's lead graphic; this flat SVG is the small mark.
 *
 * - variant "mark"   -> crest only (square-ish; footer)
 * - variant "lockup" -> crest + wordmark on one line (nav, Factory product mock)
 */
export default function Logo({
  variant = "lockup",
  className = "",
}: {
  variant?: "mark" | "lockup";
  className?: string;
}) {
  if (variant === "mark") {
    return (
      <span className={`inline-flex items-center justify-center ${className}`}>
        <img
          src={crestSvg}
          alt="Dark Titan"
          draggable={false}
          className="block h-full w-full select-none object-contain"
        />
      </span>
    );
  }

  return (
    <img
      src={lockupSvg}
      alt="Dark Titan"
      draggable={false}
      className={`block h-7 w-auto max-w-full select-none ${className}`}
    />
  );
}
