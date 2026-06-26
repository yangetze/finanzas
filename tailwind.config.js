/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#0F0E0C',
          soft: '#1A1917',
          muted: '#242320',
        },
        border: '#2E2D2A',
        ink: {
          DEFAULT: '#E8E4D8',
          muted: '#8A8778',
          faint: '#5A5850',
        },
        gold: '#C8B97A',
        sage: '#7AB89E',
        coral: '#C87A7A',
        'amber-fin': '#C8A07A',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        mono: ['DM Mono', 'monospace'],
        ui: ['Inter', 'sans-serif'],
      },
      borderColor: {
        DEFAULT: '#2E2D2A',
      },
    },
  },
  plugins: [],
}
