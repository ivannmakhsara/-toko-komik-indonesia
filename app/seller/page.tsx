'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSeller } from '@/context/SellerContext';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { formatRupiah } from '@/lib/data';
import { getOrders, Order, OrderStatus } from '@/lib/orders';

const TIPS_ARTICLES = [
  { icon: '📈', title: 'Tips Meningkatkan Penjualan Komik', category: 'Strategi', date: '13 Mei 26' },
  { icon: '📦', title: 'Cara Mengelola Stok dengan Efisien', category: 'Operasional', date: '10 Mei 26' },
  { icon: '📸', title: 'Pentingnya Foto Produk yang Menarik', category: 'Marketing', date: '5 Mei 26' },
];

const ALL_STATUSES: OrderStatus[] = ['Pesanan Masuk', 'Diproses', 'Dikirim', 'Sampai', 'Selesai'];

const STATUS_COLOR: Record<OrderStatus, string> = {
  'Pesanan Masuk': 'bg-orange-500',
  'Diproses':      'bg-yellow-500',
  'Dikirim':       'bg-blue-500',
  'Sampai':        'bg-purple-500',
  'Selesai':       'bg-green-500',
};

const STATUS_ICON: Record<OrderStatus, string> = {
  'Pesanan Masuk': '🕐',
  'Diproses':      '📦',
  'Dikirim':       '🚚',
  'Sampai':        '📍',
  'Selesai':       '✅',
};

export default function SellerDashboard() {
  const { sellerProducts } = useSeller();
  const { unreadForSeller } = useChat();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [showRevenue, setShowRevenue] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    getOrders().then(setOrders);
    setLastUpdated(
      new Date().toLocaleString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }) + ' WIB'
    );
  }, []);

  const totalRevenue   = orders.reduce((s, o) => s + o.total, 0);
  const newOrders      = orders.filter(o => o.status === 'Pesanan Masuk').length;
  const readyToShip    = orders.filter(o => o.status === 'Diproses').length;
  const completed      = orders.filter(o => o.status === 'Selesai').length;
  const completionRate = orders.length > 0 ? (completed / orders.length) * 100 : 0;

  const perfScore = Math.min(100, Math.round(
    50 +
    (sellerProducts.length > 0 ? 15 : 0) +
    (completionRate >= 80 ? 20 : completionRate >= 40 ? 10 : 0) +
    (unreadForSeller === 0 && orders.length > 0 ? 10 : 0) +
    Math.min(5, sellerProducts.length)
  ));

  const statusCounts = Object.fromEntries(
    ALL_STATUSES.map(s => [s, orders.filter(o => o.status === s).length])
  ) as Record<OrderStatus, number>;

  const byMonth: Record<string, Order[]> = {};
  orders.forEach(o => {
    const k = new Date(o.date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    if (!byMonth[k]) byMonth[k] = [];
    byMonth[k].push(o);
  });

  const ACTIVITY = [
    { label: 'Pesanan Baru',  value: newOrders,            icon: '📬', href: '/seller/orders', color: 'text-orange-600' },
    { label: 'Siap Dikirim',  value: readyToShip,          icon: '📦', href: '/seller/orders', color: 'text-blue-600'   },
    { label: 'Chat Baru',     value: unreadForSeller,      icon: '💬', href: '/seller/chat',   color: 'text-red-600'    },
    { label: 'Produk Aktif',  value: sellerProducts.length,icon: '📚', href: '/seller/products', color: 'text-purple-600' },
  ];

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Main column ── */}
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="p-6 space-y-5 max-w-2xl">

          {/* Activity cards */}
          <section>
            <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">
              Aktivitas yang perlu kamu pantau
            </p>
            <div className="grid grid-cols-4 gap-3">
              {ACTIVITY.map(a => (
                <Link key={a.label} href={a.href}
                  className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-gray-200 transition-all">
                  <p className="text-xs text-gray-400 mb-2">{a.icon} {a.label}</p>
                  <p className={`text-2xl font-bold ${a.color}`}>{a.value}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Statistik Toko */}
          <section className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">Statistik Toko</p>
                {lastUpdated && (
                  <p className="text-xs text-gray-400 mt-0.5">Update terakhir: {lastUpdated}</p>
                )}
              </div>
            </div>
            <div className="p-5">
              {/* 3 main stats */}
              <div className="grid grid-cols-3 gap-5 mb-6 pb-6 border-b border-gray-50">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Total Pendapatan</p>
                  <button onClick={() => setShowRevenue(true)} className="text-left group">
                    <p className="text-xl font-bold text-gray-800 group-hover:text-red-700 transition-colors">
                      {formatRupiah(totalRevenue)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {orders.length} pesanan · <span className="text-red-600 group-hover:underline">lihat rincian</span>
                    </p>
                  </button>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Produk Terdaftar</p>
                  <p className="text-xl font-bold text-gray-800">{sellerProducts.length}</p>
                  <p className="text-xs text-gray-400 mt-0.5">produk kamu</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Pesanan Selesai</p>
                  <p className="text-xl font-bold text-gray-800">{completed}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {orders.length > 0 ? `${Math.round(completionRate)}% completion rate` : '—'}
                  </p>
                </div>
              </div>

              {/* Order status breakdown */}
              {orders.length > 0 ? (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-3">Breakdown Status Pesanan</p>
                  <div className="flex gap-3">
                    {ALL_STATUSES.map(s => {
                      const count = statusCounts[s];
                      const pct   = orders.length > 0 ? (count / orders.length) * 100 : 0;
                      return (
                        <div key={s} className="flex-1">
                          <div className="h-1.5 bg-gray-100 rounded-full mb-2">
                            <div
                              className={`h-full rounded-full ${STATUS_COLOR[s]} transition-all`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-gray-400 leading-tight truncate">{s}</p>
                          <p className="text-sm font-bold text-gray-700 mt-0.5">{count}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-3xl mb-2">📊</p>
                  <p className="text-sm font-medium text-gray-500 mb-1">Belum ada data</p>
                  <p className="text-xs text-gray-400">
                    Statistik akan muncul setelah ada pesanan masuk
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Performa Toko */}
          <section className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <p className="font-semibold text-gray-800">Performa Toko</p>
            </div>
            <div className="p-5 flex gap-6">
              {/* Score gauge */}
              <div className="shrink-0 w-44">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                    Level 1
                  </span>
                  <span className="text-xs text-gray-400">Seller Reguler</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      perfScore >= 80 ? 'bg-green-500' : perfScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${perfScore}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mb-0.5">Skor performa:</p>
                <p>
                  <span className="text-3xl font-bold text-gray-800">{perfScore}</span>
                  <span className="text-gray-400 text-sm"> /100</span>
                </p>
              </div>

              {/* Tips */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">
                  Tips meningkatkan performa
                </p>
                <div className="space-y-2.5">
                  {sellerProducts.length === 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-orange-500 shrink-0 mt-0.5">⚠</span>
                      <p className="text-gray-600">Tambahkan produk pertama untuk mulai berjualan</p>
                    </div>
                  )}
                  {unreadForSeller > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-orange-500 shrink-0 mt-0.5">⚠</span>
                      <p className="text-gray-600">
                        {unreadForSeller} pesan belum dibalas — respons cepat meningkatkan kepercayaan pembeli
                      </p>
                    </div>
                  )}
                  {newOrders > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-blue-400 shrink-0 mt-0.5">ℹ</span>
                      <p className="text-gray-600">
                        Proses {newOrders} pesanan masuk secepatnya untuk menjaga kepuasan pembeli
                      </p>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-blue-400 shrink-0 mt-0.5">ℹ</span>
                    <p className="text-gray-600">
                      Lengkapi foto dan deskripsi produk untuk meningkatkan kepercayaan pembeli
                    </p>
                  </div>
                  {completionRate > 0 && completionRate < 80 && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-blue-400 shrink-0 mt-0.5">ℹ</span>
                      <p className="text-gray-600">
                        Pastikan tingkat keberhasilan pesanan mencapai 80% (sekarang {Math.round(completionRate)}%)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="w-64 shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
        <div className="p-4 space-y-5">

          {/* Store card */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
                {user?.name.charAt(0).toUpperCase() ?? 'S'}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-800 text-sm truncate">{user?.name ?? 'Seller'}</p>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                  Seller Reguler
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200 text-center">
              {[
                { label: 'Produk',  val: sellerProducts.length },
                { label: 'Pesanan', val: orders.length },
                { label: 'Selesai', val: completed },
              ].map(s => (
                <div key={s.label}>
                  <p className="font-bold text-gray-800">{s.val}</p>
                  <p className="text-[10px] text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <p className="font-semibold text-gray-700 text-sm mb-2">Aksi Cepat</p>
            <div className="space-y-2">
              <Link href="/seller/products/add"
                className="flex items-center gap-3 p-3 bg-red-700 text-white rounded-xl hover:bg-red-800 transition-colors">
                <span className="text-lg">➕</span>
                <div>
                  <p className="font-medium text-sm">Tambah Produk</p>
                  <p className="text-red-200 text-xs">Daftarkan komik baru</p>
                </div>
              </Link>
              <Link href="/seller/orders"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-red-200 transition-colors">
                <span className="text-lg">📬</span>
                <div>
                  <p className="font-medium text-sm text-gray-800">Kelola Pesanan</p>
                  <p className="text-gray-400 text-xs">
                    {newOrders > 0 ? `${newOrders} pesanan menunggu` : 'Tidak ada pesanan baru'}
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Articles */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-gray-700 text-sm">Keperluan untuk Jualan</p>
            </div>
            <div className="space-y-3">
              {TIPS_ARTICLES.map((a, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-50 to-orange-100 rounded-lg shrink-0 flex items-center justify-center text-2xl">
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 leading-snug mb-1">{a.title}</p>
                    <p className="text-[10px] text-gray-400">{a.category} · {a.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Revenue breakdown modal */}
      {showRevenue && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowRevenue(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">Rincian Pendapatan</h2>
              <button onClick={() => setShowRevenue(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {Object.keys(byMonth).length === 0 ? (
                <p className="text-center text-gray-400 py-8">Belum ada pesanan</p>
              ) : (
                Object.entries(byMonth).map(([month, monthOrders]) => (
                  <div key={month} className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-gray-700">{month}</p>
                      <p className="font-bold text-red-700">
                        {formatRupiah(monthOrders.reduce((s, o) => s + o.total, 0))}
                      </p>
                    </div>
                    {monthOrders.map(o => (
                      <div key={o.id} className="flex justify-between text-sm py-1.5 border-b border-gray-50">
                        <div>
                          <p className="text-gray-700">{o.id}</p>
                          <p className="text-xs text-gray-400">
                            {o.buyer.name} · {new Date(o.date).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <p className="font-medium text-gray-800">{formatRupiah(o.total)}</p>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between font-bold">
              <span>Total Pendapatan</span>
              <span className="text-red-700">{formatRupiah(totalRevenue)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
