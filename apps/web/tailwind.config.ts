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
          dark: '#0A0A0F', // Updated: Hitam doff pekat
          card: '#111827',
          glass: 'rgba(15, 23, 42, 0.3)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      animation: {
        'pulse-purple': 'pulse-purple 3s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-purple': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(147, 51, 234, 0.3), 0 0 40px rgba(147, 51, 234, 0.1)' 
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(147, 51, 234, 0.6), 0 0 80px rgba(147, 51, 234, 0.2)' 
          },
        },
        'pulse-gold': {
          '0%, 100%': { 
            boxShadow: '0 0 30px rgba(251, 191, 36, 0.4), 0 0 60px rgba(251, 191, 36, 0.2)' 
          },
          '50%': { 
            boxShadow: '0 0 50px rgba(251, 191, 36, 0.8), 0 0 100px rgba(251, 191, 36, 0.3)' 
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(147, 51, 234, 0.3), 0 0 40px rgba(6, 182, 212, 0.1)' 
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(147, 51, 234, 0.6), 0 0 80px rgba(6, 182, 212, 0.2)' 
          },
        },
      },
      backdropBlur: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
      },
    },
  },
  plugins: [],
};

export default config;
