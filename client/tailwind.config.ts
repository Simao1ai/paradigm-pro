import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0B1628",
          "navy-mid": "#101D32",
          "navy-light": "#162240",
          gold: "#C9A84C",
          "gold-light": "#D4B96A",
          "gold-dark": "#A88B3D",
        },
        border: "hsl(220 20% 18%)",
        input: "hsl(220 20% 18%)",
        ring: "#C9A84C",
        background: "#0B1628",
        foreground: "#F1F5F9",
        primary: { DEFAULT: "#C9A84C", foreground: "#0B1628" },
        secondary: { DEFAULT: "#162240", foreground: "#F1F5F9" },
        destructive: { DEFAULT: "#EF4444", foreground: "#F1F5F9" },
        muted: { DEFAULT: "#162240", foreground: "#94A3B8" },
        accent: { DEFAULT: "#162240", foreground: "#F1F5F9" },
        card: { DEFAULT: "#101D32", foreground: "#F1F5F9" },
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #0B1628 0%, #162240 50%, #0B1628 100%)",
        "gold-gradient": "linear-gradient(90deg, #C9A84C, #D4B96A, #C9A84C)",
      },
      keyframes: {
        "fade-in": { "0%": { opacity: "0", transform: "translateY(10px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        shimmer: "shimmer 3s infinite linear",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
