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
          100: '#E6E2FF',
          200: '#CDC5FF',
          300: '#B4A8FF',
          400: '#9B8BFF',
          500: '#826EFF',
          600: '#6858CC',
          700: '#6858CC',
          800: '#342C66',
          900: '#1A1633',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          100: '#D8D8DC',
          200: '#B1B1B9',
          300: '#8A8A96',
          400: '#636373',
          500: '#3C3C50',
          600: '#303040',
          700: '#242430',
          800: '#181820',
          900: '#0C0C10',
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
          foreground: 'hsl(var(--accent-foreground))',
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
          DEFAULT: '#9075FF',
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
