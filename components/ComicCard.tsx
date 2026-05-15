'use client';

import Link from 'next/link';
import { Comic } from '@/lib/types';
import { formatRupiah } from '@/lib/data';
import { useCart } from '@/context/CartContext';

export default function ComicCard({ comic }: { comic: Comic }) {
  const { addToCart } = useCart();

  return (
    <div className="group relative rounded-[20px] overflow-hidden bg-[#111113] border border-white/[0.07] hover:-translate-y-1.5 hover:shadow-[0_24px_48px_rgba(0,0,0,0.5)] transition-all duration-300 cursor-pointer">

      {/* ── Cover art ── */}
      <Link href={`/products/${comic.id}`} className="block relative" style={{ aspectRatio: '3/4' }}>
        {comic.coverImage || comic.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={(comic.coverImage || comic.cover)!}
            alt={comic.title}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2.5 p-5"
            style={{ background: `linear-gradient(155deg, ${comic.color}BB 0%, ${comic.color} 55%, #060608 100%)` }}
          >
            <span className="text-4xl opacity-40 select-none">📖</span>
            <p className="text-white/80 text-center font-display font-semibold text-xs leading-snug line-clamp-3 tracking-tight">
              {comic.title}
            </p>
            <p className="text-white/30 text-[10px] text-center line-clamp-1">{comic.author}</p>
          </div>
        )}

        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Genre badge */}
        <span className="absolute top-2.5 left-2.5 bg-black/45 backdrop-blur-md text-white/80 text-[9px] font-semibold px-2.5 py-1 rounded-full border border-white/[0.10] tracking-widest uppercase leading-none">
          {comic.genre}
        </span>

        {/* Add to cart — hover reveal */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); addToCart(comic); }}
          aria-label="Tambah ke keranjang"
          className="absolute bottom-3 right-3 w-9 h-9 bg-[#D90429] text-white rounded-full flex items-center justify-center shadow-xl
            opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
            active:scale-90 hover:bg-[#B0021F] transition-all duration-200 text-lg font-light leading-none
            sm:opacity-0 max-sm:opacity-100 max-sm:translate-y-0"
        >
          +
        </button>
      </Link>

      {/* ── Metadata ── */}
      <Link href={`/products/${comic.id}`} className="block px-3.5 pt-3 pb-3.5 space-y-0.5">
        <p className="text-[#F2F2F0] text-[13px] font-semibold leading-snug line-clamp-1 tracking-tight">{comic.title}</p>
        <p className="text-white/35 text-[11px] truncate">{comic.author}</p>
        <div className="flex items-center justify-between pt-2">
          <p className="text-[#D90429] text-[13px] font-bold tracking-tight">{formatRupiah(comic.price)}</p>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400/60 text-[10px] leading-none">★</span>
            <span className="text-white/25 text-[10px]">{(comic.rating ?? 5).toFixed(1)}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
