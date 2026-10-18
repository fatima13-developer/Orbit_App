/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orbit: {
          primary: '#F97316',
          primaryDark: '#EA580C',
          deepAccent: '#C2410C',
          soft: '#FFEDD5',
          cream: '#FFF7ED',
          surface: '#FFFFFF',
          text: '#1C1917',
          textMuted: '#78716C',
          border: '#E7E5E4',
          success: '#16A34A',
          error: '#DC2626'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(249, 115, 22, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'warm': '0 4px 12px rgba(249, 115, 22, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'warm-lg': '0 10px 25px -3px rgba(249, 115, 22, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
