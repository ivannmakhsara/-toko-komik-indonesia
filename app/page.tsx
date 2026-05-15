'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSeller } from '@/context/SellerContext';
import { getOrders } from '@/lib/orders';
import ComicCard from '@/components/ComicCard';

const SLIDES = [
  { bg: 'from-red-700 to-red-950',    tag: 'Koleksi Terlengkap',      title: ['Superhero', 'Lokal Indonesia'],   sub: 'Gundala, Sri Asih, Godam — dan ratusan judul lainnya', cta: 'Jelajahi Koleksi', icon: '⚡' },
  { bg: 'from-amber-600 to-orange-800', tag: '🔥 Flash Sale',          title: ['Komik Klasik', 'Diskon Spesial'], sub: 'Edisi terbatas — stok sangat terbatas!',               cta: 'Lihat Flash Sale', icon: '🔥' },
  { bg: 'from-indigo-700 to-indigo-950', tag: 'Komikus Muda Indonesia', title: ['Karya Segar', 'Generasi Baru'],  sub: 'Dukung kreator lokal, bangga produk Indonesia',         cta: 'Dukung Sekarang',  icon: '🎨' },
];

const GENRE_PILLS = [
  { label: 'Semua', icon: '📚' }, { label: 'Aksi', icon: '⚡' }, { label: 'Petualangan', icon: '🗺️' },
  { label: 'Humor', icon: '😂' }, { label: 'Horor', icon: '👻' }, { label: 'Romantis', icon: '❤️' }, { label: 'Fantasi', icon: '🐉' },
];

const TOP_TOKO = [
  { rank: 1, name: 'Warung Komik Nusantara', kota: 'Jakarta',    produk: 247, rating: 4.9, sold: 1842 },
  { rank: 2, name: 'Toko Buku Pelangi',      kota: 'Bandung',    produk: 189, rating: 4.8, sold: 1203 },
  { rank: 3, name: 'Galeri Komik Surabaya',  kota: 'Surabaya',   produk: 156, rating: 4.7, sold: 987  },
  { rank: 4, name: 'Pojok Baca Yogya',       kota: 'Yogyakarta', produk: 134, rating: 4.6, sold: 743  },
  { rank: 5, name: 'Komik Medan Store',      kota: 'Medan',      produk: 98,  rating: 4.5, sold: 512  },
];

const HIGHLIGHTS = [
  { era: '1950-an',    icon: '🌟', title: 'Era Keemasan',        desc: 'R.A. Kosasih melahirkan Sri Asih (1954), superheroine pertama Indonesia.',          light: 'bg-amber-50',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700',   slug: 'era-keemasan'        },
  { era: '1960–70-an', icon: '⚡', title: 'Pahlawan Legendaris',  desc: 'Gundala, Wiro Sableng, Si Buta dari Goa Hantu mendominasi pasar.',                  light: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-100 text-red-700',       slug: 'pahlawan-legendaris' },
  { era: '2000-an',    icon: '🎭', title: 'Gelombang Baru',       desc: 'Benny & Mice dan Si Juki hadir dengan satire urban modern.',                         light: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700',     slug: 'gelombang-baru'      },
  { era: '2010-an+',   icon: '🚀', title: 'Era Digital',          desc: 'Garudayana & Nusantara 2044 membawa komik Indonesia ke panggung global.',             light: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700', slug: 'era-digital'         },
];

const RANK_MEDAL = ['🥇', '🥈', '🥉'];
const TABS = ['Untuk Kamu', 'Terbaru', 'Flash Sale'] as const;
type Tab = typeof TABS[number];

export default function HomePage() {
  const { allProducts } = useSeller();
  const [slide, setSlide]         = useState(0);
  const [genre, setGenre]         = useState('Semua');
  const [search, setSearch]       = useState('');
  const [tab, setTab]             = useState<Tab>('Untuk Kamu');
  const [chartTab, setChartTab]   = useState<'harian' | 'mingguan' | 'bulanan'>('mingguan');
  const [orders, setOrders]       = useState<import('@/lib/orders').Order[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [minPrice, setMinPrice]   = useState('');
  const [maxPrice, setMaxPrice]   = useState('');
  const [sortBy, setSortBy]       = useState<'relevan' | 'termurah' | 'termahal' | 'terbaru' | 'terlama' | 'az'>('relevan');
  const [condition, setCondition] = useState<'semua' | 'baru' | 'bekas'>('semua');

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { getOrders().then(setOrders); }, []);

  const chartData = useMemo(() => {
    const now = Date.now();
    const DAY = 86_400_000;
    const aggregate = (maxAge: number) => {
      const map: Record<string, number> = {};
      orders
        .filter(o => now - new Date(o.date).getTime() <= maxAge)
        .forEach(o => o.items.forEach(item => { map[item.title] = (map[item.title] || 0) + item.quantity; }));
      return Object.entries(map)
        .sort((a, b) => b[1] - a[1]).slice(0, 6)
        .map(([title, sold]) => ({ title, sold, color: allProducts.find(p => p.title === title)?.color ?? '#dc2626' }));
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
    const min = minPrice ? Number(minPrice.replace(/\D/g, '')) : 0;
    const max = maxPrice ? Number(maxPrice.replace(/\D/g, '')) : Infinity;
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

  const cur = SLIDES[slide];

  return (
    <div>
      {/* ── Announcement Bar ── */}
      <div className="bg-red-700 text-white text-xs text-center py-2 px-4 flex items-center justify-center gap-3">
        <span>📦 Gratis Ongkir untuk pembelian pertama!</span>
        <span className="hidden sm:inline text-red-400">|</span>
        <span className="hidden sm:inline">💳 Banyak promo pembayaran menanti</span>
        <a href="#produk" className="ml-2 underline font-bold hover:text-red-200">Belanja Sekarang →</a>
      </div>

      {/* ── Carousel ── */}
      <div className={`bg-gradient-to-r ${cur.bg} text-white relative overflow-hidden transition-all duration-700`}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)', backgroundSize: '24px 24px' }} />
        <div className="max-w-6xl mx-auto px-5 py-8 md:py-16 flex items-center justify-between relative z-10">
          <div className="max-w-xl">
            <p className="text-white/60 text-xs font-bold tracking-widest uppercase mb-2">{cur.tag}</p>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold leading-tight mb-3">
              {cur.title[0]}<br />{cur.title[1]}
            </h1>
            <p className="text-white/75 text-sm sm:text-base mb-5 hidden sm:block">{cur.sub}</p>
            <a href="#produk" className="inline-block bg-white text-gray-900 font-bold px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors text-sm shadow-lg">
              {cur.cta}
            </a>
          </div>
          <div className="hidden md:block text-[9rem] opacity-15 select-none leading-none">{cur.icon}</div>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === slide ? 'bg-white w-6' : 'bg-white/40 w-2'}`} />
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">

        {/* ── Genre Pills ── */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
          {GENRE_PILLS.map(g => (
            <button key={g.label} onClick={() => setGenre(g.label)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                genre === g.label
                  ? 'border-red-600 bg-red-50 text-red-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:text-red-600'
              }`}>
              <span className="text-base">{g.icon}</span>
              {g.label}
            </button>
          ))}
          {genre !== 'Semua' && (
            <button onClick={() => setGenre('Semua')}
              className="flex items-center gap-1 px-3 py-2.5 rounded-2xl border-2 border-dashed border-gray-300 text-xs text-gray-400 hover:text-gray-600 shrink-0">
              Semua ✕
            </button>
          )}
        </div>

        {/* ── 3-Column: Products (2/3) + Sidebar (1/3) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="produk">

          {/* Products */}
          <div className="lg:col-span-2">
            <div className="flex flex-col gap-3 mb-5">
              {/* Row 1: Tabs + Search + Filter toggle */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm w-fit">
                  {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                        tab === t ? 'bg-red-700 text-white shadow' : 'text-gray-500 hover:text-gray-800'
                      }`}>
                      {t === 'Flash Sale' ? '🔥 Flash Sale' : t}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 flex-1">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                    <input type="text" placeholder="Cari judul atau pengarang..." value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-red-400 bg-white shadow-sm" />
                    {search && (
                      <button onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">✕</button>
                    )}
                  </div>
                  <button onClick={() => setShowFilter(f => !f)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all shrink-0 ${
                      showFilter || minPrice || maxPrice || condition !== 'semua' || sortBy !== 'relevan'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}>
                    <span>⚙️</span>
                    <span className="hidden sm:inline">Filter</span>
                    {(minPrice || maxPrice || condition !== 'semua' || sortBy !== 'relevan') && (
                      <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {[minPrice||maxPrice?1:0, condition!=='semua'?1:0, sortBy!=='relevan'?1:0].reduce((a,b)=>a+b,0)}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Row 2: Filter panel */}
              {showFilter && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Price range */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">💰 Rentang Harga</p>
                      <div className="flex items-center gap-2">
                        <input type="text" placeholder="Min" value={minPrice}
                          onChange={e => setMinPrice(e.target.value.replace(/\D/g, ''))}
                          className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-red-400 min-w-0" />
                        <span className="text-gray-400 text-xs shrink-0">–</span>
                        <input type="text" placeholder="Max" value={maxPrice}
                          onChange={e => setMaxPrice(e.target.value.replace(/\D/g, ''))}
                          className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-red-400 min-w-0" />
                      </div>
                      <div className="flex gap-1.5 mt-2">
                        {[['s/d 20rb','','20000'],['20–50rb','20000','50000'],['50rb+','50000','']].map(([label, mn, mx]) => (
                          <button key={label} onClick={() => { setMinPrice(mn); setMaxPrice(mx); }}
                            className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${
                              minPrice===mn && maxPrice===mx ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}>{label}</button>
                        ))}
                      </div>
                    </div>

                    {/* Sort */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">↕️ Urutkan</p>
                      <div className="flex flex-wrap gap-1.5">
                        {([
                          ['relevan','Relevan'], ['termurah','Termurah'], ['termahal','Termahal'],
                          ['terbaru','Terbaru'], ['terlama','Terlama'], ['az','A–Z'],
                        ] as [typeof sortBy, string][]).map(([val, label]) => (
                          <button key={val} onClick={() => setSortBy(val)}
                            className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors ${
                              sortBy===val ? 'border-red-500 bg-red-50 text-red-700 font-semibold' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}>{label}</button>
                        ))}
                      </div>
                    </div>

                    {/* Condition */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">📦 Kondisi</p>
                      <div className="flex gap-1.5">
                        {([['semua','Semua'],['baru','Baru'],['bekas','Bekas']] as [typeof condition, string][]).map(([val, label]) => (
                          <button key={val} onClick={() => setCondition(val)}
                            className={`text-[10px] px-3 py-1.5 rounded-lg border transition-colors ${
                              condition===val ? 'border-red-500 bg-red-50 text-red-700 font-semibold' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}>{label}</button>
                        ))}
                      </div>
                      <button onClick={() => { setMinPrice(''); setMaxPrice(''); setSortBy('relevan'); setCondition('semua'); }}
                        className="mt-3 text-[10px] text-red-600 hover:underline">
                        Reset semua filter
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Active filter chips */}
              {(search || genre !== 'Semua' || minPrice || maxPrice || condition !== 'semua' || sortBy !== 'relevan') && (
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs text-gray-500">{displayProducts.length} komik ditemukan</span>
                  {search && <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">"{search}" <button onClick={() => setSearch('')} className="hover:text-red-600">✕</button></span>}
                  {genre !== 'Semua' && <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">{genre} <button onClick={() => setGenre('Semua')} className="hover:text-red-600">✕</button></span>}
                  {(minPrice || maxPrice) && <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">Harga <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="hover:text-red-600">✕</button></span>}
                  {condition !== 'semua' && <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">{condition} <button onClick={() => setCondition('semua')} className="hover:text-red-600">✕</button></span>}
                  {sortBy !== 'relevan' && <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">Urut: {sortBy} <button onClick={() => setSortBy('relevan')} className="hover:text-red-600">✕</button></span>}
                </div>
              )}
            </div>

            {displayProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {displayProducts.map(comic => <ComicCard key={comic.id} comic={comic} />)}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <p className="text-4xl mb-3">📭</p>
                <p className="font-medium">Komik tidak ditemukan</p>
                <p className="text-sm mt-1">Coba genre atau kata kunci lain</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="sticky top-20 space-y-5">

              {/* Chart Terlaris */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-800 text-sm">📊 Chart Terlaris</h2>
                  <div className="flex bg-gray-100 rounded-lg p-0.5">
                    {(['harian', 'mingguan', 'bulanan'] as const).map(t => (
                      <button key={t} onClick={() => setChartTab(t)}
                        className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${
                          chartTab === t ? 'bg-white shadow text-red-700' : 'text-gray-400'
                        }`}>
                        {t === 'harian' ? 'Hari' : t === 'mingguan' ? 'Minggu' : 'Bulan'}
                      </button>
                    ))}
                  </div>
                </div>

                {activeChart.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-3xl mb-2">📊</p>
                    <p className="text-sm text-gray-500">Belum ada data</p>
                    <p className="text-xs text-gray-400 mt-1">Terisi setelah ada transaksi</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {activeChart.map((item, i) => (
                      <div key={item.title} className="flex items-center gap-2.5">
                        <span className="w-5 text-center text-sm shrink-0">
                          {i < 3 ? RANK_MEDAL[i] : <span className="text-xs font-bold text-gray-300">{i + 1}</span>}
                        </span>
                        <div className="w-1.5 h-6 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{item.title}</p>
                          <div className="bg-gray-100 rounded-full h-1 mt-1.5">
                            <div className="h-1 rounded-full transition-all duration-700"
                              style={{ width: `${(item.sold / maxSold) * 100}%`, backgroundColor: item.color }} />
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 shrink-0">{item.sold}×</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Toko */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-800 text-sm">🏪 Top Toko Komik</h2>
                </div>
                <div className="space-y-2">
                  {TOP_TOKO.map(toko => (
                    <div key={toko.rank}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-colors ${
                        toko.rank === 1 ? 'bg-amber-50 border border-amber-200' : 'hover:bg-gray-50'
                      }`}>
                      <span className="text-base w-6 text-center shrink-0">
                        {toko.rank <= 3 ? RANK_MEDAL[toko.rank - 1] : <span className="text-xs font-bold text-gray-300">{toko.rank}</span>}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{toko.name}</p>
                        <p className="text-[10px] text-gray-400">{toko.kota} · {toko.produk} produk</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] font-bold text-amber-600">★ {toko.rating}</p>
                        <p className="text-[9px] text-gray-400">{toko.sold.toLocaleString('id-ID')}×</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/register"
                  className="mt-4 flex items-center justify-center gap-1 text-xs text-red-700 font-semibold hover:underline">
                  Buka toko kamu →
                </Link>
              </div>

            </div>
          </aside>
        </div>

        {/* ── Napak Tilas Komik Indonesia ── */}
        <section>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Napak Tilas Komik Indonesia</h2>
              <p className="text-sm text-gray-500">Perjalanan komik lokal dari masa ke masa</p>
            </div>
            <Link href="/info/blog" className="text-sm text-red-700 font-semibold hover:underline">
              Lihat Semua →
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {HIGHLIGHTS.map(h => (
              <Link key={h.era} href={`/blog/${h.slug}`}
                className={`${h.light} ${h.border} border rounded-xl p-5 block hover:shadow-md transition-shadow group`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{h.icon}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${h.badge}`}>{h.era}</span>
                </div>
                <p className="font-bold text-gray-800 text-sm mb-1.5 group-hover:text-red-700 transition-colors">{h.title}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{h.desc}</p>
                <p className="text-xs text-red-600 font-semibold mt-3">Baca selengkapnya →</p>
              </Link>
            ))}
          </div>
          <div className="bg-gray-800 text-white rounded-xl px-6 py-4 flex items-center gap-4">
            <span className="text-2xl shrink-0">💡</span>
            <p className="text-sm text-gray-300 leading-relaxed">
              <span className="text-white font-semibold">Tahukah kamu?</span>{' '}
              Komik Indonesia memiliki sejarah lebih dari 70 tahun dengan ratusan karakter ikonik yang
              mencerminkan keragaman budaya nusantara — dari superhero modern hingga pendekar silat legendaris.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
