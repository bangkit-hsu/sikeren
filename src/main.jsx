import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

// Begitu versi baru aplikasi terdeteksi (setelah deploy), langsung reload otomatis
// supaya pengguna tidak perlu menutup-buka ulang tab/aplikasi secara manual.
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true)
  },
  onRegisteredSW(swUrl, registration) {
    if (!registration) return
    // Browser hanya mengecek pembaruan Service Worker secara jarang/pasif secara default,
    // jadi di sini kita paksa cek berkala + setiap kali tab dibuka/difokuskan lagi,
    // supaya perubahan baru cepat terdeteksi tanpa perlu bersihkan cache manual.
    setInterval(() => registration.update(), 30 * 1000)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') registration.update()
    })
  },
})

// HashRouter dipakai supaya routing tetap berfungsi di GitHub Pages
// (static hosting tanpa server-side rewrite untuk client-side routing).
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
)
