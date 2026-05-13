'use client';

import { useState, useMemo } from 'react';
import { genres } from '@/lib/data';
import { useSeller } from '@/context/SellerContext';
import ComicCard from '@/components/ComicCard';

export default function HomePage() {
  const { allProducts } = useSeller();
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('Semua');
  const [sort, setSort] = useState('default');

  const filtered = useMemo(() => {
    let result = allProducts.filter(c => {
      const matchSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.author.toLowerCase().includes(search.toLowerCase());
      const matchGenre = genre === 'Semua' || c.genre === genre;
      return matchSearch && matchGenre;
    });

    if (sort === 'price-asc') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') result = [...result].sort((a, b) => b.price - a.price);
    if (sort === 'newest') result = [...result].sort((a, b) => b.year - a.year);

    return result;
  }, [search, genre, sort]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white rounded-2xl p-8 mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Toko Komik Indonesia</h1>
        <p className="text-red-200 text-lg">Koleksi komik lokal terbaik — dari klasik hingga modern</p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Cari judul atau pengarang..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-red-400"
        />
        <select
          value={genre}
          onChange={e => setGenre(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-red-400"
        >
          {genres.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-red-400"
        >
          <option value="default">Urutan Default</option>
          <option value="price-asc">Harga: Murah ke Mahal</option>
          <option value="price-desc">Harga: Mahal ke Murah</option>
          <option value="newest">Terbaru</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        Menampilkan <span className="font-semibold text-gray-700">{filtered.length}</span> komik
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(comic => (
            <ComicCard key={comic.id} comic={comic} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-lg font-medium">Komik tidak ditemukan</p>
          <p className="text-sm">Coba kata kunci atau genre lain</p>
        </div>
      )}
    </div>
  );
}
