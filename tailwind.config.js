/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,ts}" // Escanea archivos HTML y TypeScript en src
  ],
  theme: {
    extend: {
      colors: {
        primary: "#001CB9", // Color personalizado
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', 'sans-serif'], // Fuente global
      },
      animation: {
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 2s',
        'text-shimmer': 'text-shimmer 3s linear infinite',
        'fade-in': 'fadeIn 1s ease-out',
      },
      keyframes: {
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': '0% 0%'
          },
          '50%': {
            'background-size': '400% 400%',
            'background-position': '100% 100%'
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'fadeIn': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'text-shimmer': {
          '0%': { 'background-position': '-200% center' },
          '100%': { 'background-position': '200% center' },
        },
      },
    },
  },
  plugins: [],
};
