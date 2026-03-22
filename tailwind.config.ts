import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./client/index.html", "./client/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#1e1b4b",
          "navy-mid": "#27255a",
          "navy-light": "#312e7a",
          gold: "#f97316",
          "gold-light": "#fb923c",
          "gold-dark": "#ea6a00",
          pink: "#ec4899",
          "pink-light": "#f472b6",
          emerald: "#10b981",
          surface: "#fafaf9",
        },
        border: "hsl(245 30% 22%)",
        input: "hsl(245 30% 22%)",
        ring: "#f97316",
        background: "#1e1b4b",
        foreground: "#fafaf9",
        primary: { DEFAULT: "#f97316", foreground: "#ffffff" },
        secondary: { DEFAULT: "#312e7a", foreground: "#fafaf9" },
        destructive: { DEFAULT: "#EF4444", foreground: "#fafaf9" },
        muted: { DEFAULT: "#312e7a", foreground: "#9ca3af" },
        accent: { DEFAULT: "#ec4899", foreground: "#ffffff" },
        card: { DEFAULT: "#27255a", foreground: "#fafaf9" },
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #1e1b4b 0%, #4f46e5 50%, #f97316 100%)",
        "gold-gradient": "linear-gradient(90deg, #f97316, #ec4899, #f97316)",
        "cta-gradient": "linear-gradient(135deg, #4f46e5 0%, #f97316 100%)",
        "card-gradient": "linear-gradient(135deg, #27255a 0%, #312e7a 100%)",
      },
      keyframes: {
        "fade-in": { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        "pulse-glow": { "0%, 100%": { boxShadow: "0 0 0 0 rgba(249,115,22,0)" }, "50%": { boxShadow: "0 0 24px 6px rgba(249,115,22,0.35)" } },
        "slide-in": { "0%": { opacity: "0", transform: "translateX(-20px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
      },
      animation: {
        "fade-in": "fade-in 0.6s ease-out",
        shimmer: "shimmer 3s infinite linear",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-in": "slide-in 0.4s ease-out",
      },
      boxShadow: {
        "orange-glow": "0 0 24px rgba(249,115,22,0.4)",
        "pink-glow": "0 0 24px rgba(236,72,153,0.4)",
        "card-lift": "0 8px 32px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
