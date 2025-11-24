/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0F172A', // Deep Slate Blue
          accent: '#2563EB',  // Vibrant Azure
          secondary: '#0D9488', // Cool Teal
        },
        func: {
          success: '#10B981', // Emerald Growth
          danger: '#EF4444',  // Modern Crimson
          info: '#0EA5E9',    // Sky Blue
        },
        neutral: {
          bg: '#F8FAFC',           // Clean Porcelain
          card: '#FFFFFF',         // Pure White
          'text-primary': '#1E293B',   // Deep Slate
          'text-secondary': '#64748B', // Muted Slate
        }
      }
    },
  },
  plugins: [],
}
