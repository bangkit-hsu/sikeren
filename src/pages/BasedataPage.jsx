// Halaman ini sengaja dibuat terpisah dari alur aplikasi utama (tidak memakai Layout/AuthContext),
// supaya pengembangan di sini tidak mengganggu aplikasi e-Apel yang sudah berjalan.
// Ke depan, tambahkan konten/komponen baru langsung di file ini.
export default function BasedataPage() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 mx-auto rounded-full bg-moss-800 border-2 border-gold-500 flex items-center justify-center mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-gold-500">
            <path d="M4 21V6.5L12 3l8 3.5V21" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M9 21v-6h6v6M9 10h.01M12 10h.01M15 10h.01M9 13.5h.01M12 13.5h.01M15 13.5h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="font-display font-bold text-2xl text-ink">Basedata</h1>
        <p className="text-ink/60 text-sm mt-2">
          Halaman ini masih dalam pengembangan (under construction) dan berdiri sendiri, terpisah dari aplikasi e-Apel utama.
        </p>
      </div>
    </div>
  )
}
