'use client';

import { useSeller } from '@/context/SellerContext';
import ProductForm from '@/components/ProductForm';
import { Comic } from '@/lib/types';

export default function AddProductPage() {
  const { addProduct } = useSeller();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white/80 mb-1">Tambah Produk</h1>
      <p className="text-white/35 text-sm mb-6">Daftarkan komik baru ke tokomu</p>
      <ProductForm
        onSubmit={(data: Omit<Comic, 'id'>) => addProduct(data)}
        submitLabel="Simpan & Terbitkan"
      />
    </div>
  );
}
