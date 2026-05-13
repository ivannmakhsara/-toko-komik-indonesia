import Link from 'next/link';

const COLS = [
  {
    title: 'Toko Komik Indonesia',
    items: [
      { label: 'Tentang Kami',                href: '#' },
      { label: 'Hak Kekayaan Intelektual',    href: '#' },
      { label: 'Karir',                        href: '#' },
      { label: 'Blog',                         href: '#' },
      { label: 'Program Afiliasi',             href: '#' },
      { label: 'Toko Komik untuk Bisnis',      href: '#' },
      { label: 'Solusi Marketing Komik',       href: '#' },
    ],
  },
  {
    title: 'Beli',
    items: [
      { label: 'Cara Berbelanja',              href: '#' },
      { label: 'Pembayaran COD',               href: '#' },
      { label: 'Bebas Ongkir',                 href: '#' },
      { label: 'Promo Hari Ini',               href: '#' },
      { label: 'Komik Lokal Pilihan',          href: '/' },
      { label: 'Flash Sale',                   href: '#' },
    ],
  },
  {
    title: 'Jual',
    items: [
      { label: 'Daftar sebagai Seller',        href: '/register' },
      { label: 'Pusat Edukasi Seller',         href: '/seller' },
      { label: 'Tambah Produk',                href: '/seller/products/add' },
      { label: 'Kelola Pesanan',               href: '/seller/orders' },
      { label: 'Promosi Toko',                 href: '#' },
    ],
  },
  {
    title: 'Bantuan & Panduan',
    items: [
      { label: 'Pusat Bantuan',                href: '#' },
      { label: 'Cara Pemesanan',               href: '#' },
      { label: 'Cara Pembayaran',              href: '#' },
      { label: 'Syarat dan Ketentuan',         href: '#' },
      { label: 'Kebijakan Privasi',            href: '#' },
      { label: 'Kebijakan Pengembalian',       href: '#' },
    ],
  },
];

const SOCIALS = [
  {
    label: 'Facebook',
    href: '#',
    color: 'hover:bg-blue-600 hover:text-white',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
      </svg>
    ),
  },
  {
    label: 'Twitter / X',
    href: '#',
    color: 'hover:bg-gray-800 hover:text-white',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: 'Pinterest',
    href: '#',
    color: 'hover:bg-red-600 hover:text-white',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: '#',
    color: 'hover:bg-pink-600 hover:text-white',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
        <circle cx="17.5" cy="6.5" r="1.5"/>
      </svg>
    ),
  },
];

const APP_STORES = [
  {
    label: 'Google Play',
    sub: 'GET IT ON',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M3.18 23.76c.3.17.64.24.99.19l12.6-11.44L13.23 9l-10.05 14.76zm16.54-10.01L16.9 12l2.82-1.75-10.8-6.2c-.46-.26-.96-.32-1.42-.2L16.9 12l2.82 1.75zM2.01 1.62C1.68 1.97 1.5 2.47 1.5 3.06v17.88c0 .59.18 1.09.51 1.44L2.1 22.47 13.23 11.5 2.1 1.53l-.09.09zM16.9 12l2.82 1.75-2.82 1.75-3.67-3.5 3.67-3.5z"/>
      </svg>
    ),
  },
  {
    label: 'App Store',
    sub: 'Download on the',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.19 1.28-2.17 3.81.03 3.02 2.65 4.03 2.68 4.04l-.06.27zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
  },
  {
    label: 'AppGallery',
    sub: 'EXPLORE IT ON',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 shrink-0">
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-6">

        {/* ── Main columns ── */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-10">

          {/* Link columns */}
          {COLS.map(col => (
            <div key={col.title}>
              <p className="font-bold text-gray-800 text-sm mb-4">{col.title}</p>
              <div className="space-y-2.5">
                {col.items.map(item => (
                  <Link key={item.label} href={item.href}
                    className="block text-sm text-gray-500 hover:text-red-700 transition-colors">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Keamanan & Privasi + Ikuti Kami + App */}
          <div className="col-span-2 space-y-6">

            {/* Keamanan */}
            <div>
              <p className="font-bold text-gray-800 text-sm mb-3">Keamanan & Privasi</p>
              <div className="flex flex-wrap gap-2">
                <div className="border-2 border-blue-700 rounded-lg px-3 py-2 text-center">
                  <p className="text-[9px] text-blue-700 font-black tracking-widest">PCI DSS</p>
                  <p className="text-[8px] text-blue-600 font-semibold">COMPLIANT</p>
                </div>
                <div className="border border-gray-300 rounded-lg px-2 py-1.5 text-center">
                  <p className="text-[8px] text-gray-500 font-bold">ISO</p>
                  <p className="text-[10px] text-gray-700 font-black">27001</p>
                </div>
                <div className="border border-gray-300 rounded-lg px-2 py-1.5 text-center">
                  <p className="text-[8px] text-gray-500 font-bold">ISO</p>
                  <p className="text-[10px] text-gray-700 font-black">27701</p>
                </div>
              </div>
            </div>

            {/* Ikuti Kami */}
            <div>
              <p className="font-bold text-gray-800 text-sm mb-3">Ikuti Kami</p>
              <div className="flex gap-2">
                {SOCIALS.map(s => (
                  <Link key={s.label} href={s.href} title={s.label}
                    className={`w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 transition-colors ${s.color}`}>
                    {s.icon}
                  </Link>
                ))}
              </div>
            </div>

            {/* Download App */}
            <div>
              <p className="font-bold text-gray-800 text-sm mb-1">Nikmati keuntungan lebih di aplikasi:</p>
              <ul className="text-xs text-gray-500 space-y-1 mb-3">
                <li className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Notifikasi pesanan real-time</li>
                <li className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Promo eksklusif aplikasi</li>
                <li className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Akses lebih cepat & mudah</li>
              </ul>
              <div className="space-y-2">
                {APP_STORES.map(store => (
                  <button key={store.label}
                    className="flex items-center gap-3 bg-gray-900 text-white rounded-xl px-4 py-2 hover:bg-gray-700 transition-colors w-full">
                    {store.icon}
                    <div className="text-left">
                      <p className="text-[9px] text-gray-400 leading-none">{store.sub}</p>
                      <p className="text-sm font-semibold leading-tight">{store.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-gray-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📚</span>
            <div>
              <p className="font-bold text-gray-800 text-sm leading-tight">Toko Komik Indonesia</p>
              <p className="text-xs text-gray-400">Bangga Produk Lokal 🇮🇩</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
            <Link href="#" className="hover:text-red-700 transition-colors">Pemberitahuan Privasi</Link>
            <Link href="#" className="hover:text-red-700 transition-colors">Hak Kekayaan Intelektual</Link>
            <Link href="#" className="hover:text-red-700 transition-colors">Mitra Toko Komik</Link>
            <Link href="#" className="hover:text-red-700 transition-colors">Media Sosial</Link>
          </div>

          <p className="text-xs text-gray-400">© 2026 Toko Komik Indonesia</p>
        </div>
      </div>
    </footer>
  );
}
