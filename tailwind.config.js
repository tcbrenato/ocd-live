/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ocd: {
          orange: '#F26A04',
          'orange-dark': '#B34700',
          'orange-light': '#FF8226',
          anthracite: '#1F1F1F',
          paper: '#F7F5F2',
          line: '#E3DED7',
          gold: '#FFC46B',
          sand: '#E6E0D8',
          'dark-panel': '#1E1E1E',
          'world-gray': '#2A2A2A',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '16': '16px',
      },
      letterSpacing: {
        tightish: '-0.02em',
      },
    },
  },
  plugins: [],
};
