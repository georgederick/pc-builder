export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#050507',
          900: '#0a0a0d',
          850: '#0e0e12',
          800: '#121217',
          700: '#1a1a21',
          600: '#23232c',
          500: '#2e2e39',
        },
        steel: {
          100: '#ececf2',
          200: '#d4d4de',
          300: '#b4b4c2',
          400: '#9393a3',
          500: '#72727f',
          600: '#55555f',
        },
        brand: {
          50: '#f5f0ff',
          100: '#ece2ff',
          200: '#d9c5ff',
          300: '#c2a0ff',
          400: '#a974ff',
          500: '#8f4dff',
          600: '#7a2ff0',
          700: '#6620cc',
          800: '#521ba3',
          900: '#3d1578',
        },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk Variable"', '"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(143,77,255,.5), 0 8px 30px -8px rgba(143,77,255,.55)',
        soft: '0 10px 40px -12px rgba(0,0,0,.7)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { opacity: '0', transform: 'scale(.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        spin360: {
          to: { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        pulseGlow: {
          '0%,100%': { opacity: '.55' },
          '50%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .6s cubic-bezier(.2,.7,.2,1) both',
        pop: 'pop .22s cubic-bezier(.2,.8,.2,1) both',
        float: 'float 6s ease-in-out infinite',
        'spin-slow': 'spin360 9s linear infinite',
        'spin-fast': 'spin360 2.2s linear infinite',
        shimmer: 'shimmer 1.6s linear infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'slide-in': 'slideIn .3s cubic-bezier(.2,.8,.2,1) both',
      },
    },
  },
  plugins: [],
};
