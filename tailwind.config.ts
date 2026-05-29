/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        equil: {
          paper: '#F9F9FB',
          onyx: '#050505',
          mint: '#2D6A4F',
          coral: '#FF8A80',
          sage: '#E8F0E8',
          forest: '#1A2421',
          sunlight: '#FFF9E0',
        },
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'ui-sans-serif', 'system-ui'],
        display: ['var(--font-geist)', 'Helvetica Neue', 'Arial'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.06em',
        'tightest-extra': '-0.08em',
        widest: '0.1em',
      },
    },
  },
  plugins: [],
}
