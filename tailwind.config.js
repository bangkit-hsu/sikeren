/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1b2a24',
        paper: '#f6f4ee',
        moss: {
          50: '#f1f6ef',
          100: '#dfebda',
          200: '#bcd6b2',
          300: '#93bd85',
          400: '#6ba25c',
          500: '#4d873f',
          600: '#3a6b30',
          700: '#2f5528',
          800: '#274323',
          900: '#20371e',
        },
        clay: '#c1622d',
        sand: '#e7ddc7',
        gold: {
          400: '#d8b84a',
          500: '#c9a227',
          600: '#a8841c',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
