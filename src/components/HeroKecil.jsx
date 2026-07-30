// Header kompak bergaya sama dengan Hero di halaman depan (foto gedung + overlay hijau),
// dipakai di halaman Login dan Absensi Wajah supaya gaya tampilannya konsisten.
export default function HeroKecil({ eyebrow, title, subtitle }) {
  return (
    <div className="relative overflow-hidden bg-moss-900 text-paper">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/kantor-bupati-hsu.jpg)` }}
      />
      <div className="absolute inset-0 bg-moss-900/70" />
      <div className="relative max-w-sm mx-auto px-6 pt-10 pb-8 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-moss-800 border-2 border-gold-500 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gold-500">
            <path d="M12 2.5c-3 0-5.5 2.4-5.5 5.5 0 4 5.5 10.5 5.5 10.5S17.5 12 17.5 8c0-3.1-2.5-5.5-5.5-5.5z" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="12" cy="8" r="2.1" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </div>
        {eyebrow && <p className="text-xs font-mono uppercase tracking-wide text-gold-400 mt-3">{eyebrow}</p>}
        <h1 className="font-display font-bold text-2xl mt-1">{title}</h1>
        {subtitle && <p className="text-paper/80 text-sm mt-1">{subtitle}</p>}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-gold-500/40 to-transparent" />
    </div>
  )
}
