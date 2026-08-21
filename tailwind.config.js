/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'float-pop': {
          '0%': { opacity: '0', transform: 'translate(-50%, 0px) scale(0.6)' },
          '30%': { opacity: '1', transform: 'translate(-50%, -24px) scale(1.15)' },
          '80%': { opacity: '1', transform: 'translate(-50%, -48px) scale(1)' },
          '100%': { opacity: '0', transform: 'translate(-50%, -64px) scale(0.8)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'float-pop': 'float-pop 0.9s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.25s ease-out forwards',
      },
    },
  },
  plugins: [],
};
