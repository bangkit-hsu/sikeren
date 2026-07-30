import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Ganti 'repo-name' di bawah dengan nama repository GitHub kamu
// jika deploy ke GitHub Pages di https://<username>.github.io/<repo-name>/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'e-Apel - Absensi Apel Pegawai',
        short_name: 'e-Apel',
        description: 'Absensi apel pegawai berbasis pengenalan wajah dan radius lokasi',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#20371e',
        theme_color: '#20371e',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Model pengenalan wajah & foto gedung tidak di-precache (cukup besar) —
        // tetap dimuat normal dari jaringan/cache browser biasa saat dibutuhkan.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        globIgnores: ['models/**', 'images/**'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
    }),
  ],
  base: './',
})
