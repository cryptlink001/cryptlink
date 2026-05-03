/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'cyber-black': '#0a0a0f',
        'cyber-purple': '#8b5cf6',
        'cyber-blue': '#22d3ee',
        'cyber-pink': '#ec4899',
        'cyber-green': '#10b981',
        'cyber-yellow': '#f59e0b',
        'cyber-gray': '#6b7280',
        'cyber-dark': '#1f2937',
        'cyber-darker': '#111827',
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)',
        'cyber-gradient-dark': 'linear-gradient(135deg, #1e1b4b 0%, #0e7490 100%)',
        'glass': 'rgba(255, 255, 255, 0.05)',
        'glass-dark': 'rgba(0, 0, 0, 0.3)',
      },
      boxShadow: {
        'cyber-glow': '0 0 20px rgba(139, 92, 246, 0.5)',
        'cyber-glow-blue': '0 0 20px rgba(34, 211, 238, 0.5)',
        'cyber-glow-pink': '0 0 20px rgba(236, 72, 153, 0.5)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'inner-glow': 'inset 0 0 20px rgba(139, 92, 246, 0.1)',
      },
      backdropBlur: {
        'glass': '8px',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(139, 92, 246, 0.8)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      fontFamily: {
        'cyber': ['Courier New', 'monospace'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
}
