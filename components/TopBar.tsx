'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useSeller } from '@/context/SellerContext';

const NAV_LINKS = [
  { label: 'Beranda',   href: '/' },
  { label: 'Koleksi',   href: '/#konten' },
  { label: 'Terbaru',   href: '/?sort=terbaru' },
  { label: 'Komunitas', href: '/blog/era-keemasan' },
];

export default function TopBar() {
  const { totalItems } = useCart();
  const { user, logout }  = useAuth();
  const { allProducts }   = useSeller();
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setAvatarUrl(localStorage.getItem(`tki-avatar-${user.id}`));
    const handler = () => setAvatarUrl(localStorage.getItem(`tki-avatar-${user.id}`));
    window.addEventListener('avatar-changed', handler);
    return () => window.removeEventListener('avatar-changed', handler);
  }, [user?.id]);

  const q = search.toLowerCase();
  const productResults = search.length > 1
    ? allProducts.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.author ?? '').toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const storeResults = search.length > 1
    ? allProducts
        .filter(p => p.sellerId && p.sellerName &&
          (p.sellerName.toLowerCase().includes(q) || p.sellerId.toLowerCase().includes(q)))
        .reduce((acc, p) => {
          if (!acc.find(s => s.id === p.sellerId)) acc.push({ id: p.sellerId!, name: p.sellerName! });
          return acc;
        }, [] as { id: string; name: string }[])
        .slice(0, 2)
    : [];

  const hasResults = productResults.length > 0 || storeResults.length > 0;

  return (
    <header className="sticky top-0 z-40 bg-[#0D0D0F]/85 backdrop-blur-xl border-b border-white/[0.05] flex flex-col">
    <div className="h-[60px] flex items-center px-5 gap-4">

      {/* Mobile logo */}
      <Link href="/" className="lg:hidden flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 bg-[#D90429] rounded-[7px] flex items-center justify-center">
          <svg viewBox="0 0 32 32" className="w-4 h-4 text-white" fill="white"><path d="M16 6C16 6 9 4 4 6v18c5-2 12 0 12 0s7-2 12 0V6c-5-2-12 0-12 0z"/></svg>
        </div>
        <span className="font-display font-bold text-[#F2F2F0] text-[13px]">Toko Komik Indonesia</span>
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
        {showSearch && hasResults && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#141416] border border-white/[0.09] rounded-[14px] shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden z-50">
            {storeResults.length > 0 && (
              <>
                <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-white/25 uppercase tracking-widest">Toko</p>
                {storeResults.map(s => (
                  <Link key={s.id} href={`/toko/${s.id}`} onClick={() => setSearch('')}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.05] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[#D90429] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] text-white/80 font-medium truncate">{s.name}</p>
                      <p className="text-[11px] text-white/35">Toko Komik</p>
                    </div>
                  </Link>
                ))}
              </>
            )}
            {productResults.length > 0 && (
              <>
                {storeResults.length > 0 && <div className="border-t border-white/[0.06] mx-4" />}
                {storeResults.length > 0 && <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-white/25 uppercase tracking-widest">Produk</p>}
                {productResults.map(p => (
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
                      <p className="text-[11px] text-white/35 truncate">{p.author ?? ''} · {p.genre}</p>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Nav links — desktop ── */}
      <nav className="hidden xl:flex items-center gap-5 shrink-0">
        {NAV_LINKS.map(({ label, href }) => (
          <Link key={label} href={href}
            className={`text-[13px] font-medium transition-colors whitespace-nowrap ${
              label === 'Beranda'
                ? 'text-[#D90429] border-b border-[#D90429] pb-0.5'
                : 'text-white/45 hover:text-white/80'
            }`}>
            {label}
          </Link>
        ))}
      </nav>

      {/* ── Right actions ── */}
      <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">

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
        <Link href="/profile?tab=transaksi"
          className="w-9 h-9 flex items-center justify-center text-white/45 hover:text-white/80 transition-colors rounded-[10px] hover:bg-white/[0.05]">
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>

        {/* Avatar / Login */}
        {user ? (
          <div className="relative">
            <button onClick={() => setMenuOpen(v => !v)}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-red-600 flex items-center justify-center text-white text-[12px] font-bold border border-white/[0.12] hover:border-white/25 transition-colors overflow-hidden">
              {avatarUrl
                ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                : <span>{user.name.charAt(0).toUpperCase()}</span>
              }
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
          <div className="flex items-center gap-1.5">
            <Link href="/login"
              className="bg-[#D90429] text-white text-[12px] font-semibold px-3 py-1.5 rounded-[9px] hover:bg-[#B0021F] active:scale-95 transition-all duration-150">
              Masuk
            </Link>
            <Link href="/register"
              className="border border-white/[0.12] text-white/55 text-[12px] font-semibold px-3 py-1.5 rounded-[9px] hover:border-white/25 hover:text-white/80 active:scale-95 transition-all duration-150">
              Daftar
            </Link>
          </div>
        )}
      </div>
    </div>

    {/* Mobile search bar — always visible on mobile */}
    <div className="sm:hidden px-4 pb-3 relative">
      <svg className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
      </svg>
      <input
        type="text"
        placeholder="Cari komik atau kreator..."
        value={search}
        onChange={e => { setSearch(e.target.value); setShowSearch(true); }}
        onFocus={() => setShowSearch(true)}
        onBlur={() => setTimeout(() => setShowSearch(false), 150)}
        className="w-full bg-white/[0.05] border border-white/[0.08] rounded-[12px] pl-10 pr-4 py-2 text-[13px] text-white/70 placeholder-white/22 focus:outline-none focus:border-white/[0.18]"
      />
      {showSearch && hasResults && (
        <div className="absolute top-[calc(100%+4px)] left-4 right-4 bg-[#141416] border border-white/[0.09] rounded-[14px] shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden z-50">
          {storeResults.map(s => (
            <Link key={s.id} href={`/toko/${s.id}`} onClick={() => { setSearch(''); setShowSearch(false); }}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.05] transition-colors">
              <div className="w-8 h-8 rounded-full bg-[#D90429] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {s.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] text-white/80 font-medium truncate">{s.name}</p>
                <p className="text-[11px] text-white/35">🏪 Toko</p>
              </div>
            </Link>
          ))}
          {productResults.map(p => (
            <Link key={p.id} href={`/products/${p.id}`} onClick={() => { setSearch(''); setShowSearch(false); }}
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
                <p className="text-[11px] text-white/35 truncate">{(p.author ?? '')} · {p.genre}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
    </header>
  );
}
