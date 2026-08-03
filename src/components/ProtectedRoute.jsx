import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) {
    if (user.role === 'admin') return <Navigate to="/admin/rekap" replace />
    if (user.role === 'pegawai') return <Navigate to="/pegawai/absensi" replace />
    // Peran lain (mis. pimpinan) tidak punya halaman di aplikasi e-Apel ini — kembali ke halaman depan.
    return <Navigate to="/" replace />
  }
  return children
}
