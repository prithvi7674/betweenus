/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./firebase/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#EC5C7A",
        softPink: "#F3D6DB",
        rose: "#E8B7C1",
        warmPink: "#E39AA8",
        deepPink: "#E77992",
      },
      boxShadow: {
        blush: "0 24px 60px rgba(231, 121, 146, 0.18)",
        soft: "0 16px 32px rgba(227, 154, 168, 0.16)",
      },
    },
  },
  plugins: [],
};
