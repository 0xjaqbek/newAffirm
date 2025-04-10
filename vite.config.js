// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/newAffirm/',
  plugins: [react()],
  server: {
    base: '/newAffirm/',
    host: true,
    port: 5173, // możesz zmienić port, jeśli ten będzie zajęty
  },
})
