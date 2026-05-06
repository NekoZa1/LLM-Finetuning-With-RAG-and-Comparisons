/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'Google Sans', 'system-ui', 'sans-serif'],
        display: ['Google Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ag: {
          root:    '#1B1B1F',
          surface: '#28292F',
          card:    '#2D2E36',
          hover:   '#35363F',
          border:  'rgba(255,255,255,.1)',
          blue:    '#8AB4F8',
          violet:  '#BB86FC',
          green:   '#81C995',
          amber:   '#FDD663',
          red:     '#F28B82',
          cyan:    '#78DCE8',
          text:    '#E3E3E3',
          muted:   '#9AA0A6',
          dim:     '#5F6368',
        },
      },
      keyframes: {
        fadeUp:   { from: { opacity:'0', transform:'translateY(12px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        fadeIn:   { from: { opacity:'0' }, to: { opacity:'1' } },
        spinR:    { to: { transform:'rotate(360deg)' } },
        modalIn:  { from: { opacity:'0', transform:'scale(.97) translateY(8px)' }, to: { opacity:'1', transform:'scale(1)' } },
        shimmer:  { '0%': { backgroundPosition:'-200% 0' }, '100%': { backgroundPosition:'200% 0' } },
        pulseDot: { '0%,80%,100%':{ transform:'scale(.6)',opacity:'.4' }, '40%':{ transform:'scale(1)',opacity:'1' } },
      },
      animation: {
        'fade-up':  'fadeUp .4s cubic-bezier(.22,1,.36,1) both',
        'fade-in':  'fadeIn .3s ease both',
        'spin-r':   'spinR 1s linear infinite',
        'modal-in': 'modalIn .3s cubic-bezier(.22,1,.36,1) both',
        'shimmer':  'shimmer 1.8s ease infinite',
        'dot':      'pulseDot 1.4s ease-in-out infinite',
      },
      backgroundImage: {
        'grad-action': 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        'grad-blue':   'linear-gradient(135deg, #8AB4F8, #BB86FC)',
      },
    },
  },
  plugins: [],
}