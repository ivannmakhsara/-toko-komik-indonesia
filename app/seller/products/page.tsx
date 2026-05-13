'use client';

import Link from 'next/link';
import { useSeller } from '@/context/SellerContext';
import { formatRupiah } from '@/lib/data';

export default function SellerProductsPage() {
  const { sellerProducts, deleteProduct } = useSeller();

  function handleDelete(id: string, title: string) {
    if (confirm(`Hapus "${title}" dari tokomu?`)) {
      deleteProduct(id);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Produk Saya</h1>
          <p className="text-gray-400 text-sm mt-1">{sellerProducts.length} produk terdaftar</p>
        </div>
        <Link
          href="/seller/products/add"
          className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors text-sm font-medium"
        >
          + Tambah Produk
        </Link>
      </div>

      {sellerProducts.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-16 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium text-gray-600 mb-1">Belum ada produk</p>
          <p className="text-sm text-gray-400 mb-5">Tambahkan komik pertamamu ke toko</p>
          <Link
            href="/seller/products/add"
            className="inline-block bg-red-700 text-white px-5 py-2 rounded-lg hover:bg-red-800 transition-colors text-sm font-medium"
          >
            Tambah Sekarang
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Komik</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Genre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tahun</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Harga</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sellerProducts.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                        style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}99)` }}
                      >
                        📖
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate max-w-[200px]">{p.title}</p>
                        <p className="text-xs text-gray-400">{p.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">{p.genre}</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">{p.year}</td>
                  <td className="px-4 py-4 text-right font-semibold text-gray-800 text-sm">{formatRupiah(p.price)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/seller/products/${p.id}/edit`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="text-sm text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
