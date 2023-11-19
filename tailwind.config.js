const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#E6E2FF',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#ebf7f6',
          100: '#d8f0ee',
          200: '#a7dbd6',
          300: '#7bc7be',
          400: '#339c8e',
          500: '#04715e',
          600: '#046652',
          700: '#03543e',
          800: '#01422d',
          900: '#01331f',
          950: '#002112',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          50: '#fcfaf5',
          100: '#faf5eb',
          200: '#f5e7ce',
          300: '#edd4af',
          400: '#deae7a',
          500: '#d1854b',
          600: '#bd723c',
          700: '#9c562a',
          800: '#7d3e1b',
          900: '#5e280f',
          950: '#3d1606',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: '#339c8e',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        green: {
          DEFAULT: '#46DC9D',
        },
        yellow: {
          DEFAULT: '#FBD048',
        },
        blue: {
          DEFAULT: '#5CB1FF',
        },
        purple: {
          DEFAULT: '#04715e',
        },
        red: {
          DEFAULT: '#F15980',
        },
        silver: {
          DEFAULT: '#F6F7FB',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      backgroundImage: {
        'theme-img': "url('/bg1.jpg')",
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
