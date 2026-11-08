import type { Config } from 'tailwindcss';
import path from 'path';

export default {
  content: [
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
    path.join(__dirname, '../clientes/**/*.{js,ts,jsx,tsx}'),
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B1528',
          800: '#121B2F',
          700: '#1A2744',
          600: '#263860',
          500: '#3D4F7C',
        },
        champagne: {
          500: '#C5A059',
          400: '#D4B475',
          300: '#E2CA96',
          200: '#EFE0B9',
          100: '#FBF5E6',
        },
        surface: {
          canvas: '#F8FAFC',
          card: '#FFFFFF',
          muted: '#F1F5F9',
          border: '#E2E8F0',
        },
        status: {
          success: '#10B981',
          successBg: '#ECFDF5',
          successText: '#065F46',
          warning: '#F59E0B',
          warningBg: '#FFFBEB',
          warningText: '#92400E',
          danger: '#EF4444',
          dangerBg: '#FEF2F2',
          dangerText: '#DC2626',
        },
      },
      fontFamily: {
        display: ['"Satoshi"', 'system-ui', 'sans-serif'],
        sans: ['"General Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card-sm': '12px',
        'card': '16px',
        'card-lg': '24px',
        'card-xl': '32px',
        'pill': '9999px',
      },
      boxShadow: {
        'atelier-sm': '0 1px 3px rgba(11, 21, 40, 0.04), 0 4px 12px rgba(11, 21, 40, 0.03)',
        'atelier': '0 4px 6px -1px rgba(11, 21, 40, 0.05), 0 12px 24px -4px rgba(11, 21, 40, 0.07)',
        'atelier-lg': '0 20px 35px -8px rgba(11, 21, 40, 0.16), 0 10px 15px -3px rgba(11, 21, 40, 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config;

