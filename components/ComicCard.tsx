'use client';

import Link from 'next/link';
import { Comic } from '@/lib/types';
import { formatRupiah } from '@/lib/data';
import { useCart } from '@/context/CartContext';

export default function ComicCard({ comic }: { comic: Comic }) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <Link href={`/products/${comic.id}`}>
        <div className="h-40 sm:h-52 overflow-hidden cursor-pointer relative">
          {comic.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={comic.coverImage} alt={comic.title} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center p-4"
              style={{ background: `linear-gradient(135deg, ${comic.color}, ${comic.color}99)` }}
            >
              <span className="text-5xl mb-2">📖</span>
              <p className="text-white text-center font-bold text-sm leading-tight">{comic.title}</p>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link href={`/products/${comic.id}`}>
          <h3 className="font-bold text-gray-800 hover:text-red-700 transition-colors line-clamp-1">{comic.title}</h3>
        </Link>
        <p className="text-sm text-gray-500 mt-0.5">{comic.author}</p>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
            {comic.genre}
          </span>
          <span className="text-xs text-gray-400">{comic.year}</span>
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="font-bold text-red-700 text-sm">{formatRupiah(comic.price)}</span>
          <button
            onClick={() => addToCart(comic)}
            className="bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-800 active:scale-95 transition-all font-medium"
          >
            + Keranjang
          </button>
        </div>
      </div>
    </div>
  );
}
