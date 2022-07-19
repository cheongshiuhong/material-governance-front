const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/features/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      sans: ['Russo One', ...defaultTheme.fontFamily.sans],
    },
    extend: {
      colors: {
        'white-smoke': '#f5f5f5',
        'translucent-light-gray': '#d0d0d0',
        'translucent-dark-gray': '#252525',
      },
    }
  },
  variants: {
    extend: {
      fontSize: ['hover']
    },
  },
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ]
}
