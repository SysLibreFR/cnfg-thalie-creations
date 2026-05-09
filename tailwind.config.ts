import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["'Playfair Display'", "serif"],
        subtitle: ["'Cormorant Garamond'", "serif"],
        body: ["'Nunito'", "sans-serif"],
        label: ["'Josefin Sans'", "sans-serif"],
      },
      colors: {
        prune:       "var(--prune)",
        lavande:     "var(--lavande)",
        "lavande-light": "var(--lavande-light)",
        "lavande-pale":  "var(--lavande-pale)",
        rose:        "var(--rose)",
        sable:       "var(--sable)",
        creme:       "var(--creme)",
        "creme-dark": "var(--creme-dark)",
        "tc-text":   "var(--text)",
        "text-muted": "var(--text-muted)",
      },
      screens: {
        xs: "480px",
      },
    },
  },
  plugins: [],
};

export default config;
