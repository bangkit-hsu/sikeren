export function formatTanggal(date = new Date()) {
  return date.toISOString().slice(0, 10) // YYYY-MM-DD
}

export function formatJam(date = new Date()) {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function namaBulan(bulan) {
  const nama = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ]
  return nama[bulan]
}

// Bawaan: Senin-Jumat dianggap Hari Absen, Sabtu-Minggu tidak — kecuali
// admin mengoverride tanggal tertentu secara manual lewat menu Hari Absen.
export function hariAbsenBawaan(tanggalIso) {
  const [t, b, d] = tanggalIso.split('-').map(Number)
  const hari = new Date(t, b - 1, d).getDay() // 0=Minggu, 6=Sabtu
  return hari !== 0 && hari !== 6
}

// overrideHariAbsen: objek { 'YYYY-MM-DD': true|false } — hanya berisi tanggal yang
// diubah admin dari nilai bawaannya. Tanggal yang tidak ada di objek ini memakai bawaan.
export function apakahHariAbsen(tanggalIso, overrideHariAbsen = {}) {
  if (Object.prototype.hasOwnProperty.call(overrideHariAbsen, tanggalIso)) {
    return overrideHariAbsen[tanggalIso]
  }
  return hariAbsenBawaan(tanggalIso)
}

// Menghitung jumlah Hari Absen dalam satu bulan sesuai pengaturan admin.
export function hitungHariKerja(tahun, bulan, overrideHariAbsen = {}) {
  const jumlahHari = new Date(tahun, bulan + 1, 0).getDate()
  let total = 0
  for (let d = 1; d <= jumlahHari; d++) {
    const iso = `${tahun}-${String(bulan + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    if (apakahHariAbsen(iso, overrideHariAbsen)) total += 1
  }
  return total
}

export function daftarTanggalKerja(tahun, bulan, overrideHariAbsen = {}) {
  const jumlahHari = new Date(tahun, bulan + 1, 0).getDate()
  const list = []
  for (let d = 1; d <= jumlahHari; d++) {
    const iso = `${tahun}-${String(bulan + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    if (apakahHariAbsen(iso, overrideHariAbsen)) list.push(iso)
  }
  return list
}

// Batas waktu absen apel pagi. Setelah jam ini, pegawai terdaftar yang belum
// absen pada hari itu dianggap "Tidak Apel" secara otomatis.
export const BATAS_JAM_APEL = '08:00'

// Mengecek apakah batas absen apel untuk tanggal (YYYY-MM-DD) tertentu sudah lewat.
// Tanggal di masa lalu selalu dianggap sudah lewat; tanggal di masa depan belum.
export function sudahLewatBatasApel(tanggalIso, sekarang = new Date()) {
  const hariIniStr = formatTanggal(sekarang)
  if (tanggalIso < hariIniStr) return true
  if (tanggalIso > hariIniStr) return false
  const [jam, menit] = BATAS_JAM_APEL.split(':').map(Number)
  const batas = new Date(sekarang)
  batas.setHours(jam, menit, 0, 0)
  return sekarang >= batas
}
