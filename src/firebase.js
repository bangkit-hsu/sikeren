import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Isi konfigurasi ini dengan konfigurasi project Firebase kamu.
// Buka: Firebase Console > Project Settings > General > Your apps > SDK setup and configuration
// Simpan nilai asli di file .env (lihat .env.example) — JANGAN commit kredensial asli ke repo publik.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
