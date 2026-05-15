'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSeller } from '@/context/SellerContext';
import { getOrders } from '@/lib/orders';
import ComicCard from '@/components/ComicCard';

const GENRE_PILLS = [
  { label: 'Semua', icon: '📚' }, { label: 'Aksi', icon: '⚡' }, { label: 'Petualangan', icon: '🗺️' },
  { label: 'Humor', icon: '😄' }, { label: 'Horor', icon: '👻' }, { label: 'Romantis', icon: '❤️' },
  { label: 'Fantasi', icon: '🐉' },
];

const TOP_TOKO = [
  { rank: 1, name: 'Warung Komik Nusantara', kota: 'Jakarta',    sold: 1842, rating: 4.9 },
  { rank: 2, name: 'Toko Buku Pelangi',      kota: 'Bandung',    sold: 1203, rating: 4.8 },
  { rank: 3, name: 'Galeri Komik Surabaya',  kota: 'Surabaya',   sold: 987,  rating: 4.7 },
  { rank: 4, name: 'Pojok Baca Yogya',       kota: 'Yogyakarta', sold: 743,  rating: 4.6 },
  { rank: 5, name: 'Komik Medan Store',      kota: 'Medan',      sold: 512,  rating: 4.5 },
];

const HIGHLIGHTS = [
  { era: '1950-an', icon: '🌟', title: 'Era Keemasan',       desc: 'R.A. Kosasih melahirkan Sri Asih (1954), superheroine pertama Indonesia.', color: '#78350f', slug: 'era-keemasan' },
  { era: '1960–70', icon: '⚡', title: 'Pahlawan Legendaris', desc: 'Gundala, Wiro Sableng, Si Buta dari Goa Hantu mendominasi pasar.',         color: '#7f1d1d', slug: 'pahlawan-legendaris' },
  { era: '2000-an', icon: '🎭', title: 'Gelombang Baru',      desc: 'Benny & Mice dan Si Juki hadir dengan satire urban modern.',                color: '#1e3a5f', slug: 'gelombang-baru' },
  { era: '2010+',   icon: '🚀', title: 'Era Digital',         desc: 'Garudayana & Nusantara 2044 membawa komik Indonesia ke panggung global.',   color: '#1a1a2e', slug: 'era-digital' },
];

const TABS = ['Semua', 'Terbaru', 'Flash Sale'] as const;
type Tab = typeof TABS[number];

const RANK_MEDAL = ['🥇', '🥈', '🥉'];

export default function HomePage() {
  const { allProducts } = useSeller();

  const [genre, setGenre]           = useState('Semua');
  const [search, setSearch]         = useState('');
  const [tab, setTab]               = useState<Tab>('Semua');
  const [chartTab, setChartTab]     = useState<'harian' | 'mingguan' | 'bulanan'>('mingguan');
  const [orders, setOrders]         = useState<import('@/lib/orders').Order[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [minPrice, setMinPrice]     = useState('');
  const [maxPrice, setMaxPrice]     = useState('');
  const [sortBy, setSortBy]         = useState<'relevan' | 'termurah' | 'termahal' | 'terbaru' | 'terlama' | 'az'>('relevan');
  const [condition, setCondition]   = useState<'semua' | 'baru' | 'bekas'>('semua');

  useEffect(() => { getOrders().then(setOrders); }, []);

  const chartData = useMemo(() => {
    const now = Date.now(), DAY = 86_400_000;
    const aggregate = (maxAge: number) => {
      const map: Record<string, number> = {};
      orders
        .filter(o => now - new Date(o.date).getTime() <= maxAge)
        .forEach(o => o.items.forEach(item => { map[item.title] = (map[item.title] || 0) + item.quantity; }));
      return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6)
        .map(([title, sold]) => ({ title, sold, color: allProducts.find(p => p.title === title)?.color ?? '#D90429' }));
    };
    return { harian: aggregate(DAY), mingguan: aggregate(7 * DAY), bulanan: aggregate(30 * DAY) };
  }, [orders, allProducts]);

  const activeChart = chartData[chartTab];
  const maxSold     = Math.max(...activeChart.map(c => c.sold), 1);

  const displayProducts = useMemo(() => {
    let base = [...allProducts];
    if (genre !== 'Semua') base = base.filter(c => c.genre === genre);
    if (search) base = base.filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.author.toLowerCase().includes(search.toLowerCase())
    );
    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : Infinity;
    if (min > 0) base = base.filter(c => c.price >= min);
    if (max < Infinity) base = base.filter(c => c.price <= max);
    if (condition !== 'semua') base = base.filter(c => (c.condition ?? 'baru').toLowerCase() === condition);
    if (tab === 'Terbaru')    return base.sort((a, b) => b.year - a.year);
    if (tab === 'Flash Sale') return base.sort((a, b) => b.price - a.price).slice(0, 8);
    if (sortBy === 'termurah') return base.sort((a, b) => a.price - b.price);
    if (sortBy === 'termahal') return base.sort((a, b) => b.price - a.price);
    if (sortBy === 'terbaru')  return base.sort((a, b) => b.year - a.year);
    if (sortBy === 'terlama')  return base.sort((a, b) => a.year - b.year);
    if (sortBy === 'az')       return base.sort((a, b) => a.title.localeCompare(b.title, 'id'));
    return base;
  }, [allProducts, genre, search, tab, minPrice, maxPrice, sortBy, condition]);

  const heroComics = allProducts.slice(0, 5);
  const filterActive = !!(minPrice || maxPrice || condition !== 'semua' || sortBy !== 'relevan');

  return (
    <div className="bg-[#0A0A0B] min-h-screen">

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center">

        {/* Background ambient glows */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-[#D90429]/[0.07] blur-[130px]" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-[#D90429]/[0.04] blur-[110px]" />
          <div className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full bg-white/[0.015] blur-[100px]" />
        </div>

        {/* Grain */}
        <div className="absolute inset-0 opacity-[0.030] pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundSize: '220px 220px' }} />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 w-full grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 lg:gap-8 items-center py-24 lg:py-16">

          {/* Left — editorial text */}
          <div className="z-10 order-2 lg:order-1">
            {/* Label */}
            <div className="inline-flex items-center gap-2 border border-[#D90429]/25 bg-[#D90429]/[0.08] text-[#D90429] text-[11px] font-semibold px-3.5 py-1.5 rounded-full mb-8 tracking-[0.12em] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D90429] animate-pulse" />
              Platform Komik Lokal #1 Indonesia
            </div>

            {/* Headline */}
            <h1 className="font-display font-bold text-[clamp(48px,7vw,88px)] leading-[0.92] tracking-[-0.03em] text-[#F2F2F0] mb-6">
              Superhero
              <br />
              <span className="text-[#D90429]">Indonesia</span>
              <br />
              Ada di Sini
            </h1>

            <p className="text-white/45 text-[17px] leading-relaxed max-w-[440px] mb-10">
              Temukan ratusan komik lokal — dari Gundala hingga Garudayana.
              Dukung kreator Indonesia, bangga karya sendiri.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-4 flex-wrap">
              <a href="#produk"
                className="font-display bg-[#D90429] text-white font-semibold text-[14px] px-7 py-3.5 rounded-[14px] hover:bg-[#B0021F] active:scale-[0.97] transition-all duration-150 shadow-[0_0_32px_rgba(217,4,41,0.30)]">
                Jelajahi Koleksi
              </a>
              <a href="#produk"
                className="text-white/50 font-medium text-[14px] flex items-center gap-2 hover:text-white/80 transition-colors group">
                Flash Sale
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 mt-14 pt-10 border-t border-white/[0.07]">
              {[['500+', 'Judul Komik'], ['120+', 'Kreator Lokal'], ['50rb+', 'Pembaca']].map(([num, label]) => (
                <div key={label}>
                  <p className="font-display text-2xl font-bold text-[#F2F2F0] leading-none">{num}</p>
                  <p className="text-white/35 text-[11px] mt-1 tracking-wide">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating comic books */}
          <div className="relative h-[340px] sm:h-[420px] lg:h-[560px] order-1 lg:order-2 flex items-center justify-center lg:justify-end">
            {heroComics.length > 0 && (() => {
              const configs = [
                { cls: 'absolute left-[50%] top-[5%] w-[120px] h-[168px] sm:w-[150px] sm:h-[210px] rotate-[-8deg] z-10 shadow-[0_20px_60px_rgba(0,0,0,0.7)]', opacity: 0.6 },
                { cls: 'absolute left-[35%] top-[12%] w-[130px] h-[182px] sm:w-[165px] sm:h-[231px] rotate-[-2deg] z-20 shadow-[0_24px_72px_rgba(0,0,0,0.75)]', opacity: 0.85 },
                { cls: 'absolute left-[20%] sm:left-[22%] top-[8%] w-[140px] h-[196px] sm:w-[180px] sm:h-[252px] rotate-[4deg] z-30 shadow-[0_28px_80px_rgba(0,0,0,0.8)]', opacity: 1 },
                { cls: 'absolute left-[5%] sm:left-[8%] top-[18%] w-[120px] h-[168px] sm:w-[145px] sm:h-[203px] rotate-[9deg] z-20 shadow-[0_20px_56px_rgba(0,0,0,0.7)]', opacity: 0.7 },
                { cls: 'absolute right-0 bottom-[10%] w-[110px] h-[154px] sm:w-[135px] sm:h-[189px] rotate-[-5deg] z-10 shadow-[0_16px_48px_rgba(0,0,0,0.65)]', opacity: 0.55 },
              ];
              return configs.slice(0, heroComics.length).map((cfg, i) => {
                const c = heroComics[i];
                return (
                  <Link key={c.id} href={`/products/${c.id}`}
                    className={`${cfg.cls} rounded-[16px] overflow-hidden hover:scale-105 hover:z-40 transition-all duration-300`}
                    style={{ opacity: cfg.opacity }}>
                    {c.coverImage || c.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={(c.coverImage || c.cover)!} alt={c.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3"
                        style={{ background: `linear-gradient(155deg, ${c.color}CC 0%, ${c.color} 60%, #060608 100%)` }}>
                        <span className="text-2xl opacity-40">📖</span>
                        <p className="text-white/80 font-display font-semibold text-[10px] text-center leading-tight line-clamp-2">{c.title}</p>
                      </div>
                    )}
                  </Link>
                );
              });
            })()}
            {/* Ambient glow under books */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#D90429]/10 blur-[60px] rounded-full" />
          </div>
        </div>

        {/* Bottom fade to content */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0A0A0B] to-transparent pointer-events-none" />
      </section>

      {/* ══════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-24 space-y-14" id="produk">

        {/* ── Genre Pills ── */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {GENRE_PILLS.map(g => (
            <button key={g.label} onClick={() => setGenre(g.label)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-[13px] font-medium whitespace-nowrap transition-all duration-150 shrink-0 ${
                genre === g.label
                  ? 'border-[#D90429]/40 bg-[#D90429]/10 text-[#D90429]'
                  : 'border-white/[0.08] bg-white/[0.04] text-white/50 hover:text-white/80 hover:border-white/[0.14]'
              }`}>
              <span className="text-[13px]">{g.icon}</span>
              {g.label}
            </button>
          ))}
        </div>

        {/* ── Products + Sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">

          {/* Products column */}
          <div>

            {/* Toolbar */}
            <div className="flex flex-col gap-3 mb-7">
              {/* Row 1: Tabs + Search + Filter */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Tabs */}
                <div className="flex bg-white/[0.05] border border-white/[0.07] rounded-[14px] p-1 w-fit">
                  {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                      className={`px-4 py-1.5 rounded-[10px] text-[13px] font-medium transition-all whitespace-nowrap ${
                        tab === t
                          ? 'bg-[#D90429] text-white shadow-sm'
                          : 'text-white/40 hover:text-white/70'
                      }`}>
                      {t === 'Flash Sale' ? '🔥 Flash Sale' : t}
                    </button>
                  ))}
                </div>

                {/* Search + Filter */}
                <div className="flex gap-2 flex-1">
                  <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
                    </svg>
                    <input type="text" placeholder="Cari judul atau pengarang..." value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-[14px] pl-9 pr-9 py-2 text-[13px] text-white/80 placeholder-white/25 focus:outline-none focus:border-white/20 transition-colors" />
                    {search && (
                      <button onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors text-xs">✕</button>
                    )}
                  </div>
                  <button onClick={() => setShowFilter(f => !f)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[14px] border text-[13px] font-medium transition-all shrink-0 ${
                      showFilter || filterActive
                        ? 'border-[#D90429]/40 bg-[#D90429]/10 text-[#D90429]'
                        : 'border-white/[0.08] bg-white/[0.04] text-white/50 hover:text-white/70 hover:border-white/[0.14]'
                    }`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round"/>
                    </svg>
                    <span className="hidden sm:inline">Filter</span>
                    {filterActive && (
                      <span className="bg-[#D90429] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                        {[minPrice||maxPrice?1:0, condition!=='semua'?1:0, sortBy!=='relevan'?1:0].reduce((a,b)=>a+b,0)}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Row 2: Filter panel */}
              {showFilter && (
                <div className="bg-[#111113] border border-white/[0.08] rounded-[18px] p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                    {/* Price range */}
                    <div>
                      <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-3">Harga (Rp)</p>
                      <div className="flex items-center gap-2 mb-2.5">
                        <input type="text" placeholder="Min" value={minPrice}
                          onChange={e => setMinPrice(e.target.value.replace(/\D/g, ''))}
                          className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-[10px] px-3 py-1.5 text-[12px] text-white/70 placeholder-white/20 focus:outline-none focus:border-white/20 min-w-0" />
                        <span className="text-white/20 text-xs">–</span>
                        <input type="text" placeholder="Max" value={maxPrice}
                          onChange={e => setMaxPrice(e.target.value.replace(/\D/g, ''))}
                          className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-[10px] px-3 py-1.5 text-[12px] text-white/70 placeholder-white/20 focus:outline-none focus:border-white/20 min-w-0" />
                      </div>
                      <div className="flex gap-1.5">
                        {[['s/d 20rb','','20000'],['20–50rb','20000','50000'],['50rb+','50000','']].map(([label, mn, mx]) => (
                          <button key={label} onClick={() => { setMinPrice(mn); setMaxPrice(mx); }}
                            className={`text-[10px] px-2.5 py-1 rounded-[8px] border transition-colors ${
                              minPrice===mn && maxPrice===mx
                                ? 'border-[#D90429]/40 bg-[#D90429]/10 text-[#D90429]'
                                : 'border-white/[0.08] text-white/35 hover:border-white/20'
                            }`}>{label}</button>
                        ))}
                      </div>
                    </div>

                    {/* Sort */}
                    <div>
                      <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-3">Urutkan</p>
                      <div className="flex flex-wrap gap-1.5">
                        {([
                          ['relevan','Relevan'], ['termurah','Termurah'], ['termahal','Termahal'],
                          ['terbaru','Terbaru'], ['terlama','Terlama'], ['az','A–Z'],
                        ] as [typeof sortBy, string][]).map(([val, label]) => (
                          <button key={val} onClick={() => setSortBy(val)}
                            className={`text-[10px] px-2.5 py-1 rounded-[8px] border transition-colors ${
                              sortBy===val
                                ? 'border-[#D90429]/40 bg-[#D90429]/10 text-[#D90429] font-semibold'
                                : 'border-white/[0.08] text-white/35 hover:border-white/20'
                            }`}>{label}</button>
                        ))}
                      </div>
                    </div>

                    {/* Condition */}
                    <div>
                      <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-3">Kondisi</p>
                      <div className="flex gap-1.5 mb-4">
                        {([['semua','Semua'],['baru','Baru'],['bekas','Bekas']] as [typeof condition, string][]).map(([val, label]) => (
                          <button key={val} onClick={() => setCondition(val)}
                            className={`text-[11px] px-3.5 py-1.5 rounded-[10px] border transition-colors font-medium ${
                              condition===val
                                ? 'border-[#D90429]/40 bg-[#D90429]/10 text-[#D90429]'
                                : 'border-white/[0.08] text-white/35 hover:border-white/20'
                            }`}>{label}</button>
                        ))}
                      </div>
                      <button onClick={() => { setMinPrice(''); setMaxPrice(''); setSortBy('relevan'); setCondition('semua'); }}
                        className="text-[11px] text-[#D90429]/60 hover:text-[#D90429] transition-colors">
                        Reset filter
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Active chips */}
              {(search || genre !== 'Semua' || filterActive) && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[12px] text-white/30">{displayProducts.length} hasil</span>
                  {search && (
                    <span className="bg-white/[0.06] border border-white/[0.08] text-white/50 text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5">
                      &ldquo;{search}&rdquo;
                      <button onClick={() => setSearch('')} className="hover:text-white/80 transition-colors">✕</button>
                    </span>
                  )}
                  {genre !== 'Semua' && (
                    <span className="bg-white/[0.06] border border-white/[0.08] text-white/50 text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5">
                      {genre}
                      <button onClick={() => setGenre('Semua')} className="hover:text-white/80 transition-colors">✕</button>
                    </span>
                  )}
                  {(minPrice || maxPrice) && (
                    <span className="bg-white/[0.06] border border-white/[0.08] text-white/50 text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5">
                      Harga
                      <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="hover:text-white/80 transition-colors">✕</button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Product Grid */}
            {displayProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {displayProducts.map(comic => <ComicCard key={comic.id} comic={comic} />)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-5 text-3xl">📭</div>
                <p className="font-display text-lg font-semibold text-white/60 mb-1">Tidak ada komik</p>
                <p className="text-white/30 text-[13px]">Coba ubah filter atau kata kunci pencarian</p>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside>
            <div className="sticky top-[76px] space-y-4">

              {/* Chart terlaris */}
              <div className="bg-[#111113] border border-white/[0.07] rounded-[20px] p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-display font-semibold text-[#F2F2F0] text-[14px]">Chart Terlaris</p>
                  <div className="flex bg-white/[0.05] rounded-[10px] p-0.5">
                    {(['harian','mingguan','bulanan'] as const).map(t => (
                      <button key={t} onClick={() => setChartTab(t)}
                        className={`px-2 py-1 rounded-[8px] text-[10px] font-semibold transition-all ${
                          chartTab === t ? 'bg-[#D90429] text-white' : 'text-white/30 hover:text-white/60'
                        }`}>
                        {t === 'harian' ? 'Hari' : t === 'mingguan' ? 'Minggu' : 'Bulan'}
                      </button>
                    ))}
                  </div>
                </div>

                {activeChart.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-2xl mb-2">📊</p>
                    <p className="text-white/30 text-[12px]">Belum ada data</p>
                    <p className="text-white/20 text-[11px] mt-0.5">Terisi setelah ada transaksi</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {activeChart.map((item, i) => (
                      <div key={item.title} className="flex items-center gap-2.5">
                        <span className="w-4 text-center text-[12px] shrink-0">
                          {i < 3 ? RANK_MEDAL[i] : <span className="text-[10px] font-bold text-white/20">{i+1}</span>}
                        </span>
                        <div className="w-1 h-5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-white/80 truncate">{item.title}</p>
                          <div className="bg-white/[0.05] rounded-full h-1 mt-1">
                            <div className="h-1 rounded-full" style={{ width: `${(item.sold/maxSold)*100}%`, backgroundColor: item.color }} />
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-white/25 shrink-0">{item.sold}×</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Toko */}
              <div className="bg-[#111113] border border-white/[0.07] rounded-[20px] p-5">
                <p className="font-display font-semibold text-[#F2F2F0] text-[14px] mb-4">Top Toko Komik</p>
                <div className="space-y-1.5">
                  {TOP_TOKO.map(toko => (
                    <div key={toko.rank}
                      className={`flex items-center gap-2.5 p-2.5 rounded-[12px] transition-colors ${
                        toko.rank === 1 ? 'bg-amber-400/[0.07] border border-amber-400/[0.12]' : 'hover:bg-white/[0.04]'
                      }`}>
                      <span className="text-[13px] w-5 text-center shrink-0">
                        {toko.rank <= 3 ? RANK_MEDAL[toko.rank-1] : <span className="text-[9px] font-bold text-white/20">{toko.rank}</span>}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-white/75 truncate">{toko.name}</p>
                        <p className="text-[9px] text-white/30">{toko.kota}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] font-bold text-amber-400/70">★ {toko.rating}</p>
                        <p className="text-[9px] text-white/25">{toko.sold.toLocaleString('id-ID')}×</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/register"
                  className="mt-4 flex items-center justify-center gap-1 text-[12px] text-[#D90429]/60 hover:text-[#D90429] transition-colors font-medium">
                  Buka toko kamu →
                </Link>
              </div>

            </div>
          </aside>
        </div>

        {/* ══════════════════════════════════════════════
            NAPAK TILAS SECTION
        ══════════════════════════════════════════════ */}
        <section>
          {/* Header */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[#D90429] text-[11px] font-semibold tracking-[0.12em] uppercase mb-2">Sejarah &amp; Warisan</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#F2F2F0] tracking-tight leading-tight">
                Napak Tilas Komik Indonesia
              </h2>
            </div>
            <Link href="/info/blog"
              className="text-[13px] text-white/40 hover:text-white/70 transition-colors font-medium hidden sm:flex items-center gap-1 group">
              Lihat Semua
              <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
            {HIGHLIGHTS.map(h => (
              <Link key={h.era} href={`/blog/${h.slug}`}
                className="group relative rounded-[20px] overflow-hidden border border-white/[0.07] bg-[#111113] p-5 hover:border-white/[0.14] hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] transition-all duration-300">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${h.color}18 0%, transparent 70%)` }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">{h.icon}</span>
                    <span className="text-[9px] font-bold text-white/30 tracking-widest uppercase border border-white/[0.08] px-2 py-0.5 rounded-full">
                      {h.era}
                    </span>
                  </div>
                  <p className="font-display font-bold text-[#F2F2F0] text-[14px] mb-2 leading-snug tracking-tight group-hover:text-white transition-colors">
                    {h.title}
                  </p>
                  <p className="text-white/35 text-[12px] leading-relaxed line-clamp-3">{h.desc}</p>
                  <p className="text-[#D90429]/60 group-hover:text-[#D90429] text-[11px] font-semibold mt-3 transition-colors">Baca →</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Factoid bar */}
          <div className="bg-[#111113] border border-white/[0.07] rounded-[18px] px-6 py-4 flex items-center gap-5">
            <div className="w-10 h-10 bg-white/[0.04] rounded-[12px] flex items-center justify-center text-xl shrink-0">💡</div>
            <p className="text-[13px] text-white/35 leading-relaxed">
              <span className="text-white/70 font-semibold">Tahukah kamu?</span>{' '}
              Komik Indonesia memiliki sejarah lebih dari 70 tahun dengan ratusan karakter ikonik yang
              mencerminkan keragaman budaya nusantara.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
