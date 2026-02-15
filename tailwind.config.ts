import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          dark: "var(--color-primary-dark)",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          sidebar: "var(--color-surface-sidebar)",
        },
        content: {
          DEFAULT: "var(--color-content)",
          muted: "var(--color-content-muted)",
        },
        border: {
          DEFAULT: "var(--color-border)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      maxWidth: {
        content: "800px",
      },
      spacing: {
        sidebar: "260px",
        toc: "220px",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "800px",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
