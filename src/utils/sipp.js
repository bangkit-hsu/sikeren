import * as XLSX from 'xlsx'

// Membaca file Excel rekapitulasi presensi (format baku: 3 baris header lalu data),
// mengembalikan array ringkasan per pegawai. Mengikuti struktur kolom baku:
// Nama, NIP, Pangkat/Gol, Status, Jumlah Hari Kerja, Hadir, Cuti, TL, Perbaikan Presensi,
// Dianggap Tidak Hadir, Tidak Hadir, [Check In x6], [Check Out x6], Perbaikan Check Out,
// Alpa, Pengurangan Presensi, Pengurangan Apel, Nilai Akhir, Ket.
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
      tidakHadir: angka(b[10]),
      penguranganPresensi: angka(b[25]),
      penguranganApel: angka(b[26]),
      nilaiAkhir: angka(b[27]),
    })
  }
  if (hasil.length === 0) {
    throw new Error('Tidak ada baris data pegawai yang terbaca dari file ini.')
  }
  return hasil
}
