'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSeller } from '@/context/SellerContext';
import { getOrders } from '@/lib/orders';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatRupiah } from '@/lib/data';
import { Comic } from '@/lib/types';

type SortKey = 'relevan' | 'termurah' | 'termahal' | 'terbaru' | 'az';
const SORT_OPTS: { key: SortKey; label: string }[] = [
  { key: 'relevan',  label: 'Relevan'  },
  { key: 'terbaru',  label: 'Terbaru'  },
  { key: 'termurah', label: 'Termurah' },
  { key: 'termahal', label: 'Termahal' },
  { key: 'az',       label: 'A–Z'      },
];

/* ── Flash-sale countdown ─────────────────────────────────── */
function useCountdown() {
  const [deadline] = useState(() => Date.now() + 23 * 3600_000 + 48 * 60_000 + 6_000);
  const [now, setNow]  = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const r = Math.max(0, deadline - now);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    h: pad(Math.floor(r / 3600_000)),
    m: pad(Math.floor((r % 3600_000) / 60_000)),
    s: pad(Math.floor((r % 60_000) / 1_000)),
  };
}

/* ── Genre tabs ───────────────────────────────────────────── */
const GENRE_TABS = [
  { label: 'Semua',        icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> },
  { label: 'Aksi',         icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { label: 'Petualangan',  icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/></svg> },
  { label: 'Fantasi',      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { label: 'Horor',        icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm1-5h-2V7h2v4z" fill="currentColor" stroke="none"/></svg> },
  { label: 'Romantis',     icon: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/></svg> },
  { label: 'Komedi',       icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2" strokeLinecap="round"/><line x1="9" y1="9" x2="9.01" y2="9" strokeLinecap="round" strokeWidth="3"/><line x1="15" y1="9" x2="15.01" y2="9" strokeLinecap="round" strokeWidth="3"/></svg> },
  { label: 'Slice of Life', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 010 8h-1" strokeLinecap="round"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" strokeLinecap="round" strokeLinejoin="round"/><line x1="6" y1="1" x2="6" y2="4" strokeLinecap="round"/><line x1="10" y1="1" x2="10" y2="4" strokeLinecap="round"/><line x1="14" y1="1" x2="14" y2="4" strokeLinecap="round"/></svg> },
];

/* ── Comic cover placeholder ──────────────────────────────── */
function ComicCover({ comic, className = '' }: { comic: Comic; className?: string }) {
  const src = comic.coverImage || comic.cover;
  return (
    <div className={`overflow-hidden rounded-[14px] ${className}`}
      style={{ background: `linear-gradient(155deg, ${comic.color}BB 0%, ${comic.color} 60%, #060608 100%)` }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={comic.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-3">
          <span className="text-3xl opacity-30">📖</span>
          <p className="text-white/75 font-display font-semibold text-[10px] text-center leading-tight line-clamp-2 tracking-tight">
            {comic.title}
          </p>
          <p className="text-white/35 text-[9px] text-center">{comic.author}</p>
        </div>
      )}
    </div>
  );
}

/* ── Product card (for horizontal scroll rows) ────────────── */
function ProductCard({ comic }: { comic: Comic }) {
  const { addToCart }        = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const inWishlist = isInWishlist(comic.id);
  return (
    <div className="shrink-0 w-[176px] group cursor-pointer">
      <Link href={`/products/${comic.id}`}>
        <div style={{ aspectRatio: '3/4' }} className="rounded-[16px] overflow-hidden mb-3 border border-white/[0.06] relative">
          <ComicCover comic={comic} className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          {/* Wishlist badge */}
          <button
            onClick={e => { e.preventDefault(); inWishlist ? removeFromWishlist(comic.id) : addToWishlist(comic); }}
            className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all duration-150 active:scale-90 opacity-0 group-hover:opacity-100 ${
              inWishlist ? 'bg-[#D90429] border-[#D90429] text-white' : 'bg-black/40 border-white/[0.15] text-white/60 hover:text-white'
            }`}>
            <svg className="w-3.5 h-3.5" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p className="text-[13px] font-semibold text-white/85 line-clamp-1 tracking-tight leading-snug mb-0.5">{comic.title}</p>
        <p className="text-[11px] text-white/35 truncate mb-1.5">{comic.author}</p>
        <span className="inline-block text-[9px] font-semibold text-white/35 border border-white/[0.08] px-2 py-0.5 rounded-full uppercase tracking-wide mb-2.5">
          {comic.genre}
        </span>
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-bold text-[#F2F2F0]">{formatRupiah(comic.price)}</p>
          <div className="flex items-center gap-1">
            <span className="text-amber-400/70 text-[10px]">★</span>
            <span className="text-white/30 text-[10px]">{(comic.rating ?? 4.9).toFixed(1)}</span>
          </div>
        </div>
        <button
          onClick={() => addToCart(comic)}
          className="w-7 h-7 bg-[#D90429]/15 border border-[#D90429]/25 text-[#D90429] rounded-full flex items-center justify-center text-base font-light leading-none hover:bg-[#D90429] hover:text-white active:scale-90 transition-all duration-150">
          +
        </button>
      </div>
    </div>
  );
}

/* ── Horizontal scroll row ────────────────────────────────── */
function ProductRow({ title, products }: { title: string; products: Comic[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: -1 | 1) => ref.current?.scrollBy({ left: dir * 640, behavior: 'smooth' });

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-[18px] font-bold text-[#F2F2F0] tracking-tight">{title}</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll(-1)}
            className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white/80 hover:border-white/[0.16] transition-all text-lg leading-none">
            ‹
          </button>
          <button onClick={() => scroll(1)}
            className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white/80 hover:border-white/[0.16] transition-all text-lg leading-none">
            ›
          </button>
        </div>
      </div>
      <div ref={ref} className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {products.map(p => <ProductCard key={p.id} comic={p} />)}
      </div>
    </section>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function HomePage() {
  const { allProducts } = useSeller();
  const { h, m, s }    = useCountdown();
  const [orders, setOrders] = useState<import('@/lib/orders').Order[]>([]);
  const [genre, setGenre]   = useState('Semua');
  const [sort,  setSort]    = useState<SortKey>('relevan');
  const [slide, setSlide]   = useState(0);

  useEffect(() => { getOrders().then(setOrders); }, []);

  // Auto-advance hero slide
  useEffect(() => {
    const t = setInterval(() => setSlide(i => (i + 1) % 3), 5000);
    return () => clearInterval(t);
  }, []);

  const heroComics  = allProducts.slice(0, 3);
  const pilihan = useMemo(() => {
    let list = genre === 'Semua' ? [...allProducts] : allProducts.filter(c => c.genre === genre);
    if (sort === 'termurah')  list = list.sort((a, b) => a.price - b.price);
    if (sort === 'termahal')  list = list.sort((a, b) => b.price - a.price);
    if (sort === 'terbaru')   list = list.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    if (sort === 'az')        list = list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [allProducts, genre, sort]);
  const trending    = allProducts.slice(0, 5);
  const topWeekly   = allProducts.slice(0, 7);

  /* Chart — sold counts per title */
  const soldMap = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(o => o.items.forEach(i => { map[i.title] = (map[i.title] || 0) + i.quantity; }));
    return map;
  }, [orders]);

  return (
    <div className="bg-[#0A0A0B] min-h-screen">

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: 'clamp(340px, 45vh, 440px)' }}>

        {/* Atmospheric BG */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0B] via-[#1a0505] to-[#260808]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B]/70 via-transparent to-transparent" />
          <div className="absolute right-1/4 top-0 w-[500px] h-[500px] bg-[#D90429]/[0.12] rounded-full blur-[120px]" />
          <div className="absolute right-1/3 bottom-0 w-[300px] h-[300px] bg-amber-600/[0.06] rounded-full blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative h-full flex items-center px-6 lg:px-10 py-10 gap-8">

          {/* Left — editorial text */}
          <div className="flex-1 z-10 max-w-[480px]">
            <div className="inline-flex items-center gap-2 text-[#D90429]/80 text-[9px] font-bold tracking-[0.18em] uppercase mb-4">
              <span className="w-4 h-px bg-[#D90429]/60" />
              Universe Spotlight
            </div>
            <h1 className="font-display font-bold text-[clamp(36px,5vw,68px)] leading-[0.9] tracking-[-0.03em] text-[#F2F2F0] mb-4">
              Jagat<br />Nusantara
            </h1>
            <p className="text-white/45 text-[14px] leading-relaxed mb-7 max-w-[340px]">
              Para pelindung tanah air bangkit. Temukan kisah heroik dari semesta komik asli Indonesia.
            </p>
            <div className="flex items-center gap-3 flex-wrap mb-8">
              <a href="#konten"
                className="flex items-center gap-2 bg-[#D90429] text-white font-semibold text-[13px] px-6 py-2.5 rounded-[12px] hover:bg-[#B0021F] active:scale-[0.97] transition-all shadow-[0_0_24px_rgba(217,4,41,0.35)]">
                Jelajahi Universe
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
              <button className="flex items-center gap-2 border border-white/[0.14] text-white/60 font-semibold text-[13px] px-6 py-2.5 rounded-[12px] hover:border-white/25 hover:text-white/80 transition-all">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                Lihat Trailer
              </button>
            </div>
            {/* Slide dots */}
            <div className="flex items-center gap-2">
              {[0,1,2].map(i => (
                <button key={i} onClick={() => setSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? 'bg-white w-6' : 'bg-white/25 w-1.5'}`} />
              ))}
            </div>
          </div>

          {/* Right — floating comic covers */}
          {heroComics.length > 0 && (
            <div className="relative shrink-0 w-[280px] sm:w-[360px] h-[260px] sm:h-[320px] hidden sm:block">
              {heroComics.map((c, i) => {
                const cfgs = [
                  { cls: 'w-[110px] h-[154px] sm:w-[140px] sm:h-[196px] left-0 top-[10%] rotate-[-10deg] z-10', opc: 0.65 },
                  { cls: 'w-[125px] h-[175px] sm:w-[160px] sm:h-[224px] left-[30%] top-0 rotate-[0deg] z-20', opc: 1 },
                  { cls: 'w-[110px] h-[154px] sm:w-[135px] sm:h-[189px] right-0 top-[15%] rotate-[10deg] z-10', opc: 0.65 },
                ];
                return (
                  <Link key={c.id} href={`/products/${c.id}`}
                    className={`absolute ${cfgs[i].cls} rounded-[14px] shadow-[0_20px_56px_rgba(0,0,0,0.7)] hover:scale-105 hover:z-30 transition-all duration-300`}
                    style={{ opacity: cfgs[i].opc }}>
                    <ComicCover comic={c} className="w-full h-full" />
                  </Link>
                );
              })}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-16 bg-[#D90429]/15 blur-[40px] rounded-full" />
            </div>
          )}

          {/* Flash sale card */}
          <div className="absolute bottom-4 right-4 sm:right-6 bg-[#0D0D0F]/85 backdrop-blur-md border border-white/[0.09] rounded-[14px] px-4 py-3 flex items-center gap-4 z-30">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm">🔥</span>
                <p className="text-[13px] font-bold text-white/90 leading-none">Diskon Hingga 50%</p>
              </div>
              <p className="text-[11px] text-white/35">Flash Sale berakhir dalam</p>
            </div>
            <div className="flex items-center gap-1 font-display font-bold text-[22px] text-white leading-none shrink-0">
              <span>{h}</span>
              <span className="text-white/25 text-lg">:</span>
              <span>{m}</span>
              <span className="text-white/25 text-lg">:</span>
              <span>{s}</span>
              <button className="ml-1.5 w-6 h-6 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 text-base transition-colors">›</button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CONTENT
      ══════════════════════════════════════════ */}
      <div className="px-6 lg:px-8 pb-16 space-y-10" id="konten">

        {/* ── Genre tabs ── */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 pb-1" style={{ scrollbarWidth: 'none' }}>
          {GENRE_TABS.map(g => (
            <button key={g.label} onClick={() => setGenre(g.label)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap text-[13px] font-medium transition-all duration-150 shrink-0 ${
                genre === g.label
                  ? 'bg-[#D90429] border-[#D90429] text-white shadow-[0_0_16px_rgba(217,4,41,0.3)]'
                  : 'border-white/[0.08] bg-white/[0.04] text-white/45 hover:text-white/75 hover:border-white/[0.15]'
              }`}>
              <span className={genre === g.label ? 'text-white' : 'text-white/40'}>{g.icon}</span>
              {g.label}
            </button>
          ))}
          <button className="flex items-center gap-1.5 px-4 py-2 border border-white/[0.08] rounded-full text-[13px] text-white/40 hover:text-white/70 hover:border-white/[0.15] whitespace-nowrap shrink-0 transition-all">
            Lihat Semua
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        {/* ── Sort bar ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <span className="text-[11px] text-white/25 uppercase tracking-widest font-semibold shrink-0">Urutkan:</span>
          {SORT_OPTS.map(o => (
            <button key={o.key} onClick={() => setSort(o.key)}
              className={`text-[12px] px-3 py-1 rounded-full border transition-all whitespace-nowrap shrink-0 ${
                sort === o.key
                  ? 'bg-white/[0.10] border-white/[0.20] text-white font-semibold'
                  : 'border-white/[0.07] text-white/35 hover:text-white/60 hover:border-white/[0.12]'
              }`}>
              {o.label}
            </button>
          ))}
        </div>

        {/* ── Pilihan untukmu ── */}
        <ProductRow title="Pilihan untukmu" products={pilihan} />

        {/* ── Bottom 2-col: Trending + Top Weekly ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-8">

          {/* Sedang Trending */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[#D90429] text-lg">🔥</span>
              <h2 className="font-display text-[18px] font-bold text-[#F2F2F0] tracking-tight">Sedang Trending</h2>
              <Link href="/#" className="ml-auto text-[12px] text-white/35 hover:text-white/60 transition-colors flex items-center gap-1 font-medium">
                Lihat Semua
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {trending.map((c, i) => (
                <Link key={c.id} href={`/products/${c.id}`}
                  className="shrink-0 w-[140px] group relative">
                  <div className="relative mb-2.5" style={{ aspectRatio: '3/4' }}>
                    {/* Large rank number */}
                    <span className="absolute -bottom-2 -left-1 font-display text-[52px] font-bold leading-none text-white/[0.07] z-10 select-none">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="relative z-20 w-full h-full rounded-[14px] overflow-hidden border border-white/[0.06] group-hover:-translate-y-1 group-hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)] transition-all duration-250">
                      <ComicCover comic={c} className="w-full h-full" />
                    </div>
                  </div>
                  <p className="text-[12px] font-semibold text-white/75 line-clamp-2 leading-snug mt-1">{c.title}</p>
                  <p className="text-[10px] text-white/30 truncate mt-0.5">{c.author}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Top Komik Minggu Ini */}
          <section>
            <h2 className="font-display text-[16px] font-bold text-[#F2F2F0] tracking-tight mb-4">Top Komik Minggu Ini</h2>
            <div className="space-y-1">
              {topWeekly.map((c, i) => (
                <Link key={c.id} href={`/products/${c.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-[12px] hover:bg-white/[0.04] transition-colors group">
                  <span className={`font-display text-[13px] font-bold w-5 shrink-0 ${
                    i === 0 ? 'text-amber-400' : i === 1 ? 'text-white/50' : i === 2 ? 'text-amber-700/70' : 'text-white/20'
                  }`}>{i + 1}</span>
                  <div className="w-10 h-[52px] rounded-[8px] overflow-hidden shrink-0 border border-white/[0.06]">
                    <ComicCover comic={c} className="w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-white/75 truncate group-hover:text-white/90 transition-colors">{c.title}</p>
                    <p className="text-[10px] text-white/30 truncate">{c.author}</p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <span className="text-amber-400/60 text-[10px]">★</span>
                    <span className="text-white/30 text-[10px]">{(c.rating ?? 4.9).toFixed(1)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* ── Napak Tilas — compact ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[#D90429] text-[10px] font-semibold tracking-[0.14em] uppercase mb-1.5">Sejarah &amp; Warisan</p>
              <h2 className="font-display text-[18px] font-bold text-[#F2F2F0] tracking-tight">Napak Tilas Komik Indonesia</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { era: '1950-an', icon: '🌟', title: 'Era Keemasan',       color: '#78350f', slug: 'era-keemasan',        desc: 'Sri Asih lahir (1954)' },
              { era: '1960–70', icon: '⚡', title: 'Pahlawan Legendaris', color: '#7f1d1d', slug: 'pahlawan-legendaris', desc: 'Gundala & Wiro Sableng' },
              { era: '2000-an', icon: '🎭', title: 'Gelombang Baru',      color: '#1e3a5f', slug: 'gelombang-baru',      desc: 'Benny & Mice, Si Juki' },
              { era: '2010+',   icon: '🚀', title: 'Era Digital',         color: '#1a1a2e', slug: 'era-digital',         desc: 'Garudayana & global' },
            ].map(h => (
              <Link key={h.era} href={`/blog/${h.slug}`}
                className="group relative bg-[#111113] border border-white/[0.07] rounded-[18px] p-4 hover:border-white/[0.14] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all duration-250">
                <div className="absolute inset-0 rounded-[18px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${h.color}14 0%, transparent 70%)` }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{h.icon}</span>
                    <span className="text-[9px] font-bold text-white/25 tracking-[0.15em] uppercase">{h.era}</span>
                  </div>
                  <p className="font-display font-bold text-[#F2F2F0] text-[13px] mb-1 tracking-tight">{h.title}</p>
                  <p className="text-white/30 text-[11px]">{h.desc}</p>
                  <p className="text-[#D90429]/50 group-hover:text-[#D90429] text-[10px] font-semibold mt-3 transition-colors">Baca →</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
