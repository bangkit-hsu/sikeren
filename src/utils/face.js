import * as faceapi from 'face-api.js'

const MODEL_URL = `${import.meta.env.BASE_URL}models`
let modelsLoaded = false

// Jarak Euclidean maksimum antar descriptor wajah agar dianggap "cocok".
// Makin kecil = makin ketat (mengurangi false-match, tapi bisa lebih sering gagal kenali).
export const AMBANG_KECOCOKAN = 0.5

export async function muatModelWajah() {
  if (modelsLoaded) return
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ])
  modelsLoaded = true
}

// Mengambil descriptor wajah (128 angka) dari satu frame video.
// Mengembalikan null jika tidak ada wajah yang terdeteksi pada frame tsb.
export async function ambilDescriptorDariVideo(videoEl) {
  const hasil = await faceapi
    .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor()
  return hasil ? Array.from(hasil.descriptor) : null
}

// Mencari kecocokan terbaik dari descriptor yang baru diambil dibanding daftar pegawai
// yang sudah punya data wajah tersimpan. daftarPegawai: [{ id, nip, nama, faceDescriptor: number[] }]
export function cariKecocokanTerbaik(descriptorBaru, daftarPegawai) {
  let terbaik = null
  let jarakTerbaik = Infinity
  for (const p of daftarPegawai) {
    if (!p.faceDescriptor || p.faceDescriptor.length !== 128) continue
    const jarak = faceapi.euclideanDistance(descriptorBaru, p.faceDescriptor)
    if (jarak < jarakTerbaik) {
      jarakTerbaik = jarak
      terbaik = p
    }
  }
  if (terbaik && jarakTerbaik <= AMBANG_KECOCOKAN) {
    return { pegawai: terbaik, jarak: jarakTerbaik }
  }
  return null
}

// Rata-rata beberapa descriptor (dari beberapa jepretan saat pendaftaran) agar lebih stabil.
export function rataRataDescriptor(daftarDescriptor) {
  const panjang = daftarDescriptor[0].length
  const hasil = new Array(panjang).fill(0)
  for (const d of daftarDescriptor) {
    for (let i = 0; i < panjang; i++) hasil[i] += d[i]
  }
  return hasil.map((v) => v / daftarDescriptor.length)
}

export async function nyalakanKamera(videoEl) {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
  videoEl.srcObject = stream
  await videoEl.play()
  return stream
}

export function matikanKamera(stream) {
  stream?.getTracks().forEach((t) => t.stop())
}
