const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        rose: colors.rose,
      },
      fontFamily: {
        garetha: ["GarethaRegular", ...defaultTheme.fontFamily.serif],
        "bebas-neue": ["Bebas Neue", ...defaultTheme.fontFamily.serif],
      },
      screens: {
        tall: { raw: "(min-width: 768px) and (min-height: 1200px)" },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwindcss-percentage-width"),
  ],
};
