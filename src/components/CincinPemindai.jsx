// Cincin emas berputar yang menandakan proses pemindaian wajah sedang berlangsung.
// Dipakai di layar Absensi (login wajah) dan Pendaftaran Mandiri.
export default function CincinPemindai({ className = '' }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`animate-spin ${className}`}
      style={{ animationDuration: '1.4s' }}
    >
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke="#c9a227"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="150 300"
      />
    </svg>
  )
}
