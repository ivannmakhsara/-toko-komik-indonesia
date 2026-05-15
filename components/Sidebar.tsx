'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { label: 'Beranda',    href: '/',         icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { label: 'Jelajahi',   href: '/#produk',  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/></svg> },
  { label: 'Favorit',    href: '/profile?tab=favorit',    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { label: 'Koleksiku',  href: '/profile?tab=koleksi',    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { label: 'Transaksi',  href: '/profile?tab=transaksi',  icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round" strokeLinejoin="round"/><rect x="9" y="3" width="6" height="4" rx="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 12h6M9 16h4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { label: 'Wishlist',   href: '/profile?tab=favorit',    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> },
];

const GENRES = ['Aksi', 'Petualangan', 'Superhero', 'Fantasi', 'Horor', 'Slice of Life', 'Romantis', 'Komedi'];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[168px] bg-[#0D0D0F] border-r border-white/[0.05] flex-col z-40 hidden lg:flex">

      {/* ── Logo ── */}
      <Link href="/" className="flex items-center gap-2.5 px-4 py-[18px] border-b border-white/[0.05] shrink-0">
        <div className="w-8 h-8 bg-[#D90429] rounded-[9px] flex items-center justify-center shrink-0">
          {/* Open book icon */}
          <svg viewBox="0 0 32 32" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 6C16 6 9 4 4 6v18c5-2 12 0 12 0s7-2 12 0V6c-5-2-12 0-12 0z" fill="white" fillOpacity="0.9" stroke="none"/>
            <line x1="16" y1="6" x2="16" y2="24" stroke="#D90429" strokeWidth="1.5"/>
          </svg>
        </div>
        <div className="leading-tight">
          <p className="font-display font-bold text-[#F2F2F0] text-[11px] leading-[1.15]">Toko Komik</p>
          <p className="font-display font-bold text-[#F2F2F0] text-[11px] leading-[1.15]">Indonesia</p>
        </div>
      </Link>

      {/* ── Nav ── */}
      <nav className="flex-1 py-3 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="space-y-0.5 px-2 mb-6">
          {NAV.map(({ label, href, icon }) => {
            const active = pathname === '/' ? href === '/' : pathname.startsWith(href) && href !== '/';
            return (
              <Link key={label} href={href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all duration-150 group ${
                  label === 'Beranda' && pathname === '/'
                    ? 'text-[#D90429] bg-[#D90429]/10'
                    : active
                    ? 'text-[#D90429] bg-[#D90429]/10'
                    : 'text-white/45 hover:text-white/80 hover:bg-white/[0.05]'
                }`}>
                {(label === 'Beranda' && pathname === '/') || active && label !== 'Beranda' ? (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#D90429] rounded-r-full" />
                ) : null}
                <span className={label === 'Beranda' && pathname === '/' ? 'text-[#D90429]' : ''}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </div>

        {/* Genres */}
        <div className="px-5">
          <p className="text-[9px] font-bold text-white/25 tracking-[0.15em] uppercase mb-3">Genre</p>
          <div className="space-y-1">
            {GENRES.map(g => (
              <Link key={g} href={`/?genre=${g}`}
                className="block text-[12px] text-white/38 hover:text-white/70 transition-colors py-0.5 leading-snug">
                {g}
              </Link>
            ))}
            <Link href="/#produk"
              className="block text-[12px] text-[#D90429]/60 hover:text-[#D90429] transition-colors py-0.5 font-semibold mt-1">
              Lihat semua
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Premium card ── */}
      <div className="px-3 pb-4 shrink-0">
        <div className="bg-gradient-to-b from-[#1e1608] to-[#130e04] border border-amber-500/20 rounded-[14px] p-4 text-center">
          <div className="text-[22px] mb-2">👑</div>
          <p className="font-display font-bold text-amber-400 text-[12px] leading-tight mb-1.5">
            Toko Komik<br />Premium
          </p>
          <p className="text-white/30 text-[10px] leading-snug mb-3">
            Akses koleksi eksklusif dan konten spesial lainnya.
          </p>
          <button className="w-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-bold text-[11px] py-2 rounded-[9px] transition-all duration-150">
            Upgrade Sekarang
          </button>
        </div>
      </div>

      {/* ── Seller shortcut ── */}
      {user?.role === 'seller' && (
        <div className="px-3 pb-3 shrink-0">
          <Link href="/seller"
            className="flex items-center justify-center gap-2 w-full py-2 bg-[#D90429]/10 border border-[#D90429]/20 text-[#D90429] text-[12px] font-semibold rounded-[10px] hover:bg-[#D90429]/15 transition-colors">
            Dashboard →
          </Link>
        </div>
      )}
    </aside>
  );
}
