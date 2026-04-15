/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        metro: {
          dark: '#0B0F1A',
          card: '#161B27',
          primary: '#9B5DE5', // Purple
          secondary: '#00BBF9', // Cyan/Blue
          accent: '#F15BB5', // Pink
          success: '#00F5D4', // Teal/Green
          warning: '#FEE440', // Yellow
        }
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(155, 93, 229, 0.2), 0 0 10px rgba(155, 93, 229, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(155, 93, 229, 0.6), 0 0 40px rgba(155, 93, 229, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
      }
    },
  },
  plugins: [],
}

