import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        surface: "rgb(var(--surface) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        brand: "rgb(var(--brand) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)"
      },
      borderRadius: {
        shell: "var(--radius-shell)",
        card: "var(--radius-card)"
      },
      boxShadow: {
        glow: "0 18px 40px rgba(0, 0, 0, 0.18)"
      },
      backgroundImage: {
        noise:
          "radial-gradient(circle at top, rgba(255,255,255,0.08), transparent 30%), radial-gradient(circle at bottom, rgba(0,0,0,0.05), transparent 30%)"
      }
    }
  },
  plugins: []
};

export default config;

