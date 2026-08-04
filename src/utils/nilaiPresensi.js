import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

// Menghitung Pot. Presensi Kehadiran, Pot. Absensi Apel, dan Nilai Presensi (100% - keduanya) per NIP
// untuk satu periode bulan-tahun. Dipakai bersama oleh Nilai ASN, Penilaian Individu, dan Portal Pimpinan.
// Hasil: { [nip]: { potPresensi, potApel, nilaiPresensi } }
export async function muatPetaNilaiPresensi(bulanIdx, tahun) {
  const sippId = `${tahun}-${String(bulanIdx + 1).padStart(2, '0')}`
  const sippSnap = await getDoc(doc(db, 'sipp', sippId))
  const petaPresensi = {}
  if (sippSnap.exists()) {
    (sippSnap.data().data || []).forEach((p) => { petaPresensi[p.nip] = p.penguranganPresensi })
  }

  const bulanStr = `${tahun}-${String(bulanIdx + 1).padStart(2, '0')}`
  const absensiSnap = await getDocs(
    query(collection(db, 'absensi'), where('tanggal', '>=', `${bulanStr}-01`), where('tanggal', '<=', `${bulanStr}-31`)),
  )
  const jumlahTidakApel = {}
  absensiSnap.docs.forEach((d) => {
    const a = d.data()
    if (a.status === 'tidak_apel' && a.nip) jumlahTidakApel[a.nip] = (jumlahTidakApel[a.nip] || 0) + 1
  })

  const peta = {}
  const semuaNip = new Set([...Object.keys(petaPresensi), ...Object.keys(jumlahTidakApel)])
  semuaNip.forEach((nip) => {
    const potPresensi = petaPresensi[nip] ?? null
    const potApel = jumlahTidakApel[nip] != null ? Math.round(jumlahTidakApel[nip] * 0.5 * 100) / 100 : 0
    const nilaiPresensi = potPresensi != null ? Math.round((100 - potPresensi - potApel) * 100) / 100 : null
    peta[nip] = { potPresensi, potApel, nilaiPresensi }
  })
  return peta
}
