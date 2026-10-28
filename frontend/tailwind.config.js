/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm-paper': '#0C0A0E',
        'aged-parchment': '#221A26',
        'soft-cream': '#18131D',
        'crypt-card': '#1E1823',
        'crypt-hover': '#282030',
        'crypt-border': '#362A3B',
        marigold: {
          light: '#FFD175',
          DEFAULT: '#F5A623',
          dark: '#E08E0E',
        },
        tangerine: {
          light: '#FFA085',
          DEFAULT: '#FF5E36',
        },
        coral: {
          light: '#FFA3B5',
          DEFAULT: '#E64264',
          dark: '#B51C3E',
        },
        berry: {
          light: '#E87EB3',
          DEFAULT: '#9B2D62',
          dark: '#63153C',
        },
        botanical: {
          light: '#6FE0AC',
          DEFAULT: '#2E8560',
          dark: '#184F38',
        },
        turquoise: {
          light: '#7EE5DC',
          DEFAULT: '#38A9A0',
          dark: '#1B5B56',
        },
        ink: {
          DEFAULT: '#F7EFE2',
          muted: '#B8A6B6',
          light: '#7E6C7D',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Playfair Display', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        hand: ['Caveat', 'Patrick Hand', 'cursive'],
      },
      boxShadow: {
        'paper': '0 6px 18px rgba(0, 0, 0, 0.6), 0 0 15px rgba(245, 166, 35, 0.05)',
        'paper-lifted': '0 12px 32px rgba(0, 0, 0, 0.8), 0 0 25px rgba(245, 166, 35, 0.15)',
        'altar': '0 20px 48px rgba(0, 0, 0, 0.9), 0 0 40px rgba(245, 166, 35, 0.2)',
        'candle-glow': '0 0 35px rgba(245, 166, 35, 0.55), 0 0 10px rgba(255, 94, 54, 0.4)',
      }
    },
  },
  plugins: [],
}
