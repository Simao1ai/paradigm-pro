import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f5ff",
          100: "#e0eaff",
          200: "#c2d5ff",
          300: "#93b4ff",
          400: "#6690ff",
          500: "#3366ff",
          600: "#1a4dff",
          700: "#0033e6",
          800: "#0029b8",
          900: "#001f8a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
