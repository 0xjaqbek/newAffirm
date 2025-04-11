// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Original colors (keeping these for backward compatibility)
        background: '#121212',
        surface: '#1E1E1E',
        accent: '#8A9A5B', // olive
        text: '#F5F5F5',
        muted: '#8A8A8A',
        
        // Dark mode colors with prefixes
        "dark-background": '#121212',
        "dark-surface": '#1E1E1E',
        "dark-accent": '#8A9A5B', // olive
        "dark-text": '#F5F5F5',
        "dark-muted": '#8A8A8A',
        
        // Light mode colors with prefixes
        "light-background": '#F2F0EA', // Creamy background
        "light-surface": '#FFFFFF',
        "light-accent": '#556B2F', // Olive green for headings & CTA
        "light-highlight": '#FFC0CB', // Light pink for accents/highlights
        "light-contrast": '#4B0082', // Deep violet for contrast text
        "light-border": '#99775C', // Golden brown for borders
        "light-graphic": '#A8D5E3', // Sea blue for graphics
        "light-text": '#333333',
        "light-muted": '#666666',
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