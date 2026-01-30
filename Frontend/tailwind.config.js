/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#facc14",
        "primary-content": "#000000",
        "secondary": "#3b82f6",
        "background-light": "#f8f8f5",
        "background-dark": "#111827",
        "surface-dark": "#1f2937",
        "input-bg": "#374151",
      },
      fontFamily: {
        'space': ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 10px rgba(250, 204, 20, 0.5)',
        'neon-strong': '0 0 20px rgba(250, 204, 20, 0.7)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(250, 204, 20, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(250, 204, 20, 0.8)' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
}
