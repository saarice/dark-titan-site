/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "var(--obsidian)",
        charcoal: "var(--charcoal)",
        slate: "var(--slate)",
        steel: "var(--steel)",
        violet: "var(--violet)",
        "violet-dp": "var(--violet-dp)",
        lavender: "var(--lavender)",
        cloud: "var(--cloud)",
        muted: "var(--fg-muted)",
        faint: "var(--fg-faint)",
        "sig-cyan": "var(--sig-cyan)",
        "sig-amber": "var(--sig-amber)",
        "sig-red": "var(--sig-red)",
        "sig-green": "var(--sig-green)",
      },
      fontFamily: {
        display: ["'Archivo Black'", "system-ui", "sans-serif"],
        body: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      keyframes: {
        "role-fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "pulse-dot": {
          "0%,100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.8)" },
        },
        "river-flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        "role-fade-in": "role-fade-in 0.4s ease-out",
        "gradient-shift": "gradient-shift 6s ease infinite",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        "river-flow": "river-flow 8s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
