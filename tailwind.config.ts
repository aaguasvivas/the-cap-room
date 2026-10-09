import type { Config } from "tailwindcss";

/**
 * Palette per design spec: broadcast scoreboard meets cap analyst's ledger.
 * Deep royal purple evokes Sacramento without reproducing marks.
 *
 * Text tiers, all WCAG AA (≥4.5:1) on every surface they sit on:
 * bone (primary) → silver (secondary) → dim (tertiary). Never fade text with
 * opacity; reach for the next tier instead. `royal.ink` is purple *as text*;
 * `royal.soft` is for strokes and focus rings only.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        royal: {
          DEFAULT: "#4B2A75",
          bright: "#6B44A3",
          soft: "#8E6BC2",
          ink: "#B39BDF",
          faint: "#2E1D47",
        },
        graphite: {
          DEFAULT: "#17161A",
          raised: "#1E1D22",
          panel: "#232228",
          line: "#2E2D34",
        },
        bone: "#EDEAE4",
        silver: "#A9A6B0",
        dim: "#94919B",
        legal: "#3FA66A",
        illegal: "#EF5B5B",
        warn: "#D69A3C",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.02em",
        wideish: "0.08em",
      },
    },
  },
  plugins: [],
};

export default config;
