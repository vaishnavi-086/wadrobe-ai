/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          900: '#121316',
          800: '#1a1b20',
          700: '#262830',
          600: '#383b46',
        },
        sand: {
          50: '#fbfaf8',
          100: '#f5f2eb',
          200: '#eae4d6',
          300: '#d9d0bc',
          800: '#5c5446',
          900: '#332e26',
        },
        terracotta: {
          DEFAULT: '#c05c46',
          hover: '#a84c37',
          light: '#fdf2ef',
        },
        sage: {
          DEFAULT: '#52796f',
          light: '#eef4f2',
          dark: '#354f52',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 2.5s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      }
    },
  },
  plugins: [],
}
