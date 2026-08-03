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
        <img
          src={`${import.meta.env.BASE_URL}images/logo-sikeren.png`}
          alt="SiKeren"
          className="w-12 h-12 mx-auto rounded-xl object-cover"
        />
        {eyebrow && <p className="text-xs font-mono uppercase tracking-wide text-gold-400 mt-3">{eyebrow}</p>}
        <h1 className="font-display font-bold text-2xl mt-1">{title}</h1>
        {subtitle && <p className="text-paper/80 text-sm mt-1">{subtitle}</p>}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-gold-500/40 to-transparent" />
    </div>
  )
}
