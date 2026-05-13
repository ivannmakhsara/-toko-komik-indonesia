'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSeller } from '@/context/SellerContext';
import ProductForm from '@/components/ProductForm';
import { Comic } from '@/lib/types';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { sellerProducts, updateProduct } = useSeller();

  const product = sellerProducts.find(p => p.id === id);

  if (!product) {
    return (
      <div className="p-8 text-center">
        <p className="text-4xl mb-3">😕</p>
        <p className="text-gray-600 mb-4">Produk tidak ditemukan atau bukan milikmu.</p>
        <Link href="/seller/products" className="text-red-700 hover:underline text-sm">
          ← Kembali ke daftar produk
        </Link>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, ...initial } = product;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Edit Produk</h1>
      <p className="text-gray-400 text-sm mb-6">Perbarui informasi komikmu</p>
      <ProductForm
        initial={initial}
        onSubmit={(data: Omit<Comic, 'id'>) => updateProduct(id, data)}
        submitLabel="Simpan Perubahan"
      />
    </div>
  );
}
