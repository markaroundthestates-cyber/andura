/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        paper: '#faf7f1',
        paper2: '#f3ede1',
        ink: '#1a1815',
        ink2: '#3a342d',
        line: '#e7e0d0',
        brick: '#c8412e',
        brickdark: '#a8351f',
        olive: '#6b7142',
        deep: '#2d4a6b',
        succ: '#3d7a4a',
        warn: '#c89321',
        danger: '#c8412e',
      },
    },
  },
  plugins: [],
};
