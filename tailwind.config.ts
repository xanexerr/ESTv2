import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Larger typography scale (+4pt total over base Tailwind) across UNINFO
      fontSize: {
        xs: ["1.0625rem", { lineHeight: "1.45rem" }], // 17px
        sm: ["1.1875rem", { lineHeight: "1.65rem" }], // 19px
        base: ["1.3125rem", { lineHeight: "1.9rem" }], // 21px
        lg: ["1.4375rem", { lineHeight: "2rem" }], // 23px
        xl: ["1.625rem", { lineHeight: "2.2rem" }], // 26px
        "2xl": ["1.875rem", { lineHeight: "2.45rem" }], // 30px
        "3xl": ["2.25rem", { lineHeight: "2.75rem" }], // 36px
        "4xl": ["2.625rem", { lineHeight: "3rem" }], // 42px
      },
      colors: {
        brand: {
          DEFAULT: "var(--brand)",
          hover: "var(--brand-hover)",
          subtle: "var(--brand-subtle)",
        },
        paper: {
          bg: "var(--bg)",
          surface: "var(--surface)",
          muted: "var(--surface-muted)",
        },
        ink: {
          primary: "var(--ink-primary)",
          secondary: "var(--ink-secondary)",
          muted: "var(--ink-muted)",
        },
        line: {
          DEFAULT: "var(--line)",
          strong: "var(--line-strong)",
        },
      },
      fontFamily: {
        sans: ["'Anuphan'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
