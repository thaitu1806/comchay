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
        warm: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
        "cam-chay": {
          DEFAULT: "#FF6600",
          50: "#FFF2E5",
          100: "#FFE0BF",
          200: "#FFC180",
          300: "#FFA240",
          400: "#FF8320",
          500: "#FF6600",
          600: "#E65C00",
          700: "#CC5200",
          800: "#993D00",
          900: "#662900",
        },
        "vang-nang": {
          DEFAULT: "#FFB800",
          50: "#FFF8E5",
          100: "#FFEFBF",
          200: "#FFDF80",
          300: "#FFD040",
          400: "#FFC420",
          500: "#FFB800",
          600: "#E6A600",
          700: "#CC9300",
          800: "#996E00",
          900: "#664A00",
        },
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
