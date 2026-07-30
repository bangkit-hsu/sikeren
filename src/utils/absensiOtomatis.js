import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { apakahHariAbsen } from './date'

// Dipanggil secara manual oleh admin dari menu "Absen Harian".
// Untuk satu tanggal tertentu, cari pegawai terdaftar yang belum punya data absen pada
// tanggal itu, lalu catat mereka sebagai "Tidak Apel". Mengembalikan daftar pegawai yang
// baru ditandai (untuk ditampilkan ke admin), atau dilewati jika tanggal itu bukan Hari Absen.
export async function generateTidakApelUntukTanggal(tanggalIso, overrideHariAbsen) {
  if (!apakahHariAbsen(tanggalIso, overrideHariAbsen)) {
    return { dilewati: true, pegawaiDitandai: [] }
  }

  const usersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'pegawai')))
  const pegawai = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
  if (pegawai.length === 0) return { dilewati: false, pegawaiDitandai: [] }

  const absensiSnap = await getDocs(query(collection(db, 'absensi'), where('tanggal', '==', tanggalIso)))
  const sudahAda = new Set(absensiSnap.docs.map((d) => d.data().uid))

  const pegawaiDitandai = []
  const tugas = []
  for (const p of pegawai) {
    if (sudahAda.has(p.id)) continue
    pegawaiDitandai.push(p)
    tugas.push(
      addDoc(collection(db, 'absensi'), {
        uid: p.id,
        nama: p.nama,
        nip: p.nip || '',
        bagian: p.bagian || '',
        tanggal: tanggalIso,
        jam: null,
        status: 'tidak_apel',
        keterangan: null,
        otomatis: true,
        dibuat: serverTimestamp(),
      }),
    )
  }
  if (tugas.length > 0) await Promise.all(tugas)
  return { dilewati: false, pegawaiDitandai }
}
