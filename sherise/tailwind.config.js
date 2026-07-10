/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F5F7F2",
        surface: "#FFFFFF",
        primary: {
          DEFAULT: "#2E7D5B",
          light: "#8FBF9F",
        },
        accent: {
          gold: "#E3A857",
          plum: "#8B4A6B",
        },
        text: {
          DEFAULT: "#1E2A24",
          muted: "#5C6B62",
        },
        border: "#E3E8DF",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
