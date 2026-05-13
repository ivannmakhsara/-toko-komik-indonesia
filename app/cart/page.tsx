'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatRupiah } from '@/lib/data';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Keranjang Kosong</h2>
        <p className="text-gray-400 mb-6">Tambahkan komik favoritmu dulu!</p>
        <Link
          href="/"
          className="bg-red-700 text-white px-6 py-2 rounded-lg hover:bg-red-800 transition-colors font-medium"
        >
          Lihat Komik
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Keranjang Belanja</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Items */}
        <div className="flex-1 flex flex-col gap-3">
          {items.map(({ comic, quantity }) => (
            <div key={comic.id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
              {/* Mini cover */}
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0 text-2xl"
                style={{ background: `linear-gradient(135deg, ${comic.color}, ${comic.color}99)` }}
              >
                📖
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{comic.title}</p>
                <p className="text-xs text-gray-400">{comic.author}</p>
                <p className="text-red-700 font-bold text-sm mt-1">{formatRupiah(comic.price)}</p>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => updateQuantity(comic.id, quantity - 1)}
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-lg leading-none"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => updateQuantity(comic.id, quantity + 1)}
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-lg leading-none"
                >
                  +
                </button>
              </div>

              <div className="text-right shrink-0">
                <p className="font-semibold text-gray-700 text-sm">{formatRupiah(comic.price * quantity)}</p>
                <button
                  onClick={() => removeFromCart(comic.id)}
                  className="text-xs text-red-400 hover:text-red-600 mt-1"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:w-72">
          <div className="bg-white rounded-xl shadow p-5 sticky top-20">
            <h2 className="font-bold text-gray-800 mb-4">Ringkasan Pesanan</h2>
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Total item</span>
              <span>{totalItems}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mb-4">
              <span>Subtotal</span>
              <span>{formatRupiah(totalPrice)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-gray-800 mb-5">
              <span>Total</span>
              <span className="text-red-700">{formatRupiah(totalPrice)}</span>
            </div>
            <Link
              href="/checkout"
              className="block w-full bg-red-700 text-white text-center py-3 rounded-lg hover:bg-red-800 transition-colors font-medium"
            >
              Lanjut ke Checkout
            </Link>
            <Link
              href="/"
              className="block w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-3"
            >
              Lanjut Belanja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
