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
          <h1 className="text-2xl font-bold text-white/80">Produk Saya</h1>
          <p className="text-white/35 text-sm mt-1">{sellerProducts.length} produk terdaftar</p>
        </div>
        <Link href="/seller/products/add"
          className="bg-[#D90429] text-white px-4 py-2 rounded-[12px] hover:bg-[#B0021F] transition-colors text-sm font-medium">
          + Tambah Produk
        </Link>
      </div>

      {sellerProducts.length === 0 ? (
        <div className="bg-[#111113] border border-dashed border-white/[0.10] rounded-[16px] p-16 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium text-white/50 mb-1">Belum ada produk</p>
          <p className="text-sm text-white/30 mb-5">Tambahkan komik pertamamu ke toko</p>
          <Link href="/seller/products/add"
            className="inline-block bg-[#D90429] text-white px-5 py-2 rounded-[12px] hover:bg-[#B0021F] transition-colors text-sm font-medium">
            Tambah Sekarang
          </Link>
        </div>
      ) : (
        <div className="bg-[#111113] border border-white/[0.07] rounded-[16px] overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-white/[0.07]">
              <tr>
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-white/30 uppercase tracking-wider">Komik</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-white/30 uppercase tracking-wider">Genre</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-white/30 uppercase tracking-wider">Tahun</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-white/30 uppercase tracking-wider">Harga</th>
                <th className="text-right px-6 py-3 text-[11px] font-semibold text-white/30 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {sellerProducts.map(p => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-lg shrink-0 overflow-hidden border border-white/[0.07]">
                        {(p.coverImage || p.cover) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={(p.coverImage || p.cover)!} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}99)` }}>
                            📖
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white/70 truncate max-w-[200px]">{p.title}</p>
                        <p className="text-xs text-white/30">{p.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs bg-[#D90429]/10 text-[#D90429] border border-[#D90429]/20 px-2 py-1 rounded-full">{p.genre}</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-white/40">{p.year}</td>
                  <td className="px-4 py-4 text-right font-semibold text-white/70 text-sm">{formatRupiah(p.price)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/seller/products/${p.id}/edit`}
                        className="text-sm text-blue-400 hover:text-blue-300 font-medium px-2 py-1 rounded-[8px] hover:bg-blue-400/10 transition-colors">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(p.id, p.title)}
                        className="text-sm text-[#D90429]/70 hover:text-[#D90429] font-medium px-2 py-1 rounded-[8px] hover:bg-[#D90429]/10 transition-colors">
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
