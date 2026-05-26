import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        court: {
          bg:               "#1E2236",       // deep navy background
          surface:          "#252B42",       // slightly lighter navy surface
          panel:            "#2C3350",       // panel navy
          border:           "#3A4260",       // navy border
          parchment:        "#F0F0DB",       // cream text (lightest)
          parchmentDim:     "#E1D9BC",       // warm beige text
          parchmentMuted:   "#ACBAC4",       // slate-blue muted text
          gold:             "#ACBAC4",       // slate used as accent
          goldBright:       "#F0F0DB",       // cream as bright accent
          prosecutionBg:    "#232A40",
          prosecutionBdr:   "#30364F",
          prosecutionAcc:   "#ACBAC4",       // slate-blue for prosecution
          defenseBg:        "#282035",
          defenseBdr:       "#3A3050",
          defenseAcc:       "#E1D9BC",       // beige for defence
          judgeBg:          "#1E2438",
          judgeBdr:         "#30364F",
          judgeAcc:         "#F0F0DB",       // cream for judge
          witnessBg:        "#252B42",
          witnessBdr:       "#3A4260",
          witnessAcc:       "#ACBAC4",       // slate for witness
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono:  ["var(--font-mono)", "Courier New", "monospace"],
      },
      keyframes: {
        "cursor-blink": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0" },
        },
        "objection-slam": {
          "0%":   { opacity: "0", transform: "translateY(-40px) scale(1.1)", letterSpacing: "0.5em" },
          "40%":  { opacity: "1", transform: "translateY(0px) scale(1.02)", letterSpacing: "0.25em" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)", letterSpacing: "0.15em" },
        },
        "ruling-rise": {
          "0%":   { opacity: "0", transform: "translateY(15px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "evidence-slide": {
          "0%":   { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "verdict-reveal": {
          "0%":   { opacity: "0", transform: "scale(0.92)", filter: "blur(6px)" },
          "100%": { opacity: "1", transform: "scale(1)", filter: "blur(0)" },
        },
        "phase-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.55" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "cursor-blink":    "cursor-blink 0.75s step-end infinite",
        "objection-slam":  "objection-slam 0.45s cubic-bezier(0.22,1,0.36,1) forwards",
        "ruling-rise":     "ruling-rise 0.4s ease-out 0.6s both",
        "evidence-slide":  "evidence-slide 0.35s ease-out forwards",
        "verdict-reveal":  "verdict-reveal 0.5s ease-out forwards",
        "phase-pulse":     "phase-pulse 2s ease-in-out infinite",
        "fade-in":         "fade-in 0.25s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
