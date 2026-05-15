'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSeller } from '@/context/SellerContext';
import ProductForm from '@/components/ProductForm';
import { Comic } from '@/lib/types';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { sellerProducts, updateProduct } = useSeller();
  const router = useRouter();

  const product = sellerProducts.find(p => p.id === id);

  if (!product) {
    return (
      <div className="p-8 text-center">
        <p className="text-4xl mb-3">😕</p>
        <p className="text-white/50 mb-4">Produk tidak ditemukan atau bukan milikmu.</p>
        <Link href="/seller/products" className="text-[#D90429] hover:underline text-sm">
          ← Kembali ke daftar produk
        </Link>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, ...initial } = product;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white/80 mb-1">Edit Produk</h1>
      <p className="text-white/35 text-sm mb-6">Perbarui informasi komikmu</p>
      <ProductForm
        initial={initial}
        onSubmit={(data: Omit<Comic, 'id'>) => {
          updateProduct(id, data);
          router.push('/seller/products');
        }}
        submitLabel="Simpan Perubahan"
      />
    </div>
  );
}
