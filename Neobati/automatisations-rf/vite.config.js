import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' → chemins relatifs, fonctionne partout sur GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: './',
})
