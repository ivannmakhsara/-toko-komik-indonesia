import Link from 'next/link';

const COLS = [
  {
    title: 'Platform',
    items: [
      { label: 'Tentang Kami',          href: '/info/tentang-kami' },
      { label: 'Blog',                   href: '/info/blog' },
      { label: 'Karir',                  href: '/info/karir' },
      { label: 'Program Afiliasi',       href: '/info/program-afiliasi' },
    ],
  },
  {
    title: 'Belanja',
    items: [
      { label: 'Cara Berbelanja',        href: '/info/cara-berbelanja' },
      { label: 'Promo Hari Ini',         href: '/info/promo' },
      { label: 'Flash Sale',             href: '/#produk' },
      { label: 'Bebas Ongkir',           href: '/info/bebas-ongkir' },
    ],
  },
  {
    title: 'Berjualan',
    items: [
      { label: 'Daftar Seller',          href: '/register' },
      { label: 'Tambah Produk',          href: '/seller/products/add' },
      { label: 'Kelola Pesanan',         href: '/seller/orders' },
      { label: 'Pusat Edukasi',          href: '/seller' },
    ],
  },
  {
    title: 'Bantuan',
    items: [
      { label: 'Pusat Bantuan',          href: '/info/bantuan' },
      { label: 'Cara Pembayaran',        href: '/info/cara-pembayaran' },
      { label: 'Kebijakan Privasi',      href: '/info/kebijakan-privasi' },
      { label: 'Syarat & Ketentuan',     href: '/info/syarat-ketentuan' },
    ],
  },
];

const SOCIALS = [
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
        <circle cx="17.5" cy="6.5" r="1.5"/>
      </svg>
    ),
  },
  {
    label: 'Twitter / X',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0B] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-8">

        {/* ── Top: Brand + tagline + socials ── */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 mb-14">

          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-[#D90429] rounded-[10px] flex items-center justify-center shrink-0">
                <span className="font-display text-white font-bold text-[10px] tracking-tighter">TKI</span>
              </div>
              <span className="font-display text-[#F2F2F0] font-semibold text-[15px] tracking-tight">Toko Komik Indonesia</span>
            </div>
            <p className="text-white/30 text-[13px] leading-relaxed mb-6">
              Platform marketplace komik lokal terlengkap. Dari koleksi klasik hingga karya generasi baru — semua ada di sini.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-2">
              {SOCIALS.map(s => (
                <Link key={s.label} href={s.href} title={s.label}
                  className="w-8 h-8 rounded-[9px] bg-white/[0.05] border border-white/[0.07] flex items-center justify-center text-white/35 hover:text-white/80 hover:border-white/[0.16] hover:bg-white/[0.09] transition-all duration-150">
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {COLS.map(col => (
              <div key={col.title}>
                <p className="font-display text-[11px] font-semibold text-white/40 tracking-[0.1em] uppercase mb-4">
                  {col.title}
                </p>
                <div className="space-y-2.5">
                  {col.items.map(item => (
                    <Link key={item.label} href={item.href}
                      className="block text-[13px] text-white/35 hover:text-white/70 transition-colors leading-snug">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Security badges ── */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          {[['PCI DSS', 'Compliant'], ['ISO 27001', 'Certified'], ['SSL', 'Secured']].map(([title, sub]) => (
            <div key={title} className="border border-white/[0.07] rounded-[10px] px-3 py-2 flex items-center gap-2">
              <div className="w-5 h-5 rounded-[5px] bg-white/[0.06] flex items-center justify-center">
                <svg className="w-3 h-3 text-white/40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-[9px] font-bold text-white/50 leading-none">{title}</p>
                <p className="text-[8px] text-white/25 leading-none mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-white/20">
            © 2026 Toko Komik Indonesia. Bangga produk lokal 🇮🇩
          </p>
          <div className="flex flex-wrap justify-center gap-5">
            {[
              ['Privasi', '/info/kebijakan-privasi'],
              ['Hak Cipta', '/info/hak-kekayaan-intelektual'],
              ['Mitra', '/info/mitra'],
            ].map(([label, href]) => (
              <Link key={label} href={href}
                className="text-[12px] text-white/20 hover:text-white/50 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
