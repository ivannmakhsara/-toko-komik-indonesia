'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSeller } from '@/context/SellerContext';
import { useAuth } from '@/context/AuthContext';
import ProductForm from '@/components/ProductForm';
import { Comic } from '@/lib/types';

export default function AddProductPage() {
  const { addProduct } = useSeller();
  const { user } = useAuth();
  const [saved, setSaved]           = useState(false);
  const [savedTitle, setSavedTitle] = useState('');

  function handleSubmit(data: Omit<Comic, 'id'>) {
    addProduct(data);
    setSavedTitle(data.title);
    setSaved(true);
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full py-20 px-8 text-center">
        <div className="text-5xl mb-5">🎉</div>
        <h2 className="font-display text-xl font-bold text-white/80 mb-2">Produk Berhasil Ditambahkan!</h2>
        <p className="text-white/40 text-sm mb-8 max-w-xs">
          <span className="text-white/60 font-medium">&ldquo;{savedTitle}&rdquo;</span> sudah tersedia di tokomu.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {user?.id && (
            <Link href={`/toko/${user.id}`}
              className="w-full bg-[#D90429] text-white py-3 rounded-[14px] font-semibold hover:bg-[#B0021F] transition-colors text-sm">
              👁️ Lihat Tampilan Toko
            </Link>
          )}
          <button onClick={() => setSaved(false)}
            className="w-full border border-white/[0.12] text-white/60 py-3 rounded-[14px] hover:border-white/25 hover:text-white/80 transition-colors text-sm font-medium">
            + Tambah Produk Lain
          </button>
          <Link href="/seller/products"
            className="text-sm text-white/30 hover:text-white/60 transition-colors py-2">
            Ke Daftar Produk
          </Link>
          <Link href="/"
            className="text-sm text-white/25 hover:text-white/50 transition-colors py-1">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white/80 mb-1">Tambah Produk</h1>
          <p className="text-white/35 text-sm">Daftarkan komik baru ke tokomu</p>
        </div>
        <Link href="/" className="text-sm text-white/25 hover:text-white/50 transition-colors">
          ← Beranda
        </Link>
      </div>
      <ProductForm onSubmit={handleSubmit} submitLabel="Simpan & Terbitkan" />
    </div>
  );
}
