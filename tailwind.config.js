/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,tsx,ts}"],
  safelist: [
    {
      pattern: /^col-span-([1-9]|1[0-6])$/,
    },
  ],
  theme: {
    fontSize: {
      sm: ["0.8vw", "1.2vw"],
      base: ["1vw", "1.5vw"],
      lg: ["1.2vw", "1.8vw"],
      word: ["1.4vw", "2.1vw"],
      adr: ["1.8vw", "2.7vw"],
    },
    extend: {
      gridTemplateColumns: {
        16: "repeat(16, minmax(0, 1fr))",
      },
      gridColumn: {
        "span-13": "span 13 / span 13",
        "span-14": "span 14 / span 14",
        "span-15": "span 15 / span 15",
        "span-16": "span 16 / span 16",
      },
    },
  },
  plugins: [],
};
