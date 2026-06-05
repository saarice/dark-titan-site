/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "rgb(var(--obsidian) / <alpha-value>)",
        charcoal: "rgb(var(--charcoal) / <alpha-value>)",
        slate: "rgb(var(--slate) / <alpha-value>)",
        steel: "rgb(var(--steel) / <alpha-value>)",
        violet: "rgb(var(--violet) / <alpha-value>)",
        "violet-dp": "rgb(var(--violet-dp) / <alpha-value>)",
        lavender: "rgb(var(--lavender) / <alpha-value>)",
        cloud: "rgb(var(--cloud) / <alpha-value>)",
        muted: "rgb(var(--fg-muted) / <alpha-value>)",
        faint: "rgb(var(--fg-faint) / <alpha-value>)",
        "sig-cyan": "rgb(var(--sig-cyan) / <alpha-value>)",
        "sig-amber": "rgb(var(--sig-amber) / <alpha-value>)",
        "sig-red": "rgb(var(--sig-red) / <alpha-value>)",
        "sig-green": "rgb(var(--sig-green) / <alpha-value>)",
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
