// Mengubah file gambar yang dipilih pengguna menjadi data URL JPEG yang sudah
// diperkecil ukurannya, supaya aman disimpan langsung sebagai field di dokumen Firestore
// (tanpa perlu Firebase Storage terpisah).
export function kompresGambarKeDataUrl(file, maksDimensi = 480, kualitas = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > height && width > maksDimensi) {
          height = Math.round((height * maksDimensi) / width)
          width = maksDimensi
        } else if (height >= width && height > maksDimensi) {
          width = Math.round((width * maksDimensi) / height)
          height = maksDimensi
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', kualitas))
      }
      img.onerror = () => reject(new Error('Gagal membaca gambar. Coba file lain.'))
      img.src = reader.result
    }
    reader.onerror = () => reject(new Error('Gagal membaca file.'))
    reader.readAsDataURL(file)
  })
}
