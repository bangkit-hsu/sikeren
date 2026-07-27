import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import SetupAwal from './pages/SetupAwal.jsx'
import AbsensiPage from './pages/pegawai/AbsensiPage.jsx'
import RiwayatPage from './pages/pegawai/RiwayatPage.jsx'
import RekapPage from './pages/admin/RekapPage.jsx'
import LokasiPage from './pages/admin/LokasiPage.jsx'
import LiburPage from './pages/admin/LiburPage.jsx'
import PegawaiPage from './pages/admin/PegawaiPage.jsx'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return null

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/setup" element={<SetupAwal />} />

      <Route path="/pegawai/absensi" element={
        <ProtectedRoute role="pegawai"><Layout><AbsensiPage /></Layout></ProtectedRoute>
      } />
      <Route path="/pegawai/riwayat" element={
        <ProtectedRoute role="pegawai"><Layout><RiwayatPage /></Layout></ProtectedRoute>
      } />

      <Route path="/admin/rekap" element={
        <ProtectedRoute role="admin"><Layout><RekapPage /></Layout></ProtectedRoute>
      } />
      <Route path="/admin/lokasi" element={
        <ProtectedRoute role="admin"><Layout><LokasiPage /></Layout></ProtectedRoute>
      } />
      <Route path="/admin/libur" element={
        <ProtectedRoute role="admin"><Layout><LiburPage /></Layout></ProtectedRoute>
      } />
      <Route path="/admin/pegawai" element={
        <ProtectedRoute role="admin"><Layout><PegawaiPage /></Layout></ProtectedRoute>
      } />

      <Route path="*" element={
        <Navigate to={user ? (user.role === 'admin' ? '/admin/rekap' : '/pegawai/absensi') : '/login'} replace />
      } />
    </Routes>
  )
}
