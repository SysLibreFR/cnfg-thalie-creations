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
    },
  },
  plugins: [],
};

export default config;
