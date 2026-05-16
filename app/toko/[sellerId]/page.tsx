'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSeller } from '@/context/SellerContext';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { getOrders } from '@/lib/orders';
import { getReviewsForProduct } from '@/lib/reviews';
import { formatRupiah } from '@/lib/data';
import ComicCard from '@/components/ComicCard';

const TABS = ['Beranda', 'Produk', 'Ulasan'] as const;
type Tab = typeof TABS[number];

export default function StorePage() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const { allProducts } = useSeller();
  const { setIsOpen: openChat } = useChat();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('Beranda');
  const [search, setSearch] = useState('');
  const [following, setFollowing] = useState(false);

  /* ── Follow persistence ── */
  const followKey = user ? `tki-follows-${user.id}` : null;

  useEffect(() => {
    if (!followKey || !sellerId) return;
    try {
      const list: string[] = JSON.parse(localStorage.getItem(followKey) || '[]');
      setFollowing(list.includes(sellerId));
    } catch { /* ignore */ }
  }, [followKey, sellerId]);

  function handleToggleFollow() {
    if (!followKey || !sellerId) return;
    try {
      const list: string[] = JSON.parse(localStorage.getItem(followKey) || '[]');
      const next = list.includes(sellerId)
        ? list.filter(id => id !== sellerId)
        : [...list, sellerId];
      localStorage.setItem(followKey, JSON.stringify(next));
      setFollowing(next.includes(sellerId));
    } catch { /* ignore */ }
  }

  const storeProducts = useMemo(
    () => allProducts.filter(p => p.sellerId === sellerId),
    [allProducts, sellerId]
  );

  const sellerName = storeProducts[0]?.sellerName ?? user?.name ?? 'Toko Komik';
  const isOwner    = user?.id === sellerId;

  const [orderStats, setOrderStats] = useState({ totalSold: 0 });
  const [reviews, setReviews] = useState<ReturnType<typeof getReviewsForProduct>>([]);

  useEffect(() => {
    getOrders().then(orders => {
      const titles = new Set(storeProducts.map(p => p.title));
      let sold = 0;
      orders.forEach(o => o.items.forEach(item => { if (titles.has(item.title)) sold += item.quantity; }));
      setOrderStats({ totalSold: sold });
    });
    const allReviews = storeProducts.flatMap(p => getReviewsForProduct(p.title));
    setReviews(allReviews);
  }, [storeProducts]);

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 5;

  const filteredProducts = useMemo(() => {
    if (!search) return storeProducts;
    const q = search.toLowerCase();
    return storeProducts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.author ?? '').toLowerCase().includes(q)
    );
  }, [storeProducts, search]);

  /* Empty store — only show "not found" if not the owner */
  if (storeProducts.length === 0 && !isOwner) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🏪</p>
        <h1 className="text-xl font-bold text-white/70 mb-2">Toko tidak ditemukan</h1>
        <p className="text-white/35 text-sm mb-6">Seller ini belum memiliki produk atau link tidak valid.</p>
        <Link href="/" className="bg-[#D90429] text-white px-6 py-2.5 rounded-[14px] text-sm font-semibold hover:bg-[#B0021F]">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const initial  = sellerName.charAt(0).toUpperCase();
  const featured = storeProducts.slice(0, 6);

  return (
    <div className="bg-[#0A0A0B] min-h-screen">

      {/* ── Store Header ── */}
      <div className="bg-[#0D0D0F] border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#D90429] flex items-center justify-center text-white text-3xl font-extrabold shrink-0 shadow-lg">
              {initial}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-white/90 leading-tight">{sellerName}</h1>
                  <p className="text-sm text-white/35 mt-0.5">📍 Indonesia</p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {!isOwner && (
                      <>
                        {/* Follow button: only for logged-in buyers */}
                        {user && user.role !== 'seller' && (
                          <button
                            onClick={handleToggleFollow}
                            className={`px-5 py-2 rounded-[12px] text-sm font-semibold border-2 transition-all ${
                              following
                                ? 'bg-white/[0.06] border-white/[0.12] text-white/50'
                                : 'bg-transparent border-[#D90429] text-[#D90429] hover:bg-[#D90429]/10'
                            }`}
                          >
                            {following ? '✓ Following' : '+ Follow'}
                          </button>
                        )}
                        <button
                          onClick={() => openChat(true)}
                          className="px-5 py-2 rounded-[12px] text-sm font-semibold border border-white/[0.12] text-white/50 hover:border-white/25 hover:text-white/70 transition-colors"
                        >
                          💬 Chat Penjual
                        </button>
                      </>
                    )}
                    {isOwner && (
                      <Link href="/seller"
                        className="px-5 py-2 rounded-[12px] text-sm font-semibold bg-[#D90429] text-white hover:bg-[#B0021F] transition-colors">
                        ⚙️ Kelola Toko
                      </Link>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-1 shrink-0">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-yellow-400/80">⭐</span>
                      <span className="font-bold text-white/80">{avgRating.toFixed(1)}</span>
                      {reviews.length > 0 && (
                        <span className="text-white/30 text-sm">({reviews.length})</span>
                      )}
                    </div>
                    <p className="text-xs text-[#D90429]/60 font-medium cursor-pointer mt-0.5" onClick={() => setTab('Ulasan')}>
                      Rating &amp; Ulasan
                    </p>
                  </div>
                  <div className="hidden sm:block w-px h-6 bg-white/[0.06]" />
                  <div className="text-right">
                    <p className="font-bold text-white/80">{orderStats.totalSold > 0 ? `${orderStats.totalSold}+` : storeProducts.length}</p>
                    <p className="text-xs text-white/30">{orderStats.totalSold > 0 ? 'terjual' : 'produk'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex border-b border-white/[0.06]">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                  tab === t
                    ? 'border-[#D90429] text-[#D90429]'
                    : 'border-transparent text-white/40 hover:text-white/60'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* BERANDA */}
        {tab === 'Beranda' && (
          storeProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">📭</p>
              <p className="text-white/50 font-medium mb-2">Tokomu masih kosong</p>
              <p className="text-white/30 text-sm mb-6">Tambahkan produk pertamamu untuk mulai berjualan</p>
              {isOwner && (
                <Link href="/seller/products/add"
                  className="bg-[#D90429] text-white px-6 py-2.5 rounded-[14px] text-sm font-semibold hover:bg-[#B0021F]">
                  + Tambah Produk
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-white/70">Produk Unggulan</h2>
                  <button onClick={() => setTab('Produk')} className="text-sm text-[#D90429]/70 hover:text-[#D90429] font-medium transition-colors">
                    Lihat Semua →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {featured.map(comic => <ComicCard key={comic.id} comic={comic} />)}
                </div>
              </section>
              {storeProducts.length > 6 && (
                <section>
                  <h2 className="font-bold text-white/70 mb-4">Semua Produk</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {storeProducts.slice(6).map(comic => <ComicCard key={comic.id} comic={comic} />)}
                  </div>
                </section>
              )}
            </div>
          )
        )}

        {/* PRODUK */}
        {tab === 'Produk' && (
          <div>
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <input
                type="text"
                placeholder="Cari produk di toko ini..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-white/[0.05] border border-white/[0.10] rounded-[12px] px-4 py-2.5 text-sm text-white/70 placeholder-white/25 focus:outline-none focus:border-white/25"
              />
              <p className="text-sm text-white/30 self-center shrink-0">{filteredProducts.length} produk</p>
            </div>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredProducts.map(comic => <ComicCard key={comic.id} comic={comic} />)}
              </div>
            ) : (
              <div className="text-center py-20 text-white/30">
                <p className="text-4xl mb-3">📭</p>
                <p className="font-medium">Produk tidak ditemukan</p>
              </div>
            )}
          </div>
        )}

        {/* ULASAN */}
        {tab === 'Ulasan' && (
          <div>
            <div className="bg-[#111113] border border-white/[0.07] rounded-[16px] p-6 mb-5">
              <div className="flex items-center gap-8">
                <div className="text-center shrink-0">
                  <p className="text-5xl font-extrabold text-white/85">{reviews.length > 0 ? avgRating.toFixed(1) : '—'}</p>
                  <div className="flex justify-center gap-0.5 my-2">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-xl ${s <= Math.round(avgRating) ? 'text-yellow-400/80' : 'text-white/15'}`}>★</span>
                    ))}
                  </div>
                  <p className="text-sm text-white/30">{reviews.length} ulasan</p>
                </div>
                <div className="flex-1 space-y-2">
                  {[5,4,3,2,1].map(s => {
                    const n = reviews.filter(r => r.rating === s).length;
                    return (
                      <div key={s} className="flex items-center gap-3 text-sm">
                        <span className="text-yellow-400/60 shrink-0">★</span>
                        <span className="text-white/30 w-3 shrink-0">{s}</span>
                        <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-yellow-400/50"
                            style={{ width: reviews.length ? `${(n / reviews.length) * 100}%` : '0%' }} />
                        </div>
                        <span className="text-white/25 text-xs w-4 text-right">{n}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <p className="text-4xl mb-3">📝</p>
                <p className="font-medium text-white/50">Belum ada ulasan</p>
                <p className="text-sm mt-1">Ulasan akan muncul setelah transaksi selesai</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {reviews.map(r => (
                  <div key={r.id} className="bg-[#111113] border border-white/[0.07] rounded-[14px] p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#D90429]/20 border border-[#D90429]/20 flex items-center justify-center text-sm font-bold text-[#D90429]">
                          {r.buyerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white/70">{r.buyerName}</p>
                          <p className="text-xs text-white/25">{r.productTitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => <span key={s} className={`text-sm ${s <= r.rating ? 'text-yellow-400/80' : 'text-white/15'}`}>★</span>)}
                        </div>
                        <span className="text-xs text-white/25">
                          {new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    {r.text && <p className="text-sm text-white/50 leading-relaxed mb-3">{r.text}</p>}
                    {r.photos.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {r.photos.map((src, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={i} src={src} alt="" className="w-16 h-16 rounded-lg object-cover border border-white/[0.08]" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
