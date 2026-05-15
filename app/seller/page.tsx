'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSeller } from '@/context/SellerContext';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { formatRupiah } from '@/lib/data';
import { getOrders, Order, OrderStatus } from '@/lib/orders';

const TIPS_ARTICLES = [
  { icon: '📈', title: 'Tips Meningkatkan Penjualan Komik', category: 'Strategi', date: '13 Mei 26', slug: 'tips-penjualan' },
  { icon: '📦', title: 'Cara Mengelola Stok dengan Efisien', category: 'Operasional', date: '10 Mei 26', slug: 'kelola-stok' },
  { icon: '📸', title: 'Pentingnya Foto Produk yang Menarik', category: 'Marketing', date: '5 Mei 26', slug: 'foto-produk' },
];

const ALL_STATUSES: OrderStatus[] = ['Pesanan Masuk', 'Diproses', 'Dikirim', 'Sampai', 'Selesai'];

const STATUS_COLOR: Record<OrderStatus, string> = {
  'Pesanan Masuk': 'bg-orange-500',
  'Diproses':      'bg-yellow-500',
  'Dikirim':       'bg-blue-500',
  'Sampai':        'bg-purple-500',
  'Selesai':       'bg-green-500',
  'Dibatalkan':    'bg-red-500',
  'Bermasalah':    'bg-amber-500',
};

export default function SellerDashboard() {
  const { sellerProducts, deleteAllProducts } = useSeller();
  const { unreadForSeller } = useChat();
  const { user } = useAuth();
  const [orders,          setOrders]          = useState<Order[]>([]);
  const [showRevenue,     setShowRevenue]     = useState(false);
  const [showDeleteStore, setShowDeleteStore] = useState(false);
  const [deletingStore,   setDeletingStore]   = useState(false);
  const [wishlistCount,   setWishlistCount]   = useState(0);
  const [lastUpdated,     setLastUpdated]     = useState('');

  useEffect(() => {
    getOrders().then(setOrders);
    setLastUpdated(
      new Date().toLocaleString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }) + ' WIB'
    );
  }, []);

  useEffect(() => {
    try {
      const wishlist: { id: string }[] = JSON.parse(localStorage.getItem('tki-wishlist') || '[]');
      const sellerIds = new Set(sellerProducts.map(p => p.id));
      setWishlistCount(wishlist.filter(c => sellerIds.has(c.id)).length);
    } catch { setWishlistCount(0); }
  }, [sellerProducts]);

  const totalRevenue   = orders.filter(o => o.status === 'Selesai').reduce((s, o) => s + o.total, 0);
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

  const completedOrders = orders.filter(o => o.status === 'Selesai');
  const byMonth: Record<string, Order[]> = {};
  completedOrders.forEach(o => {
    const k = new Date(o.date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    if (!byMonth[k]) byMonth[k] = [];
    byMonth[k].push(o);
  });

  const ACTIVITY = [
    { label: 'Pesanan Baru',   value: newOrders,             icon: '📬', href: '/seller/orders',   accent: 'text-orange-400' },
    { label: 'Siap Dikirim',   value: readyToShip,           icon: '📦', href: '/seller/orders',   accent: 'text-blue-400'   },
    { label: 'Chat Baru',      value: unreadForSeller,       icon: '💬', href: '/seller/chat',     accent: 'text-[#D90429]'  },
    { label: 'Produk Aktif',   value: sellerProducts.length, icon: '📚', href: '/seller/products', accent: 'text-purple-400' },
    { label: 'Di Wishlist',    value: wishlistCount,         icon: '🤍', href: '/seller/products', accent: 'text-pink-400'   },
  ];

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Main column ── */}
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="p-6 space-y-5 max-w-2xl">

          {/* Activity cards */}
          <section>
            <p className="text-[11px] text-white/25 mb-3 font-semibold uppercase tracking-widest">
              Aktivitas yang perlu kamu pantau
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {ACTIVITY.map(a => (
                <Link key={a.label} href={a.href}
                  className="bg-[#111113] border border-white/[0.07] rounded-[14px] p-4 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all">
                  <p className="text-xs text-white/35 mb-2">{a.icon} {a.label}</p>
                  <p className={`text-2xl font-bold ${a.accent}`}>{a.value}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Statistik Toko */}
          <section className="bg-[#111113] border border-white/[0.07] rounded-[16px] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <p className="font-semibold text-white/80">Statistik Toko</p>
                {lastUpdated && (
                  <p className="text-xs text-white/25 mt-0.5">Update terakhir: {lastUpdated}</p>
                )}
              </div>
            </div>
            <div className="p-5">
              {/* 3 main stats */}
              <div className="grid grid-cols-3 gap-5 mb-6 pb-6 border-b border-white/[0.06]">
                <div>
                  <p className="text-xs text-white/30 mb-1">Total Pendapatan</p>
                  <button onClick={() => setShowRevenue(true)} className="text-left group">
                    <p className="text-xl font-bold text-[#F2F2F0] group-hover:text-[#D90429] transition-colors">
                      {formatRupiah(totalRevenue)}
                    </p>
                    <p className="text-xs text-white/25 mt-0.5">
                      dari {completedOrders.length} pesanan selesai · <span className="text-[#D90429]/60 group-hover:underline">lihat rincian</span>
                    </p>
                  </button>
                </div>
                <div>
                  <p className="text-xs text-white/30 mb-1">Produk Terdaftar</p>
                  <p className="text-xl font-bold text-[#F2F2F0]">{sellerProducts.length}</p>
                  <p className="text-xs text-white/25 mt-0.5">produk kamu</p>
                </div>
                <div>
                  <p className="text-xs text-white/30 mb-1">Pesanan Selesai</p>
                  <p className="text-xl font-bold text-[#F2F2F0]">{completed}</p>
                  <p className="text-xs text-white/25 mt-0.5">
                    {orders.length > 0 ? `${Math.round(completionRate)}% completion rate` : '—'}
                  </p>
                </div>
              </div>

              {/* Order status breakdown */}
              {orders.length > 0 ? (
                <div>
                  <p className="text-xs text-white/30 font-medium mb-3">Breakdown Status Pesanan</p>
                  <div className="flex gap-3">
                    {ALL_STATUSES.map(s => {
                      const count = statusCounts[s];
                      const pct   = orders.length > 0 ? (count / orders.length) * 100 : 0;
                      return (
                        <div key={s} className="flex-1">
                          <div className="h-1.5 bg-white/[0.06] rounded-full mb-2">
                            <div className={`h-full rounded-full ${STATUS_COLOR[s]} transition-all`}
                              style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-[10px] text-white/25 leading-tight truncate">{s}</p>
                          <p className="text-sm font-bold text-white/60 mt-0.5">{count}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-3xl mb-2">📊</p>
                  <p className="text-sm font-medium text-white/40 mb-1">Belum ada data</p>
                  <p className="text-xs text-white/25">
                    Statistik akan muncul setelah ada pesanan masuk
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Performa Toko */}
          <section className="bg-[#111113] border border-white/[0.07] rounded-[16px] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <p className="font-semibold text-white/80">Performa Toko</p>
            </div>
            <div className="p-5 flex gap-6">
              {/* Score gauge */}
              <div className="shrink-0 w-44">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-white/[0.07] text-white/50 px-2 py-0.5 rounded-full font-medium">
                    Level 1
                  </span>
                  <span className="text-xs text-white/30">Seller Reguler</span>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      perfScore >= 80 ? 'bg-green-500' : perfScore >= 60 ? 'bg-yellow-500' : 'bg-[#D90429]'
                    }`}
                    style={{ width: `${perfScore}%` }}
                  />
                </div>
                <p className="text-xs text-white/30 mb-0.5">Skor performa:</p>
                <p>
                  <span className="text-3xl font-bold text-[#F2F2F0]">{perfScore}</span>
                  <span className="text-white/30 text-sm"> /100</span>
                </p>
              </div>

              {/* Tips */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/25 font-semibold uppercase tracking-widest mb-3">
                  Tips meningkatkan performa
                </p>
                <div className="space-y-2.5">
                  {sellerProducts.length === 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-orange-400 shrink-0 mt-0.5">⚠</span>
                      <p className="text-white/50">Tambahkan produk pertama untuk mulai berjualan</p>
                    </div>
                  )}
                  {unreadForSeller > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-orange-400 shrink-0 mt-0.5">⚠</span>
                      <p className="text-white/50">
                        {unreadForSeller} pesan belum dibalas — respons cepat meningkatkan kepercayaan pembeli
                      </p>
                    </div>
                  )}
                  {newOrders > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-blue-400 shrink-0 mt-0.5">ℹ</span>
                      <p className="text-white/50">
                        Proses {newOrders} pesanan masuk secepatnya untuk menjaga kepuasan pembeli
                      </p>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-blue-400 shrink-0 mt-0.5">ℹ</span>
                    <p className="text-white/50">
                      Lengkapi foto dan deskripsi produk untuk meningkatkan kepercayaan pembeli
                    </p>
                  </div>
                  {completionRate > 0 && completionRate < 80 && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-blue-400 shrink-0 mt-0.5">ℹ</span>
                      <p className="text-white/50">
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
      <div className="w-64 shrink-0 border-l border-white/[0.05] overflow-y-auto">
        <div className="p-4 space-y-5">

          {/* Store card */}
          <div className="bg-[#111113] border border-white/[0.07] rounded-[14px] p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#D90429] rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
                {user?.name.charAt(0).toUpperCase() ?? 'S'}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white/80 text-sm truncate">{user?.name ?? 'Seller'}</p>
                <span className="text-xs bg-[#D90429]/10 text-[#D90429] border border-[#D90429]/20 px-2 py-0.5 rounded-full font-medium">
                  Seller Reguler
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.06] text-center">
              {[
                { label: 'Produk',  val: sellerProducts.length },
                { label: 'Pesanan', val: orders.length },
                { label: 'Selesai', val: completed },
              ].map(s => (
                <div key={s.label}>
                  <p className="font-bold text-white/80">{s.val}</p>
                  <p className="text-[10px] text-white/30">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Lihat toko */}
          {user?.id && (
            <Link href={`/toko/${user.id}`}
              className="w-full py-2 flex items-center justify-center gap-1.5 rounded-[10px] border border-white/[0.08] text-white/40 text-xs font-semibold hover:border-white/[0.15] hover:text-white/60 transition-colors">
              Lihat Tampilan Toko →
            </Link>
          )}

          {/* Delete store */}
          <button
            onClick={() => setShowDeleteStore(true)}
            className="w-full py-2 rounded-[10px] border border-red-500/20 text-red-400/50 text-xs font-semibold hover:border-red-500/40 hover:text-red-400/80 hover:bg-red-500/[0.05] transition-colors">
            🗑 Hapus Toko &amp; Semua Produk
          </button>

          {/* Quick actions */}
          <div>
            <p className="font-semibold text-white/40 text-[11px] uppercase tracking-widest mb-2">Aksi Cepat</p>
            <div className="space-y-2">
              <Link href="/seller/products/add"
                className="flex items-center gap-3 p-3 bg-[#D90429] text-white rounded-[12px] hover:bg-[#B0021F] transition-colors">
                <span className="text-lg">➕</span>
                <div>
                  <p className="font-medium text-sm">Tambah Produk</p>
                  <p className="text-white/60 text-xs">Daftarkan komik baru</p>
                </div>
              </Link>
              <Link href="/seller/orders"
                className="flex items-center gap-3 p-3 bg-[#111113] border border-white/[0.07] rounded-[12px] hover:border-white/[0.12] transition-colors">
                <span className="text-lg">📬</span>
                <div>
                  <p className="font-medium text-sm text-white/70">Kelola Pesanan</p>
                  <p className="text-white/30 text-xs">
                    {newOrders > 0 ? `${newOrders} pesanan menunggu` : 'Tidak ada pesanan baru'}
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Articles */}
          <div>
            <p className="font-semibold text-white/40 text-[11px] uppercase tracking-widest mb-3">Tips Jualan</p>
            <div className="space-y-3">
              {TIPS_ARTICLES.map((a, i) => (
                <Link key={i} href={`/seller/tips/${a.slug}`} className="flex gap-3 hover:bg-white/[0.03] rounded-[10px] p-1 -m-1 transition-colors">
                  <div className="w-12 h-12 bg-[#D90429]/10 border border-[#D90429]/15 rounded-[10px] shrink-0 flex items-center justify-center text-xl">
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white/60 leading-snug mb-1 hover:text-white/80 transition-colors">{a.title}</p>
                    <p className="text-[10px] text-white/25">{a.category} · {a.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Delete store modal */}
      {showDeleteStore && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteStore(false)}>
          <div className="bg-[#111113] border border-white/[0.10] rounded-[20px] p-6 w-full max-w-sm"
            onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-[14px] flex items-center justify-center text-2xl mx-auto mb-4">🗑</div>
            <h3 className="font-display font-bold text-[#F2F2F0] text-center mb-2">Hapus Toko?</h3>
            <p className="text-white/40 text-sm text-center mb-5">
              Semua produk tokomu akan dihapus permanen. Pesanan yang sudah masuk tidak terpengaruh.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteStore(false)}
                className="flex-1 py-2.5 rounded-[10px] border border-white/[0.10] text-white/45 hover:text-white/70 text-sm transition-colors">
                Batal
              </button>
              <button
                disabled={deletingStore}
                onClick={async () => {
                  setDeletingStore(true);
                  await deleteAllProducts();
                  setDeletingStore(false);
                  setShowDeleteStore(false);
                }}
                className="flex-1 py-2.5 rounded-[10px] bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50">
                {deletingStore ? 'Menghapus...' : 'Ya, Hapus Toko'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revenue breakdown modal */}
      {showRevenue && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowRevenue(false)}>
          <div className="bg-[#111113] border border-white/[0.10] rounded-[20px] w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between">
              <h2 className="font-bold text-white/80">Rincian Pendapatan</h2>
              <button onClick={() => setShowRevenue(false)} className="text-white/30 hover:text-white/60 transition-colors">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {Object.keys(byMonth).length === 0 ? (
                <p className="text-center text-white/30 py-8">Belum ada pesanan</p>
              ) : (
                Object.entries(byMonth).map(([month, monthOrders]) => (
                  <div key={month} className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-white/60">{month}</p>
                      <p className="font-bold text-[#D90429]">
                        {formatRupiah(monthOrders.reduce((s, o) => s + o.total, 0))}
                      </p>
                    </div>
                    {monthOrders.map(o => (
                      <div key={o.id} className="flex justify-between text-sm py-1.5 border-b border-white/[0.05]">
                        <div>
                          <p className="text-white/60">{o.id}</p>
                          <p className="text-xs text-white/25">
                            {o.buyer.name} · {new Date(o.date).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <p className="font-medium text-white/70">{formatRupiah(o.total)}</p>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
            <div className="px-6 py-4 border-t border-white/[0.07] flex justify-between font-bold">
              <span className="text-white/50">Total Pendapatan</span>
              <span className="text-[#D90429]">{formatRupiah(totalRevenue)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
