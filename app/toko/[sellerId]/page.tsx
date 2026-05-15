'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSeller } from '@/context/SellerContext';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { getOrders } from '@/lib/orders';
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

  /* Products belonging to this store */
  const storeProducts = useMemo(
    () => allProducts.filter(p => p.sellerId === sellerId),
    [allProducts, sellerId]
  );

  /* Seller info from first product */
  const sellerName = storeProducts[0]?.sellerName ?? 'Toko Komik';
  const isOwner    = user?.id === sellerId;

  /* Stats from orders */
  const { totalSold, totalRatings } = useMemo(() => {
    const orders = getOrders();
    const titles = new Set(storeProducts.map(p => p.title));
    let sold = 0; let ratings = 0;
    orders.forEach(o => {
      o.items.forEach(item => {
        if (titles.has(item.title)) {
          sold += item.quantity;
          if (o.status === 'Selesai') ratings++;
        }
      });
    });
    return { totalSold: sold, totalRatings: ratings };
  }, [storeProducts]);

  /* Filtered products for Produk tab */
  const filteredProducts = useMemo(() => {
    if (!search) return storeProducts;
    const q = search.toLowerCase();
    return storeProducts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q)
    );
  }, [storeProducts, search]);

  if (storeProducts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🏪</p>
        <h1 className="text-xl font-bold text-gray-700 mb-2">Toko tidak ditemukan</h1>
        <p className="text-gray-400 text-sm mb-6">Seller ini belum memiliki produk atau link tidak valid.</p>
        <Link href="/" className="bg-red-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-800">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const initial = sellerName.charAt(0).toUpperCase();
  const featured = storeProducts.slice(0, 6);

  return (
    <div className="bg-gray-50 min-h-full">

      {/* ── Store Header ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-900 flex items-center justify-center text-white text-3xl font-extrabold shrink-0 shadow-md">
              {initial}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">{sellerName}</h1>
                  <p className="text-sm text-gray-500 mt-0.5">📍 Indonesia</p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => setFollowing(v => !v)}
                      className={`px-5 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                        following
                          ? 'bg-gray-100 border-gray-300 text-gray-600'
                          : 'bg-white border-red-600 text-red-700 hover:bg-red-50'
                      }`}
                    >
                      {following ? '✓ Following' : '+ Follow'}
                    </button>
                    <button
                      onClick={() => openChat(true)}
                      className="px-5 py-2 rounded-xl text-sm font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      💬 Chat Penjual
                    </button>
                    {isOwner && (
                      <Link href="/seller"
                        className="px-5 py-2 rounded-xl text-sm font-semibold bg-red-700 text-white hover:bg-red-800 transition-colors">
                        ⚙️ Kelola Toko
                      </Link>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-1 shrink-0">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-yellow-400">⭐</span>
                      <span className="font-bold text-gray-800">5.0</span>
                      {totalRatings > 0 && (
                        <span className="text-gray-400 text-sm">({totalRatings})</span>
                      )}
                    </div>
                    <p className="text-xs text-red-600 font-medium hover:underline cursor-pointer mt-0.5">
                      Rating &amp; Ulasan
                    </p>
                  </div>
                  <div className="hidden sm:block w-px h-8 bg-gray-200" />
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{totalSold > 0 ? `${totalSold}+` : storeProducts.length}</p>
                    <p className="text-xs text-gray-400">{totalSold > 0 ? 'terjual' : 'produk'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex border-b border-gray-200">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                  tab === t
                    ? 'border-red-600 text-red-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* BERANDA tab */}
        {tab === 'Beranda' && (
          <div className="space-y-8">
            {/* Featured */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-800">Produk Unggulan</h2>
                <button onClick={() => setTab('Produk')}
                  className="text-sm text-red-600 hover:underline font-medium">
                  Lihat Semua →
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {featured.map(comic => (
                  <ComicCard key={comic.id} comic={comic} />
                ))}
              </div>
            </section>

            {/* All products */}
            {storeProducts.length > 6 && (
              <section>
                <h2 className="font-bold text-gray-800 mb-4">Semua Produk</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {storeProducts.slice(6).map(comic => (
                    <ComicCard key={comic.id} comic={comic} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* PRODUK tab */}
        {tab === 'Produk' && (
          <div>
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <input
                type="text"
                placeholder="Cari produk di toko ini..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 bg-white"
              />
              <p className="text-sm text-gray-400 self-center shrink-0">
                {filteredProducts.length} produk
              </p>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredProducts.map(comic => (
                  <ComicCard key={comic.id} comic={comic} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <p className="text-4xl mb-3">📭</p>
                <p className="font-medium">Produk tidak ditemukan</p>
              </div>
            )}
          </div>
        )}

        {/* ULASAN tab */}
        {tab === 'Ulasan' && (
          <div>
            {/* Rating summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
              <div className="flex items-center gap-8">
                <div className="text-center shrink-0">
                  <p className="text-5xl font-extrabold text-gray-900">5.0</p>
                  <div className="flex justify-center gap-0.5 my-2">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className="text-yellow-400 text-xl">★</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400">dari 5.0</p>
                  {totalRatings > 0 && (
                    <p className="text-xs text-gray-500 mt-1">{totalRatings} ulasan</p>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  {[5,4,3,2,1].map(s => (
                    <div key={s} className="flex items-center gap-3 text-sm">
                      <span className="text-yellow-400 shrink-0">★</span>
                      <span className="text-gray-500 w-3 shrink-0">{s}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${s === 5 ? 'bg-green-500' : ''}`}
                          style={{ width: s === 5 ? '100%' : '0%' }} />
                      </div>
                      <span className="text-gray-400 text-xs w-8 text-right">
                        ({s === 5 ? totalRatings : 0})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {totalRatings === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">📝</p>
                <p className="font-medium text-gray-600">Belum ada ulasan</p>
                <p className="text-sm mt-1">Ulasan akan muncul setelah ada transaksi selesai</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from({ length: Math.min(totalRatings, 5) }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                        P
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Pembeli</p>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className="text-yellow-400 text-xs">★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Produk bagus, sesuai deskripsi. Pengiriman cepat dan aman. Recommended seller! 👍
                    </p>
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
