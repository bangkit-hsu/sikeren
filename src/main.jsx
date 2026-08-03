import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

// Begitu versi baru aplikasi terdeteksi (setelah deploy), langsung reload otomatis
// supaya pengguna tidak perlu menutup-buka ulang tab/aplikasi secara manual.
registerSW({
  immediate: true,
  onNeedRefresh() {
    window.location.reload()
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
