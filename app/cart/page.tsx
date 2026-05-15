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
        <h2 className="font-display text-xl font-bold text-[#F2F2F0] mb-2">Keranjang Kosong</h2>
        <p className="text-white/40 mb-6">Tambahkan komik favoritmu dulu!</p>
        <Link href="/" className="bg-[#D90429] text-white px-6 py-2.5 rounded-[12px] hover:bg-[#B0021F] transition-colors font-semibold text-sm">
          Lihat Komik
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-[#F2F2F0] mb-6 tracking-tight">Keranjang Belanja</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Items */}
        <div className="flex-1 flex flex-col gap-3">
          {items.map(({ comic, quantity }) => (
            <div key={comic.id} className="bg-[#111113] border border-white/[0.07] rounded-[16px] p-4 flex items-center gap-4">
              <div
                className="w-14 h-[72px] rounded-[10px] flex items-center justify-center shrink-0 overflow-hidden border border-white/[0.07]"
                style={{ background: `linear-gradient(135deg, ${comic.color}BB, ${comic.color})` }}
              >
                {(comic.coverImage || comic.cover)
                  ? <img src={(comic.coverImage || comic.cover)!} alt={comic.title} className="w-full h-full object-cover" />
                  : <span className="text-xl">📖</span>
                }
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white/85 truncate text-[14px]">{comic.title}</p>
                <p className="text-xs text-white/35 mb-1">{comic.author}</p>
                <p className="text-[#D90429] font-bold text-sm">{formatRupiah(comic.price)}</p>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => updateQuantity(comic.id, quantity - 1)}
                  className="w-7 h-7 rounded-full border border-white/[0.12] flex items-center justify-center text-white/50 hover:text-white hover:border-white/25 transition-colors text-lg leading-none">
                  −
                </button>
                <span className="w-6 text-center text-sm font-semibold text-white/80">{quantity}</span>
                <button
                  onClick={() => updateQuantity(comic.id, quantity + 1)}
                  className="w-7 h-7 rounded-full border border-white/[0.12] flex items-center justify-center text-white/50 hover:text-white hover:border-white/25 transition-colors text-lg leading-none">
                  +
                </button>
              </div>

              <div className="text-right shrink-0">
                <p className="font-semibold text-white/70 text-sm">{formatRupiah(comic.price * quantity)}</p>
                <button
                  onClick={() => removeFromCart(comic.id)}
                  className="text-xs text-red-400/60 hover:text-red-400 transition-colors mt-1">
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:w-72">
          <div className="bg-[#111113] border border-white/[0.07] rounded-[20px] p-5 sticky top-[76px]">
            <h2 className="font-display font-bold text-[#F2F2F0] mb-4">Ringkasan Pesanan</h2>
            <div className="flex justify-between text-sm text-white/40 mb-2">
              <span>Total item</span>
              <span>{totalItems}</span>
            </div>
            <div className="flex justify-between text-sm text-white/40 mb-4">
              <span>Subtotal</span>
              <span>{formatRupiah(totalPrice)}</span>
            </div>
            <div className="border-t border-white/[0.07] pt-3 flex justify-between font-bold text-[#F2F2F0] mb-5">
              <span>Total</span>
              <span className="text-[#D90429]">{formatRupiah(totalPrice)}</span>
            </div>
            <Link
              href="/checkout"
              className="block w-full bg-[#D90429] text-white text-center py-3 rounded-[12px] hover:bg-[#B0021F] transition-colors font-semibold text-sm">
              Lanjut ke Checkout
            </Link>
            <Link
              href="/"
              className="block w-full text-center text-sm text-white/30 hover:text-white/55 mt-3 transition-colors">
              Lanjut Belanja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
