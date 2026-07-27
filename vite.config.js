import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ganti 'repo-name' di bawah dengan nama repository GitHub kamu
// jika deploy ke GitHub Pages di https://<username>.github.io/<repo-name>/
export default defineConfig({
  plugins: [react()],
  base: './',
})
