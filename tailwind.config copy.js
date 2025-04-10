// tailwind.config.js
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          background: '#121212',
          surface: '#1E1E1E',
          accent: '#8A9A5B', // olive
          text: '#F5F5F5',
          muted: '#8A8A8A',
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
          display: ['Space Grotesk', 'sans-serif'],
        },
      },
    },
    plugins: [],
    darkMode: 'class',
  }