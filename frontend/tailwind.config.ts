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
          bg:               "#040201",
          surface:          "#0A0603",
          panel:            "#100804",
          border:           "#1E1208",
          parchment:        "#EDE0C4",
          parchmentDim:     "#8C7A5C",
          parchmentMuted:   "#4A3E2C",
          gold:             "#B8922E",
          goldBright:       "#D4AA50",
          prosecutionBg:    "#060D1A",
          prosecutionBdr:   "#0F1E36",
          prosecutionAcc:   "#2A4E8A",
          defenseBg:        "#130505",
          defenseBdr:       "#2A0C0C",
          defenseAcc:       "#8A2A2A",
          judgeBg:          "#040A05",
          judgeBdr:         "#0A1C0C",
          judgeAcc:         "#2A6B32",
          witnessBg:        "#080A10",
          witnessBdr:       "#141820",
          witnessAcc:       "#4A5680",
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
