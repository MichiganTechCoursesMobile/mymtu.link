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
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  daisyui: {
    themes: [
      {
        lightTheme: {
          primary: "#415f91",
          "primary-content": "#ffffff",
          secondary: "#565f71",
          "secondary-content": "#ffffff",
          accent: "#705575",
          "accent-content": "#ffffff",
          neutral: "#f9f9ff",
          "neutral-content": "#191c20",
          "base-100": "#ededf5",
          "base-200": "#e7e8ee",
          "base-300": "#e2e2e9",
          "base-content": "#191c20",
          info: "#0000ff",
          "info-content": "#c6dbff",
          success: "#00ff00",
          "success-content": "#001600",
          warning: "#00ff00",
          "warning-content": "#001600",
          error: "#bb1b1b",
          "error-content": "#ffffff",
        },
        darkTheme: {
          primary: "#aac7ff",
          "primary-content": "#0a305f",
          secondary: "#bec6dc",
          "secondary-content": "#283141",
          accent: "#ddbce0",
          "accent-content": "#3f2844",
          neutral: "#111318",
          "neutral-content": "#e2e2e9",
          "base-100": "#1d2024",
          "base-200": "#282a2f",
          "base-300": "#33353a",
          "base-content": "#e2e2e9",
          info: "#0000ff",
          "info-content": "#c6dbff",
          success: "#00ff00",
          "success-content": "#001600",
          warning: "#00ff00",
          "warning-content": "#001600",
          error: "#ffb4ab",
          "error-content": "#690005",
        },
      },
    ],
    darkTheme: "darkTheme",
    themeRoot: ":root",
  },
  darkMode: ["class", '[data-theme="darkTheme"]'],
  plugins: [require("daisyui")],
};
export default config;
