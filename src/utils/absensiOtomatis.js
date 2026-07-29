import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { daftarTanggalKerja, sudahLewatBatasApel } from './date'

// Untuk periode (bulan/tahun) yang sedang dilihat admin, cek setiap Hari Absen yang
// batas absen apel-nya sudah lewat (hari sebelumnya, atau hari ini setelah jam 08:00).
// Pegawai terdaftar yang tidak punya data absen pada hari itu otomatis dicatat "Tidak Apel".
export async function pastikanTidakApel(tahun, bulan, overrideHariAbsen) {
  const tanggalTerdampak = daftarTanggalKerja(tahun, bulan, overrideHariAbsen).filter((tgl) => sudahLewatBatasApel(tgl))
  if (tanggalTerdampak.length === 0) return

  const usersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'pegawai')))
  const pegawai = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
  if (pegawai.length === 0) return

  const bulanStr = `${tahun}-${String(bulan + 1).padStart(2, '0')}`
  const absensiSnap = await getDocs(collection(db, 'absensi'))
  const sudahAda = new Set(
    absensiSnap.docs
      .map((d) => d.data())
      .filter((a) => a.tanggal.startsWith(bulanStr))
      .map((a) => `${a.uid}|${a.tanggal}`),
  )

  const tugas = []
  for (const tgl of tanggalTerdampak) {
    for (const p of pegawai) {
      const kunci = `${p.id}|${tgl}`
      if (sudahAda.has(kunci)) continue
      sudahAda.add(kunci)
      tugas.push(
        addDoc(collection(db, 'absensi'), {
          uid: p.id,
          nama: p.nama,
          nip: p.nip || '',
          bagian: p.bagian || '',
          tanggal: tgl,
          jam: null,
          status: 'tidak_apel',
          keterangan: null,
          otomatis: true,
          dibuat: serverTimestamp(),
        }),
      )
    }
  }
  if (tugas.length > 0) await Promise.all(tugas)
  return tugas.length
}
