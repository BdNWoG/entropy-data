import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#1e293b", // Background color (dark blue-black)
        panel: "#0f172a", // Panel background (black)
        borderBlue: "#3b82f6", // Light blue border color
      },
    },
  },
  plugins: [],
};
export default config;
