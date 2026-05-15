'use client';

import Link from 'next/link';
import { Comic } from '@/lib/types';
import { formatRupiah } from '@/lib/data';
import { useCart } from '@/context/CartContext';

export default function ComicCard({ comic }: { comic: Comic }) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200 flex flex-col group">

      {/* ── Cover ── */}
      <div className="relative h-40 sm:h-48 overflow-hidden shrink-0">
        <Link href={`/products/${comic.id}`} className="block w-full h-full">
          {comic.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={comic.coverImage}
              alt={comic.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center p-4"
              style={{ background: `linear-gradient(135deg, ${comic.color}, ${comic.color}88)` }}
            >
              <span className="text-4xl mb-1.5">📖</span>
              <p className="text-white text-center font-bold text-xs leading-tight line-clamp-2">{comic.title}</p>
            </div>
          )}
        </Link>

        {/* Genre badge */}
        <span className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full pointer-events-none">
          {comic.genre}
        </span>

        {/* Add to cart — always visible on mobile, hover on desktop */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); addToCart(comic); }}
          title="Tambah ke keranjang"
          className="absolute bottom-2 right-2 w-8 h-8 bg-red-700 text-white rounded-full flex items-center justify-center text-xl leading-none shadow-lg
            active:scale-90 transition-all duration-150
            opacity-100 sm:opacity-0 sm:translate-y-1
            sm:group-hover:opacity-100 sm:group-hover:translate-y-0"
        >
          +
        </button>
      </div>

      {/* ── Info ── */}
      <Link href={`/products/${comic.id}`} className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{comic.title}</p>
        <p className="text-[10px] text-gray-400 truncate">{comic.author}</p>

        <div className="mt-auto pt-2 space-y-0.5">
          <p className="text-sm font-bold text-red-700 leading-tight">{formatRupiah(comic.price)}</p>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 text-[10px] leading-none">⭐</span>
            <span className="text-[10px] text-gray-400">5.0</span>
            <span className="text-[10px] text-gray-300 mx-0.5">·</span>
            <span className="text-[10px] text-gray-400">{comic.year}</span>
          </div>
        </div>
      </Link>

    </div>
  );
}
