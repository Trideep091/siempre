/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm-paper': '#FFF3D8',
        'aged-parchment': '#E8D3AC',
        'soft-cream': '#FFFAEE',
        marigold: {
          light: '#FBE6B3',
          DEFAULT: '#F3A623',
          dark: '#C97D09',
        },
        tangerine: {
          light: '#FAD4C6',
          DEFAULT: '#ED7047',
        },
        coral: {
          light: '#F7D3D9',
          DEFAULT: '#DC6073',
          dark: '#9C2738',
        },
        berry: {
          light: '#E0C7D3',
          DEFAULT: '#713B55',
          dark: '#4A2337',
        },
        botanical: {
          light: '#CDE3D9',
          DEFAULT: '#36775B',
          dark: '#1F4D3B',
        },
        turquoise: {
          light: '#D2ECE9',
          DEFAULT: '#4A9C96',
          dark: '#1F5A56',
        },
        ink: {
          DEFAULT: '#332A27',
          muted: '#6B5D57',
          light: '#9C8E87',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Playfair Display', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        hand: ['Caveat', 'Patrick Hand', 'cursive'],
      },
      boxShadow: {
        'paper': '0 4px 12px rgba(51, 42, 39, 0.08), 0 1px 3px rgba(51, 42, 39, 0.06)',
        'paper-lifted': '0 10px 24px rgba(51, 42, 39, 0.12), 0 3px 6px rgba(51, 42, 39, 0.08)',
        'altar': '0 16px 36px rgba(51, 42, 39, 0.16), 0 6px 12px rgba(51, 42, 39, 0.1)',
      }
    },
  },
  plugins: [],
}

