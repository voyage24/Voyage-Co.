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
        // Warm dark tones for editorial contrast blocks / image scrims
        vc: {
          DEFAULT: "#26221d",
          50:  "#f3f0ea",
          700: "#3a3327",
          800: "#2a241c",
          900: "#221d16",
          950: "#16120d",
        },
        // Semantic tokens (single warm theme)
        page: "rgb(var(--page) / <alpha-value>)",
        panel: {
          DEFAULT: "rgb(var(--panel) / <alpha-value>)",
          soft:    "rgb(var(--panel-soft) / <alpha-value>)",
          raised:  "rgb(var(--panel-raised) / <alpha-value>)",
        },
        line: {
          DEFAULT: "rgb(var(--line) / <alpha-value>)",
          strong:  "rgb(var(--line-strong) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          muted:   "rgb(var(--ink-muted) / <alpha-value>)",
          faint:   "rgb(var(--ink-faint) / <alpha-value>)",
        },
        gold: {
          DEFAULT: "rgb(var(--gold) / <alpha-value>)",
          soft:    "rgb(var(--gold-soft) / <alpha-value>)",
          strong:  "rgb(var(--gold-strong) / <alpha-value>)",
        },
        // Legacy aliases kept so un-migrated utility classes still resolve
        brand: {
          blue: "#26221d",
          "blue-dark": "#16120d",
          "blue-light": "#f3f0ea",
          yellow: "#8c7b5b",
          "yellow-dark": "#70624a",
          "yellow-light": "#f3efe8",
          navy: "#26221d",
        },
      },
      fontFamily: {
        // Driven by CSS variables so the admin Appearance panel can change
        // them site-wide. font-serif (headings) can differ from the body.
        sans:  ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-heading)", "Inter", "system-ui", "sans-serif"],
        // Reserved exclusively for the "Voyages & Co." wordmark.
        logo:  ["Fahkwang", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card:         "0 1px 2px rgba(38,34,29,0.04), 0 8px 30px rgba(38,34,29,0.05)",
        "card-hover": "0 2px 6px rgba(38,34,29,0.06), 0 16px 44px rgba(38,34,29,0.08)",
        widget:       "0 24px 64px rgba(38,34,29,0.14)",
        luxury:       "0 16px 50px rgba(38,34,29,0.18)",
      },
      animation: {
        "fade-in":   "fadeIn 0.4s ease-out",
        "fade-up":   "fadeUp 1s cubic-bezier(0.16,1,0.3,1)",
        "slide-down":"slideDown 0.35s cubic-bezier(0.16,1,0.3,1)",
        "slide-up":  "slideUp 0.45s cubic-bezier(0.16,1,0.3,1)",
      },
      keyframes: {
        fadeIn:    { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        fadeUp:    { "0%": { opacity: "0", transform: "translateY(24px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideDown: { "0%": { opacity: "0", transform: "translateY(-14px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideUp:   { "0%": { opacity: "0", transform: "translateY(100%)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};

export default config;
