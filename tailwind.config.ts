import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      tablet: '768px',
      desktop: '1124px',
    },
    colors: {
      white: '#ffffff',
      offWhite: '#adb5bd',
      gold: '#ffba08',
      lightGold: '#faa307',
      black: '#000000',
      darkBlack: '#121212', // Darker for Jamie style background
      coal: '#1a1a1a',
      darkGrey: '#1E1E1E',
      grey: '#6c757d',
      red: '#FF515B',
      orange: '#FF9800',
      green: '#50D96E',
      lightGreen: '#7AE191',
      purple: '#E678EF',
      blue: '#2B65ED',
      lightBlue: '#78D2EF',
      // Transparent background accents for icons
      boxGold: 'rgba(255, 186, 8, 0.15)',
      boxPurple: 'rgba(247, 168, 254, 0.13)',
    },
    boxShadow: {
      sm: '0 1px 2px rgba(0,0,0,0.2)',
      card: '0 2px 6px rgba(0,0,0,0.4)',
      glowGold: '0 0 10px rgb(251, 234, 100)',
      glowPurple: '0 0 10px rgba(230, 120, 239, 0.4)',
      glowBlue: '0 0 10px rgba(43, 101, 237, 0.4)',
    },
    fontSize: {
      xxs: ['10px', { lineHeight: '20px', letterSpacing: '-0.02em' }],
      xs: ['12px', { lineHeight: '20px', letterSpacing: '-0.02em' }],
      sm: ['14px', { lineHeight: '22px', letterSpacing: '-0.02em' }],
      md: ['16px', { lineHeight: '24px', letterSpacing: '-0.02em' }],
      lg: ['20px', { lineHeight: '28px', letterSpacing: '-0.02em' }],
      xl: ['24px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
      '2xl': ['30px', { lineHeight: '38px', letterSpacing: '-0.02em' }],
      '3xl': ['36px', { lineHeight: '44px', letterSpacing: '-0.02em' }],
      '4xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em' }],
    },
    extend: {
      fontFamily: {
        gilroy: ['Gilroy', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
