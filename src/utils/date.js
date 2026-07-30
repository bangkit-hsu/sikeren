// Zona waktu kantor: WITA (Asia/Makassar, UTC+8) — dipakai supaya jam & tanggal absen
// konsisten untuk semua pegawai apa pun zona waktu yang tersetel di perangkat mereka.
const ZONA_WAKTU_KANTOR = 'Asia/Makassar'

function bagianWaktu(date, timeZone) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
  const bagian = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]))
  return {
    tanggalIso: `${bagian.year}-${bagian.month}-${bagian.day}`,
    jam: Number(bagian.hour),
    menit: Number(bagian.minute),
    detik: Number(bagian.second),
  }
}

export function waktuKantorSaatIni(date = new Date()) {
  return bagianWaktu(date, ZONA_WAKTU_KANTOR)
}

export function formatTanggal(date = new Date()) {
  return waktuKantorSaatIni(date).tanggalIso
}

export function formatJam(date = new Date()) {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: ZONA_WAKTU_KANTOR })
}

// Absen apel baru bisa dilakukan mulai jam 07:50 WITA.
export const JAM_MULAI_APEL = { jam: 7, menit: 50 }

export function apelSudahMulai(date = new Date()) {
  const { jam, menit } = waktuKantorSaatIni(date)
  return jam > JAM_MULAI_APEL.jam || (jam === JAM_MULAI_APEL.jam && menit >= JAM_MULAI_APEL.menit)
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
