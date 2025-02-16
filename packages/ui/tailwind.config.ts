import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#ffffff",
        input: "#ffffff",
        ring: "#ffffff",
        background: "#ffffff",
        foreground: "#1b1b20",
        primary: {
          DEFAULT: "#712e30",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#352C2B",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#d40014",
          foreground: "#ffd4d1",
        },
        muted: {
          DEFAULT: "#fff",
          foreground: "#000",
        },
        accent: {
          DEFAULT: "#8F3131",
          foreground: "#fff",
        },
        popover: {
          DEFAULT: "#fff",
          foreground: "#000",
        },
        card: {
          DEFAULT: "#fff",
          foreground: "#000",
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

export default config;
