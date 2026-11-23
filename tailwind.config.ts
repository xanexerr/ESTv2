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
        ssp: {
          primary: "#136F73",
          dark: "#0D5255",
          light: "#E6F3F3",
          amber: "#FFB72B",
          amberDark: "#E09B10",
          cream: "#F7F8E0",
          bg: "#F4F7F8",
        },
      },
      fontFamily: {
        sans: ["'IBM Plex Sans Thai'", "'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
