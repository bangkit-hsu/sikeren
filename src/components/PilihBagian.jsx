import { useEffect, useRef, useState } from 'react'
import { DAFTAR_BAGIAN } from '../utils/bagian'

export default function PilihBagian({ value, onChange, required }) {
  const [teks, setTeks] = useState(value || '')
  const [buka, setBuka] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    setTeks(value || '')
  }, [value])

  useEffect(() => {
    function tutupJikaDiluar(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setBuka(false)
    }
    document.addEventListener('mousedown', tutupJikaDiluar)
    return () => document.removeEventListener('mousedown', tutupJikaDiluar)
  }, [])

  const hasilFilter = DAFTAR_BAGIAN.filter((b) => b.toLowerCase().includes(teks.toLowerCase()))

  function pilih(b) {
    setTeks(b)
    onChange(b)
    setBuka(false)
  }

  return (
    <div className="relative" ref={wrapRef}>
      <input
        value={teks}
        onChange={(e) => {
          setTeks(e.target.value)
          onChange('')
          setBuka(true)
        }}
        onFocus={() => setBuka(true)}
        required={required}
        placeholder="Ketik untuk mencari bagian…"
        className="w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-white focus:border-moss-600 outline-none"
        autoComplete="off"
      />
      {buka && hasilFilter.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-ink/15 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {hasilFilter.map((b) => (
            <li
              key={b}
              onMouseDown={() => pilih(b)}
              className="px-3 py-2 text-sm hover:bg-moss-50 cursor-pointer"
            >
              {b}
            </li>
          ))}
        </ul>
      )}
      {buka && hasilFilter.length === 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-ink/15 rounded-lg shadow-lg">
          <li className="px-3 py-2 text-sm text-ink/40">Tidak ditemukan, pilih dari daftar yang tersedia.</li>
        </ul>
      )}
    </div>
  )
}
