'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatRupiah } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import { useSeller } from '@/context/SellerContext';
import { useChat } from '@/context/ChatContext';
import { getOrders } from '@/lib/orders';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router   = useRouter();
  const { addToCart }  = useCart();
  const { allProducts } = useSeller();
  const { setIsOpen: openChat } = useChat();

  const [qty,       setQty]       = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox,  setLightbox]  = useState<number | null>(null);
  const [tab,       setTab]       = useState<'detail' | 'preview'>('detail');
  const [soldCount, setSoldCount] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);

  const comic = allProducts.find(c => c.id === id);

  useEffect(() => {
    if (!comic) return;
    const orders = getOrders();
    let sold = 0; let ratings = 0;
    orders.forEach(o => {
      const item = o.items.find(i => i.title === comic.title);
      if (item) { sold += item.quantity; if (o.status === 'Selesai') ratings++; }
    });
    setSoldCount(sold);
    setRatingCount(ratings);
  }, [comic]);

  if (!comic) {
    return (
      <div className="text-center py-24">
        <p className="text-4xl mb-3">😕</p>
        <p className="text-lg font-medium text-gray-600">Komik tidak ditemukan</p>
        <Link href="/" className="mt-4 inline-block text-red-700 hover:underline">Kembali ke beranda</Link>
      </div>
    );
  }

  const previews = comic.previewImages ?? [];

  // Gallery: cover image slot + preview pages
  const gallery = [
    { src: comic.coverImage ?? null, label: 'Cover' },
    ...previews.map((src, i) => ({ src, label: `Hal. ${i + 1}` })),
  ];

  const moreProducts = allProducts.filter(c => c.id !== id).slice(0, 6);

  function handleAddToCart() { addToCart(comic!); router.push('/cart'); }
  function handleBuyNow()    { addToCart(comic!); router.push('/checkout'); }

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-5 flex-wrap">
          <Link href="/" className="hover:text-red-600 transition-colors">Beranda</Link>
          <span>›</span>
          <span className="hover:text-red-600 cursor-pointer transition-colors">{comic.genre}</span>
          <span>›</span>
          <span className="text-gray-600 truncate max-w-[200px]">{comic.title}</span>
          {comic.sellerId && (
            <>
              <span>›</span>
              <Link href={`/toko/${comic.sellerId}`}
                className="text-red-600 hover:underline font-medium truncate max-w-[160px]">
                🏪 {comic.sellerName}
              </Link>
            </>
          )}
        </nav>

        {/* ── Three-column layout ── */}
        <div className="flex flex-col lg:flex-row gap-5 mb-10 pb-20 lg:pb-0">

          {/* ─ Gallery ─ */}
          <div className="w-full lg:w-72 shrink-0">
            {/* Main display */}
            <div className="w-full aspect-[3/4] rounded-xl overflow-hidden border border-gray-200 bg-white mb-3">
              {gallery[activeImg]?.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={gallery[activeImg].src!}
                  alt={comic.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3"
                  style={{ background: `linear-gradient(135deg, ${comic.color}, ${comic.color}88)` }}>
                  <span className="text-6xl">📖</span>
                  <p className="text-white font-bold text-center text-sm px-4">{comic.title}</p>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 flex-wrap">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImg === i ? 'border-red-600' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {img.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl"
                      style={{ background: `${comic.color}33` }}>📖</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ─ Center: info ─ */}
          <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-200 p-6">
            <h1 className="text-xl font-bold text-gray-800 mb-1.5">{comic.title}</h1>

            {/* Sold + rating */}
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
              {soldCount > 0 && <span>Terjual {soldCount}</span>}
              {soldCount > 0 && <span>·</span>}
              <span className="flex items-center gap-1">
                <span className="text-yellow-400">⭐</span>
                <span className="font-medium">5.0</span>
                {ratingCount > 0 && <span className="text-gray-400">({ratingCount} rating)</span>}
              </span>
            </div>

            <p className="text-3xl font-bold text-gray-800 mb-5">{formatRupiah(comic.price)}</p>

            {/* Tabs */}
            <div className="flex gap-5 border-b border-gray-100 mb-5">
              {(['detail', ...(previews.length > 0 ? ['preview'] : [])] as ('detail'|'preview')[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`pb-2.5 text-sm font-semibold border-b-2 transition-colors ${
                    tab === t ? 'border-red-600 text-red-700' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {t === 'detail' ? 'Detail Produk' : 'Preview Halaman'}
                </button>
              ))}
            </div>

            {tab === 'detail' ? (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-[130px_1fr] gap-y-2.5 text-gray-600">
                  <span className="text-gray-400">Penulis</span>
                  <span className="font-medium text-gray-700">{comic.author}</span>
                  <span className="text-gray-400">Genre</span>
                  <Link href={`/?genre=${comic.genre}`} className="text-red-600 hover:underline font-medium">
                    {comic.genre}
                  </Link>
                  <span className="text-gray-400">Tahun Terbit</span>
                  <span>{comic.year}</span>
                  <span className="text-gray-400">Jumlah Halaman</span>
                  <span>{comic.pages} halaman</span>
                  <span className="text-gray-400">Kondisi</span>
                  <span>Baru</span>
                  <span className="text-gray-400">Min. Pembelian</span>
                  <span>1 Eksemplar</span>
                </div>
                <div className="pt-3 border-t border-gray-50">
                  <p className="text-gray-600 leading-relaxed">{comic.description}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {previews.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setLightbox(i)}
                    className="aspect-[3/4] rounded-xl overflow-hidden border border-gray-200 hover:border-red-400 hover:shadow-md transition-all group relative"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Hal. ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
                    </div>
                    <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                      Hal. {i + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Reviews */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-4">Ulasan Pembeli</h2>
              {ratingCount > 0 ? (
                <div className="border border-gray-100 rounded-xl p-5 flex gap-8">
                  <div className="text-center shrink-0">
                    <p className="text-4xl font-bold text-gray-800">5.0</p>
                    <div className="flex justify-center gap-0.5 my-1">
                      {[1,2,3,4,5].map(s => <span key={s} className="text-yellow-400 text-xl">★</span>)}
                    </div>
                    <p className="text-xs text-gray-400">/ 5.0</p>
                    <p className="text-xs text-gray-500 mt-1">100% pembeli puas</p>
                    <p className="text-xs text-gray-400">{ratingCount} rating</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5,4,3,2,1].map(s => (
                      <div key={s} className="flex items-center gap-2 text-xs">
                        <span className="text-yellow-400 w-3">★</span>
                        <span className="text-gray-500 w-2">{s}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${s === 5 ? 'bg-green-500' : ''}`}
                            style={{ width: s === 5 ? '100%' : '0%' }} />
                        </div>
                        <span className="text-gray-400 w-6 text-right">({s === 5 ? ratingCount : 0})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border border-gray-100 rounded-xl p-6 flex items-center gap-5">
                  <span className="text-5xl">📦</span>
                  <div>
                    <p className="font-bold text-gray-800 mb-1">Belum ada ulasan untuk produk ini</p>
                    <p className="text-sm text-gray-400">Beli produk ini dan jadilah yang pertama memberikan ulasan</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─ Right: sticky purchase panel (desktop) ─ */}
          <div className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-4 bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              <p className="text-sm font-semibold text-gray-700">Atur jumlah dan catatan</p>

              {/* Mini product */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                  {comic.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={comic.coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl"
                      style={{ background: `${comic.color}33` }}>📖</div>
                  )}
                </div>
                <p className="text-xs font-medium text-gray-700 line-clamp-2">{comic.title}</p>
              </div>

              {/* Qty + stock */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:border-red-400 transition-colors text-lg leading-none"
                  >−</button>
                  <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:border-red-400 transition-colors text-lg leading-none"
                  >+</button>
                </div>
                <span className="text-xs text-orange-500 font-semibold">Stok Tersedia</span>
              </div>

              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="font-bold text-gray-800">{formatRupiah(comic.price * qty)}</span>
              </div>

              {/* CTA buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-red-700 text-white py-2.5 rounded-xl hover:bg-red-800 transition-colors font-semibold text-sm"
                >
                  + Keranjang
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full border border-red-700 text-red-700 py-2.5 rounded-xl hover:bg-red-50 transition-colors font-semibold text-sm"
                >
                  Beli Langsung
                </button>
              </div>

              {/* Chat / Wishlist / Share */}
              <div className="flex justify-around pt-3 border-t border-gray-100 text-xs text-gray-500">
                <button onClick={() => openChat(true)}
                  className="flex flex-col items-center gap-1 hover:text-red-600 transition-colors">
                  <span className="text-lg">💬</span>Chat
                </button>
                <button className="flex flex-col items-center gap-1 hover:text-red-600 transition-colors">
                  <span className="text-lg">🤍</span>Wishlist
                </button>
                <button className="flex flex-col items-center gap-1 hover:text-red-600 transition-colors">
                  <span className="text-lg">↗</span>Bagikan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Lainnya di toko ini ── */}
        {moreProducts.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-800 text-lg">Lainnya di toko ini</h2>
              <Link href="/" className="text-red-600 text-sm hover:underline font-medium">
                Lihat Semua
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {moreProducts.map(c => (
                <Link key={c.id} href={`/products/${c.id}`}
                  className="group rounded-xl overflow-hidden hover:shadow-md transition-all border border-gray-100 bg-gray-50">
                  <div className="aspect-[3/4] overflow-hidden">
                    {c.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.coverImage} alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl"
                        style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}88)` }}>
                        📖
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-800 line-clamp-2 mb-1 leading-snug">{c.title}</p>
                    <p className="text-xs font-bold text-red-700">{formatRupiah(c.price)}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-0.5">
                      <span className="text-yellow-400">⭐</span> 5.0
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile sticky buy bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-2 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden shrink-0">
          <button onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-9 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-xl font-light">
            −
          </button>
          <span className="w-8 text-center text-sm font-bold">{qty}</span>
          <button onClick={() => setQty(q => q + 1)}
            className="w-9 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-xl font-light">
            +
          </button>
        </div>
        <button onClick={handleAddToCart}
          className="flex-1 border border-red-700 text-red-700 font-bold py-2.5 rounded-xl hover:bg-red-50 transition-colors text-sm">
          + Keranjang
        </button>
        <button onClick={handleBuyNow}
          className="flex-1 bg-red-700 text-white font-bold py-2.5 rounded-xl hover:bg-red-800 transition-colors text-sm">
          Beli Sekarang
        </button>
      </div>

      {/* Lightbox */}
      {lightbox !== null && previews.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previews[lightbox]}
              alt={`Halaman ${lightbox + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
            />
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
              {lightbox + 1} / {previews.length}
            </span>
          </div>
          {previews.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setLightbox(i => i !== null ? (i - 1 + previews.length) % previews.length : 0); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors">
                ‹
              </button>
              <button onClick={e => { e.stopPropagation(); setLightbox(i => i !== null ? (i + 1) % previews.length : 0); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors">
                ›
              </button>
            </>
          )}
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/25 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
