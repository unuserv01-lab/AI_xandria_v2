import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          primary: '#9333EA',
          mid: '#C026D3',
          dark: '#7C3AED',
        },
        blue: {
          dark: '#1E293B',
        },
        cyan: {
          accent: '#06B6D4',
        },
        bg: {
          dark: '#0F172A',
          card: '#1E293B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      animation: {
        'pulse-purple': 'pulse-purple 2s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 1.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-purple': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(147, 51, 234, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(147, 51, 234, 0.8)' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 30px rgba(251, 191, 36, 0.6)' },
          '50%': { boxShadow: '0 0 60px rgba(251, 191, 36, 1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
