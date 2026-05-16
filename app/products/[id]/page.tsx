'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatRupiah } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import { useSeller } from '@/context/SellerContext';
import { useChat } from '@/context/ChatContext';
import { getOrders } from '@/lib/orders';
import { getReviewsForProduct, Review } from '@/lib/reviews';

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
  const [soldCount,   setSoldCount]   = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [reviews,     setReviews]     = useState<Review[]>([]);

  const comic = allProducts.find(c => c.id === id);

  useEffect(() => {
    if (!comic) return;
    getOrders().then(orders => {
      let sold = 0; let ratings = 0;
      orders.forEach(o => {
        if (o.status !== 'Selesai') return;
        const item = o.items.find(i => i.title === comic.title);
        if (item) { sold += item.quantity; ratings++; }
      });
      setSoldCount(sold);
      setRatingCount(ratings);
    });
    const productReviews = getReviewsForProduct(comic.title);
    setReviews(productReviews);
    setQty(comic.minBuy ?? 1);
  }, [comic]);

  if (!comic) {
    return (
      <div className="text-center py-24">
        <p className="text-4xl mb-3">😕</p>
        <p className="text-lg font-medium text-white/60">Komik tidak ditemukan</p>
        <Link href="/" className="mt-4 inline-block text-[#D90429] hover:underline">Kembali ke beranda</Link>
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
    <div className="bg-[#0A0A0B] min-h-full">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-white/30 mb-5 flex-wrap">
          <Link href="/" className="hover:text-white/60 transition-colors">Beranda</Link>
          <span>›</span>
          <span className="hover:text-white/60 cursor-pointer transition-colors">{comic.genre}</span>
          <span>›</span>
          <span className="text-white/50 truncate max-w-[200px]">{comic.title}</span>
          {comic.sellerId && (
            <>
              <span>›</span>
              <Link href={`/toko/${comic.sellerId}`}
                className="text-[#D90429] hover:underline font-medium truncate max-w-[160px]">
                🏪 {comic.sellerName}
              </Link>
            </>
          )}
        </nav>

        {/* ── Three-column layout ── */}
        <div className="flex flex-col lg:flex-row gap-5 mb-10 pb-20 lg:pb-0">

          {/* ─ Gallery ─ */}
          <div className="w-[220px] sm:w-[260px] lg:w-72 mx-auto lg:mx-0 shrink-0">
            {/* Main display */}
            <div className="w-full aspect-[3/4] rounded-xl overflow-hidden border border-white/[0.08] bg-[#111113] mb-3">
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
          <div className="flex-1 min-w-0 bg-[#111113] rounded-xl border border-white/[0.07] p-6">
            <h1 className="font-display text-xl font-bold text-[#F2F2F0] mb-1.5 tracking-tight">{comic.title}</h1>

            {/* Sold + rating */}
            <div className="flex items-center gap-3 text-sm text-white/40 mb-3">
              {soldCount > 0 && <span>Terjual {soldCount}</span>}
              {soldCount > 0 && <span>·</span>}
              <span className="flex items-center gap-1">
                <span className="text-yellow-400/70">★</span>
                <span className="text-white/60 font-medium">5.0</span>
                {ratingCount > 0 && <span className="text-white/30">({ratingCount} rating)</span>}
              </span>
            </div>

            <p className="font-display text-3xl font-bold text-[#F2F2F0] mb-5">{formatRupiah(comic.price)}</p>

            {/* Tabs */}
            <div className="flex gap-5 border-b border-white/[0.06] mb-5">
              {(['detail', ...(previews.length > 0 ? ['preview'] : [])] as ('detail'|'preview')[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`pb-2.5 text-sm font-semibold border-b-2 transition-colors ${
                    tab === t ? 'border-[#D90429] text-[#D90429]' : 'border-transparent text-white/30 hover:text-white/60'
                  }`}
                >
                  {t === 'detail' ? 'Detail Produk' : 'Preview Halaman'}
                </button>
              ))}
            </div>

            {tab === 'detail' ? (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-[130px_1fr] gap-y-3 text-white/50">
                  {comic.author && (
                    <>
                      <span className="text-white/30">Penulis / Kreator</span>
                      <span className="font-medium text-white/70">{comic.author}</span>
                    </>
                  )}
                  <span className="text-white/30">Genre</span>
                  <Link href={`/?genre=${comic.genre}`} className="text-[#D90429] hover:underline font-medium">
                    {comic.genre}
                  </Link>
                  <span className="text-white/30">Tahun Terbit</span>
                  <span>{comic.year}</span>
                  <span className="text-white/30">Jumlah Halaman</span>
                  <span>{comic.pages ?? '—'} halaman</span>
                  <span className="text-white/30">Kondisi</span>
                  <span>{comic.condition ?? 'Baru'}</span>
                  <span className="text-white/30">Berat Satuan</span>
                  <span>{comic.weight ?? 300} gram</span>
                  <span className="text-white/30">Min. Pembelian</span>
                  <span>{comic.minBuy ?? 1} Eksemplar</span>
                  {comic.preorderDays !== undefined && (
                    <>
                      <span className="text-white/30">Status</span>
                      <span className="text-amber-400/80 font-medium">Preorder · {comic.preorderDays} hari kerja</span>
                    </>
                  )}
                </div>
                <div className="pt-3 border-t border-white/[0.05]">
                  <p className="text-white/45 leading-relaxed">{comic.description}</p>
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
            <div className="mt-8 border-t border-white/[0.06] pt-6">
              <h2 className="font-display font-semibold text-white/50 text-[11px] uppercase tracking-widest mb-4">Ulasan Pembeli</h2>
              {reviews.length > 0 ? (() => {
                const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
                const counts = [5,4,3,2,1].map(s => ({ s, n: reviews.filter(r => r.rating === s).length }));
                return (
                  <div className="flex flex-col gap-4">
                    {/* Summary */}
                    <div className="border border-white/[0.07] rounded-xl p-5 flex gap-6">
                      <div className="text-center shrink-0">
                        <p className="font-display text-4xl font-bold text-[#F2F2F0]">{avg.toFixed(1)}</p>
                        <div className="flex justify-center gap-0.5 my-1">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={`text-lg ${s <= Math.round(avg) ? 'text-yellow-400/80' : 'text-white/15'}`}>★</span>
                          ))}
                        </div>
                        <p className="text-xs text-white/25">{reviews.length} ulasan</p>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {counts.map(({ s, n }) => (
                          <div key={s} className="flex items-center gap-2 text-xs">
                            <span className="text-yellow-400/60 w-3">★</span>
                            <span className="text-white/30 w-2">{s}</span>
                            <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-yellow-400/50"
                                style={{ width: reviews.length ? `${(n / reviews.length) * 100}%` : '0%' }} />
                            </div>
                            <span className="text-white/25 w-4 text-right">{n}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Individual reviews */}
                    <div className="flex flex-col gap-3">
                      {reviews.map(r => (
                        <div key={r.id} className="border border-white/[0.07] rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#D90429]/20 border border-[#D90429]/20 flex items-center justify-center text-xs font-bold text-[#D90429]">
                                {r.buyerName.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-white/70">{r.buyerName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {[1,2,3,4,5].map(s => (
                                  <span key={s} className={`text-sm ${s <= r.rating ? 'text-yellow-400/80' : 'text-white/15'}`}>★</span>
                                ))}
                              </div>
                              <span className="text-xs text-white/25">{new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
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
                  </div>
                );
              })() : (
                <div className="border border-white/[0.07] rounded-xl p-6 flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center text-2xl">📝</div>
                  <div>
                    <p className="font-semibold text-white/60 mb-1">Belum ada ulasan</p>
                    <p className="text-sm text-white/30">Beli dan jadilah yang pertama memberikan ulasan</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─ Right: sticky purchase panel (desktop) ─ */}
          <div className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-[76px] bg-[#111113] border border-white/[0.07] rounded-xl p-5 space-y-4">
              <p className="text-[13px] font-semibold text-white/60">Atur jumlah dan catatan</p>

              {/* Mini product */}
              <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/[0.07] shrink-0">
                  {(comic.coverImage || comic.cover) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={(comic.coverImage || comic.cover)!} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl"
                      style={{ background: `${comic.color}44` }}>📖</div>
                  )}
                </div>
                <p className="text-[12px] font-medium text-white/70 line-clamp-2">{comic.title}</p>
              </div>

              {/* Qty + stock */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQty(q => Math.max(comic.minBuy ?? 1, q - 1))}
                    className="w-8 h-8 border border-white/[0.10] rounded-lg flex items-center justify-center text-white/50 hover:border-[#D90429]/40 hover:text-white/80 transition-colors text-lg leading-none"
                  >−</button>
                  <span className="w-8 text-center text-sm font-semibold text-white/80">{qty}</span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    className="w-8 h-8 border border-white/[0.10] rounded-lg flex items-center justify-center text-white/50 hover:border-[#D90429]/40 hover:text-white/80 transition-colors text-lg leading-none"
                  >+</button>
                </div>
                <span className="text-[11px] text-green-400/70 font-semibold">Tersedia</span>
              </div>

              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-white/35">Subtotal</span>
                <span className="font-display font-bold text-[#F2F2F0]">{formatRupiah(comic.price * qty)}</span>
              </div>

              {/* CTA buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-[#D90429] text-white py-2.5 rounded-[12px] hover:bg-[#B0021F] transition-colors font-semibold text-[13px]"
                >
                  + Keranjang
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full border border-white/[0.12] text-white/60 py-2.5 rounded-[12px] hover:border-white/25 hover:text-white/80 transition-colors font-semibold text-[13px]"
                >
                  Beli Langsung
                </button>
              </div>

              {/* Chat / Wishlist / Share */}
              <div className="flex justify-around pt-3 border-t border-white/[0.06] text-[11px] text-white/30">
                <button onClick={() => openChat(true)}
                  className="flex flex-col items-center gap-1 hover:text-[#D90429]/70 transition-colors">
                  <span className="text-lg">💬</span>Chat
                </button>
                <button className="flex flex-col items-center gap-1 hover:text-[#D90429]/70 transition-colors">
                  <span className="text-lg">🤍</span>Wishlist
                </button>
                <button className="flex flex-col items-center gap-1 hover:text-[#D90429]/70 transition-colors">
                  <span className="text-lg">↗</span>Bagikan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Lainnya ── */}
        {moreProducts.length > 0 && (
          <div className="bg-[#111113] rounded-xl border border-white/[0.07] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-[#F2F2F0] text-lg tracking-tight">Lainnya yang mungkin kamu suka</h2>
              <Link href="/" className="text-[#D90429]/70 text-[13px] hover:text-[#D90429] font-medium transition-colors">
                Lihat Semua →
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {moreProducts.map(c => (
                <Link key={c.id} href={`/products/${c.id}`}
                  className="group rounded-[16px] overflow-hidden border border-white/[0.07] bg-white/[0.03] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 transition-all duration-200">
                  <div className="aspect-[3/4] overflow-hidden">
                    {(c.coverImage || c.cover) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={(c.coverImage || c.cover)!} alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl"
                        style={{ background: `linear-gradient(135deg, ${c.color}AA, ${c.color})` }}>
                        📖
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-[11px] font-medium text-white/70 line-clamp-2 mb-1 leading-snug">{c.title}</p>
                    <p className="text-[11px] font-bold text-[#D90429]">{formatRupiah(c.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile sticky buy bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0E0E10]/95 backdrop-blur-xl border-t border-white/[0.08] px-4 py-3 flex items-center gap-2 z-40">
        <div className="flex items-center border border-white/[0.12] rounded-xl overflow-hidden shrink-0">
          <button onClick={() => setQty(q => Math.max(comic.minBuy ?? 1, q - 1))}
            className="w-9 h-10 flex items-center justify-center text-white/50 hover:text-white/80 transition-colors text-xl font-light">
            −
          </button>
          <span className="w-8 text-center text-sm font-bold text-white/80">{qty}</span>
          <button onClick={() => setQty(q => q + 1)}
            className="w-9 h-10 flex items-center justify-center text-white/50 hover:text-white/80 transition-colors text-xl font-light">
            +
          </button>
        </div>
        <button onClick={handleAddToCart}
          className="flex-1 border border-white/[0.14] text-white/60 font-bold py-2.5 rounded-xl hover:border-white/25 hover:text-white/80 transition-colors text-sm">
          + Keranjang
        </button>
        <button onClick={handleBuyNow}
          className="flex-1 bg-[#D90429] text-white font-bold py-2.5 rounded-xl hover:bg-[#B0021F] transition-colors text-sm">
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
