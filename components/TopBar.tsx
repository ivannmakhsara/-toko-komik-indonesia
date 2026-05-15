'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useSeller } from '@/context/SellerContext';

const NAV_LINKS = ['Beranda', 'Koleksi', 'Terbaru', 'Komunitas'];

export default function TopBar() {
  const { totalItems } = useCart();
  const { user, logout }  = useAuth();
  const { allProducts }   = useSeller();
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const results = search.length > 1
    ? allProducts.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.author.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <header className="sticky top-0 z-30 bg-[#0D0D0F]/85 backdrop-blur-xl border-b border-white/[0.05] h-[60px] flex items-center px-5 gap-4">

      {/* Mobile logo */}
      <Link href="/" className="lg:hidden flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 bg-[#D90429] rounded-[7px] flex items-center justify-center">
          <svg viewBox="0 0 32 32" className="w-4 h-4 text-white" fill="white"><path d="M16 6C16 6 9 4 4 6v18c5-2 12 0 12 0s7-2 12 0V6c-5-2-12 0-12 0z"/></svg>
        </div>
        <span className="font-display font-bold text-[#F2F2F0] text-[13px]">Toko Komik</span>
      </Link>

      {/* ── Search ── */}
      <div className="flex-1 max-w-2xl relative hidden sm:block">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          placeholder="Cari komik, karakter, atau kreator..."
          value={search}
          onChange={e => { setSearch(e.target.value); setShowSearch(true); }}
          onFocus={() => setShowSearch(true)}
          onBlur={() => setTimeout(() => setShowSearch(false), 150)}
          className="w-full bg-white/[0.05] border border-white/[0.08] rounded-[12px] pl-10 pr-16 py-2 text-[13px] text-white/70 placeholder-white/22 focus:outline-none focus:border-white/[0.18] focus:bg-white/[0.07] transition-all"
        />
        <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-white/[0.05] border border-white/[0.08] text-white/22 text-[10px] px-2 py-0.5 rounded-[5px] font-mono tracking-tight">
          Ctrl K
        </kbd>

        {/* Search dropdown */}
        {showSearch && results.length > 0 && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#141416] border border-white/[0.09] rounded-[14px] shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden z-50">
            {results.map(p => (
              <Link key={p.id} href={`/products/${p.id}`} onClick={() => setSearch('')}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.05] transition-colors">
                <div className="w-8 h-10 rounded-[6px] overflow-hidden shrink-0 border border-white/[0.07]"
                  style={{ background: `${p.color}AA` }}>
                  {(p.coverImage || p.cover) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={(p.coverImage || p.cover)!} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] text-white/80 font-medium truncate">{p.title}</p>
                  <p className="text-[11px] text-white/35 truncate">{p.author} · {p.genre}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Nav links — desktop ── */}
      <nav className="hidden xl:flex items-center gap-5 shrink-0">
        {NAV_LINKS.map((label, i) => (
          <Link key={label} href={i === 0 ? '/' : `/#`}
            className={`text-[13px] font-medium transition-colors whitespace-nowrap ${
              i === 0
                ? 'text-[#D90429] border-b border-[#D90429] pb-0.5'
                : 'text-white/45 hover:text-white/80'
            }`}>
            {label}
          </Link>
        ))}
      </nav>

      {/* ── Right actions ── */}
      <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
        {/* Mobile search toggle */}
        <button className="sm:hidden w-9 h-9 flex items-center justify-center text-white/45 hover:text-white/80 transition-colors rounded-[10px] hover:bg-white/[0.05]">
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Cart */}
        <Link href="/cart"
          className="relative w-9 h-9 flex items-center justify-center text-white/45 hover:text-white/80 transition-colors rounded-[10px] hover:bg-white/[0.05]">
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round"/>
            <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {totalItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-[#D90429] text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1 leading-none">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </Link>

        {/* Bell */}
        <button className="w-9 h-9 flex items-center justify-center text-white/45 hover:text-white/80 transition-colors rounded-[10px] hover:bg-white/[0.05]">
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Avatar / Login */}
        {user ? (
          <div className="relative">
            <button onClick={() => setMenuOpen(v => !v)}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-red-600 flex items-center justify-center text-white text-[12px] font-bold border border-white/[0.12] hover:border-white/25 transition-colors">
              {user.name.charAt(0).toUpperCase()}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-48 bg-[#141416] border border-white/[0.09] rounded-[14px] shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden z-50 py-1">
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-[13px] text-white/80 font-semibold truncate">{user.name}</p>
                  <p className="text-[11px] text-white/35 truncate">{user.email}</p>
                </div>
                <Link href="/profile" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-white/55 hover:text-white/80 hover:bg-white/[0.05] transition-colors">
                  Profil Saya
                </Link>
                {user.role === 'seller' && (
                  <Link href="/seller" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-white/55 hover:text-white/80 hover:bg-white/[0.05] transition-colors">
                    Dashboard Seller
                  </Link>
                )}
                <div className="border-t border-white/[0.06] mt-1 pt-1">
                  <button onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#D90429]/60 hover:text-[#D90429] hover:bg-[#D90429]/[0.06] transition-colors">
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login"
            className="bg-[#D90429] text-white text-[12px] font-semibold px-3.5 py-1.5 rounded-[9px] hover:bg-[#B0021F] active:scale-95 transition-all duration-150">
            Masuk
          </Link>
        )}
      </div>
    </header>
  );
}
