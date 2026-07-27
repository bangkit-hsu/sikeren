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

// Menghitung jumlah hari kerja (Senin-Jumat) dalam satu bulan, dikurangi tanggal libur
export function hitungHariKerja(tahun, bulan, tanggalLiburSet) {
  const jumlahHari = new Date(tahun, bulan + 1, 0).getDate()
  let total = 0
  for (let d = 1; d <= jumlahHari; d++) {
    const tgl = new Date(tahun, bulan, d)
    const hari = tgl.getDay() // 0=Minggu, 6=Sabtu
    const iso = `${tahun}-${String(bulan + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    if (hari !== 0 && hari !== 6 && !tanggalLiburSet.has(iso)) {
      total += 1
    }
  }
  return total
}

export function daftarTanggalKerja(tahun, bulan, tanggalLiburSet) {
  const jumlahHari = new Date(tahun, bulan + 1, 0).getDate()
  const list = []
  for (let d = 1; d <= jumlahHari; d++) {
    const tgl = new Date(tahun, bulan, d)
    const hari = tgl.getDay()
    const iso = `${tahun}-${String(bulan + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    if (hari !== 0 && hari !== 6 && !tanggalLiburSet.has(iso)) {
      list.push(iso)
    }
  }
  return list
}
