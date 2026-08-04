import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import PegawaiApp from './pages/PegawaiApp.jsx'
import SetupAwal from './pages/SetupAwal.jsx'
import FaceLogin from './pages/FaceLogin.jsx'
import AbsensiPage from './pages/pegawai/AbsensiPage.jsx'
import RiwayatPage from './pages/pegawai/RiwayatPage.jsx'
import ProfilPage from './pages/pegawai/ProfilPage.jsx'
import RekapPage from './pages/admin/RekapPage.jsx'
import KoreksiPage from './pages/admin/KoreksiPage.jsx'
import AbsenHarianPage from './pages/admin/AbsenHarianPage.jsx'
import LokasiPage from './pages/admin/LokasiPage.jsx'
import HariAbsenPage from './pages/admin/HariAbsenPage.jsx'
import PegawaiPage from './pages/admin/PegawaiPage.jsx'
import BasedataPage from './pages/BasedataPage.jsx'
import PimpinanPage from './pages/PimpinanPage.jsx'
import PimpinanPortal from './pages/PimpinanPortal.jsx'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return null

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/app" element={<PegawaiApp />} />
      <Route path="/basedata/*" element={<BasedataPage />} />
      <Route path="/pimpinan" element={<PimpinanPage />} />
      <Route path="/pimpinan/portal" element={<PimpinanPortal />} />
      <Route path="/absen" element={<FaceLogin />} />
      <Route path="/login" element={<Login />} />
      <Route path="/setup" element={<SetupAwal />} />

      <Route path="/pegawai/absensi" element={
        <ProtectedRoute role="pegawai"><Layout><AbsensiPage /></Layout></ProtectedRoute>
      } />
      <Route path="/pegawai/riwayat" element={
        <ProtectedRoute role="pegawai"><Layout><RiwayatPage /></Layout></ProtectedRoute>
      } />
      <Route path="/pegawai/profil" element={
        <ProtectedRoute role="pegawai"><Layout><ProfilPage /></Layout></ProtectedRoute>
      } />

      <Route path="/admin/absen-harian" element={
        <ProtectedRoute role="admin"><Layout><AbsenHarianPage /></Layout></ProtectedRoute>
      } />
      <Route path="/admin/rekap" element={
        <ProtectedRoute role="admin"><Layout><RekapPage /></Layout></ProtectedRoute>
      } />
      <Route path="/admin/koreksi" element={
        <ProtectedRoute role="admin"><Layout><KoreksiPage /></Layout></ProtectedRoute>
      } />
      <Route path="/admin/lokasi" element={
        <ProtectedRoute role="admin"><Layout><LokasiPage /></Layout></ProtectedRoute>
      } />
      <Route path="/admin/hari-absen" element={
        <ProtectedRoute role="admin"><Layout><HariAbsenPage /></Layout></ProtectedRoute>
      } />
      <Route path="/admin/pegawai" element={
        <ProtectedRoute role="admin"><Layout><PegawaiPage /></Layout></ProtectedRoute>
      } />

      <Route path="*" element={
        <Navigate to={user ? (user.role === 'admin' ? '/admin/rekap' : '/pegawai/absensi') : '/'} replace />
      } />
    </Routes>
  )
}
