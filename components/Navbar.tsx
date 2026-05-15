'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled]  = useState(false);
  const [menuOpen, setMenuOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = () => setMenuOpen(false);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-[#0A0A0B]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.04)]'
        : 'bg-[#0A0A0B]'
    }`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[60px] flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link href="/" onClick={close}
          className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 bg-[#D90429] rounded-[10px] flex items-center justify-center shrink-0">
            <span className="font-display text-white font-bold text-sm tracking-tighter leading-none">KI</span>
          </div>
          <span className="font-display text-[#F2F2F0] font-semibold text-[15px] tracking-tight hidden sm:block group-hover:text-white transition-colors">
            Komik Indonesia
          </span>
        </Link>

        {/* ── Center nav — desktop ── */}
        <div className="hidden md:flex items-center gap-7">
          {[['/', 'Beranda'], ['/#produk', 'Jelajahi'], ['/#produk', 'Flash Sale']].map(([href, label]) => (
            <Link key={label} href={href}
              className="text-[13px] font-medium text-white/50 hover:text-white/90 transition-colors tracking-tight">
              {label}
            </Link>
          ))}
          {user?.role === 'seller' && (
            <Link href="/seller"
              className="text-[13px] font-medium text-[#D90429]/70 hover:text-[#D90429] transition-colors tracking-tight">
              Dashboard →
            </Link>
          )}
        </div>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-2">

          {/* Cart */}
          <Link href="/cart" onClick={close}
            className="relative w-9 h-9 flex items-center justify-center text-white/50 hover:text-white/90 transition-colors rounded-xl hover:bg-white/[0.06]">
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round"/>
              <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#D90429] text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>

          {/* Auth — desktop */}
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/profile" onClick={close}
                className="w-8 h-8 rounded-full bg-[#D90429]/15 border border-[#D90429]/25 flex items-center justify-center text-[#D90429] text-xs font-bold hover:bg-[#D90429]/25 transition-colors">
                {user.name.charAt(0).toUpperCase()}
              </Link>
              <button onClick={() => logout()}
                className="text-[12px] text-white/30 hover:text-white/60 transition-colors px-2 py-1.5">
                Keluar
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login"
                className="text-[13px] text-white/50 hover:text-white/80 transition-colors px-3 py-1.5">
                Masuk
              </Link>
              <Link href="/register"
                className="text-[13px] bg-white text-[#0A0A0B] font-semibold px-4 py-2 rounded-[12px] hover:bg-white/90 transition-colors leading-none">
                Daftar
              </Link>
            </div>
          )}

          {/* Hamburger — mobile */}
          <button onClick={() => setMenuOpen(v => !v)}
            className="sm:hidden w-9 h-9 flex items-center justify-center text-white/50 hover:text-white transition-colors rounded-xl hover:bg-white/[0.06]">
            {menuOpen ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="sm:hidden bg-[#111113]/98 backdrop-blur-xl border-t border-white/[0.06] px-5 py-4 space-y-0.5">
          {user ? (
            <>
              <Link href="/profile" onClick={close}
                className="flex items-center gap-3 px-3 py-3 rounded-[14px] hover:bg-white/[0.05] transition-colors">
                <div className="w-9 h-9 rounded-full bg-[#D90429]/15 border border-[#D90429]/25 flex items-center justify-center text-[#D90429] font-bold text-sm shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[#F2F2F0] text-sm font-medium truncate">{user.name}</p>
                  <p className="text-white/30 text-[11px] truncate">{user.email}</p>
                </div>
              </Link>
              <div className="h-px bg-white/[0.06] mx-3 my-2" />
              {[['/', 'Beranda'], ['/cart', `Keranjang${totalItems > 0 ? ` (${totalItems})` : ''}`]].map(([href, label]) => (
                <Link key={label} href={href} onClick={close}
                  className="block px-3 py-2.5 text-[13px] text-white/50 hover:text-white/80 hover:bg-white/[0.05] rounded-[12px] transition-colors">
                  {label}
                </Link>
              ))}
              {user.role === 'seller' && (
                <Link href="/seller" onClick={close}
                  className="block px-3 py-2.5 text-[13px] text-[#D90429]/70 hover:text-[#D90429] hover:bg-[#D90429]/[0.06] rounded-[12px] transition-colors">
                  Dashboard Seller →
                </Link>
              )}
              <div className="h-px bg-white/[0.06] mx-3 my-2" />
              <button onClick={() => { logout(); close(); }}
                className="w-full text-left px-3 py-2.5 text-[13px] text-red-400/70 hover:text-red-400 hover:bg-red-400/[0.06] rounded-[12px] transition-colors">
                Keluar
              </button>
            </>
          ) : (
            <>
              {[['/', 'Beranda'], ['/cart', 'Keranjang']].map(([href, label]) => (
                <Link key={label} href={href} onClick={close}
                  className="block px-3 py-2.5 text-[13px] text-white/50 hover:text-white/80 hover:bg-white/[0.05] rounded-[12px] transition-colors">
                  {label}
                </Link>
              ))}
              <div className="h-px bg-white/[0.06] mx-3 my-2" />
              <Link href="/login" onClick={close}
                className="block px-3 py-2.5 text-[13px] text-white/50 hover:text-white/80 hover:bg-white/[0.05] rounded-[12px] transition-colors">
                Masuk
              </Link>
              <Link href="/register" onClick={close}
                className="block text-center bg-white text-[#0A0A0B] font-semibold py-2.5 px-3 rounded-[14px] text-[13px] mt-2 hover:bg-white/90 transition-colors">
                Daftar Sekarang
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
