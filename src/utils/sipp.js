import * as XLSX from 'xlsx'

// Membaca file Excel rekapitulasi presensi (format baku: 3 baris header lalu data),
// mengembalikan array LENGKAP per pegawai — semua kolom dari file, apa adanya, tanpa
// perhitungan ulang apa pun. Urutan kolom baku:
// A Nama, B NIP, C Pangkat/Gol, D Status, E Jumlah Hari Kerja, F Hadir, G Cuti, H TL,
// I Perbaikan Presensi, J Dianggap Tidak Hadir, K Tidak Hadir,
// L-Q Check In (Tepat Waktu, Terlambat, Terlambat Diterima, Dalam Area, Luar Area Diterima, Luar Area Ditolak),
// R-W Check Out (Tepat Waktu, Lebih Awal, Lebih Awal Diterima, Dalam Area, Luar Area Diterima, Luar Area Ditolak),
// X Perbaikan Check Out, Y Alpa, Z Pengurangan Presensi, AA Pengurangan Apel, AB Nilai Akhir, AC Ket.
export async function parseFileSipp(file) {
  const arrayBuffer = await file.arrayBuffer()
  const wb = XLSX.read(arrayBuffer, { type: 'array' })
  const namaSheet = wb.SheetNames[0]
  const ws = wb.Sheets[namaSheet]
  const baris = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })

  // Cari baris pertama data: baris yang kolom ke-2 (indeks 1, NIP) berisi angka/NIP panjang
  // dan kolom pertama (Nama) berupa teks — dicari mulai baris ke-10 (indeks 9) untuk melewati kop surat.
  let mulai = -1
  for (let i = 9; i < baris.length; i++) {
    const b = baris[i]
    if (b && typeof b[0] === 'string' && b[0].trim().length > 2 && b[1] != null && String(b[1]).replace(/\D/g, '').length >= 15) {
      mulai = i
      break
    }
  }
  if (mulai === -1) {
    throw new Error('Format file tidak dikenali. Pastikan memakai template rekapitulasi presensi baku.')
  }

  const hasil = []
  for (let i = mulai; i < baris.length; i++) {
    const b = baris[i]
    if (!b || !b[0] || typeof b[0] !== 'string') break // berhenti begitu data pegawai habis
    const angka = (v) => (typeof v === 'number' ? v : Number(v) || 0)
    hasil.push({
      nama: b[0],
      nip: b[1] != null ? String(b[1]) : '',
      pangkatGolongan: b[2] || '',
      statusKepegawaian: b[3] || '',
      jumlahHariKerja: angka(b[4]),
      hadir: angka(b[5]),
      cuti: angka(b[6]),
      tl: angka(b[7]),
      perbaikanPresensi: angka(b[8]),
      dianggapTidakHadir: angka(b[9]),
      tidakHadir: angka(b[10]),
      checkInTepatWaktu: angka(b[11]),
      checkInTerlambat: angka(b[12]),
      checkInTerlambatDiterima: angka(b[13]),
      checkInDalamArea: angka(b[14]),
      checkInLuarAreaDiterima: angka(b[15]),
      checkInLuarAreaDitolak: angka(b[16]),
      checkOutTepatWaktu: angka(b[17]),
      checkOutLebihAwal: angka(b[18]),
      checkOutLebihAwalDiterima: angka(b[19]),
      checkOutDalamArea: angka(b[20]),
      checkOutLuarAreaDiterima: angka(b[21]),
      checkOutLuarAreaDitolak: angka(b[22]),
      perbaikanCheckOut: angka(b[23]),
      alpa: angka(b[24]),
      penguranganPresensi: angka(b[25]),
      penguranganApel: angka(b[26]),
      nilaiAkhir: angka(b[27]),
      keterangan: b[28] || '',
    })
  }
  if (hasil.length === 0) {
    throw new Error('Tidak ada baris data pegawai yang terbaca dari file ini.')
  }
  return hasil
}
