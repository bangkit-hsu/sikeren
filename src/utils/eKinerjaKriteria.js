// Mengubah kategori Hasil Akhir e-Kinerja (dari file yang diunggah di menu e-Kinerja)
// menjadi persentase, sesuai kriteria yang ditetapkan:
// Sangat Baik / Baik = 100%, Butuh Perbaikan = 80%, Kurang = 60%, Sangat Kurang = 40%
export function persenHasilAkhirEKinerja(nilai) {
  const v = (nilai || '').toString().trim().toUpperCase()
  if (!v || v.includes('BELUM')) return null
  if (v === 'SANGAT BAIK' || v === 'BAIK') return 100
  if (v === 'BUTUH PERBAIKAN') return 80
  if (v === 'SANGAT KURANG') return 40
  if (v === 'KURANG') return 60
  return null
}
