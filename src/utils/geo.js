// Menghitung jarak antara dua koordinat (meter) memakai formula Haversine
export function hitungJarakMeter(lat1, lng1, lat2, lng2) {
  const R = 6371000 // jari-jari bumi (meter)
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Menerjemahkan error geolokasi browser (GeolocationPositionError) menjadi
// pesan yang jelas dan actionable dalam Bahasa Indonesia.
function terjemahkanErrorLokasi(err) {
  if (err && typeof err.code === 'number') {
    if (err.code === 1) {
      return new Error('Akses lokasi ditolak. Izinkan akses lokasi untuk situs ini di pengaturan browser, lalu coba lagi.')
    }
    if (err.code === 2) {
      return new Error('Lokasi tidak dapat dibaca. Pastikan GPS sudah diaktifkan di perangkat, lalu coba lagi.')
    }
    if (err.code === 3) {
      return new Error('Waktu pencarian lokasi habis. Pastikan GPS aktif dan sinyal cukup, lalu coba lagi.')
    }
  }
  return new Error('Gagal mengambil lokasi. Pastikan GPS sudah diaktifkan dan akses lokasi diizinkan, lalu coba lagi.')
}

export function ambilLokasiSaatIni() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Perangkat ini tidak mendukung layanan lokasi.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          akurasi: pos.coords.accuracy,
        })
      },
      (err) => reject(terjemahkanErrorLokasi(err)),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  })
}
