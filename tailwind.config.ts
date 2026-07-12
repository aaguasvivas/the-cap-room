import type { Config } from "tailwindcss";

/**
 * Palette per design spec: broadcast scoreboard meets cap analyst's ledger.
 * Deep royal purple evokes Sacramento without reproducing marks.
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
        legal: "#3FA66A",
        illegal: "#D64545",
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
