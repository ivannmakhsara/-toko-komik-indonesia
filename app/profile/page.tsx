'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getOrders, cancelOrder, Order, STATUS_STEPS, STATUS_ICON, OrderStatus } from '@/lib/orders';
import { formatRupiah } from '@/lib/data';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

const statusColor: Record<string, string> = {
  'Pesanan Masuk': 'bg-orange-400/10 text-orange-400 border border-orange-400/20',
  'Diproses':      'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20',
  'Dikirim':       'bg-blue-400/10 text-blue-400 border border-blue-400/20',
  'Sampai':        'bg-purple-400/10 text-purple-400 border border-purple-400/20',
  'Selesai':       'bg-green-400/10 text-green-400 border border-green-400/20',
  'Dibatalkan':    'bg-red-500/10 text-red-400 border border-red-500/20',
};

const TABS = [
  { id: 'transaksi', label: 'Transaksi' },
  { id: 'koleksi',   label: 'Koleksi'   },
  { id: 'favorit',   label: 'Favorit'   },
];

function OrderCard({ order, onCancel, cancelling }: {
  order: Order;
  onCancel: (id: string) => void;
  cancelling: string | null;
}) {
  const cancelled = order.status === 'Dibatalkan';
  const stepIdx   = STATUS_STEPS.indexOf(order.status as OrderStatus);

  return (
    <div className="border border-white/[0.07] rounded-[16px] p-5 bg-white/[0.02]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <p className="font-semibold text-white/70 text-sm">{order.id}</p>
          <p className="text-xs text-white/30">{formatDate(order.date)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColor[order.status] ?? statusColor['Pesanan Masuk']}`}>
            {STATUS_ICON[order.status as OrderStatus]} {order.status}
          </span>
          {order.status === 'Pesanan Masuk' && (
            <button
              onClick={() => onCancel(order.id)}
              disabled={cancelling === order.id}
              className="text-xs px-3 py-1 rounded-full font-semibold border border-red-500/30 text-red-400/70 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 transition-colors disabled:opacity-40">
              {cancelling === order.id ? 'Membatalkan...' : 'Batalkan'}
            </button>
          )}
        </div>
      </div>

      {/* Stepper — hidden for cancelled */}
      {!cancelled && stepIdx >= 0 && (
        <div className="flex items-center mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {STATUS_STEPS.map((step, i) => {
            const done    = i <= stepIdx;
            const current = i === stepIdx;
            return (
              <div key={step} className="flex items-center shrink-0">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                    done ? (current ? 'bg-[#D90429] text-white ring-2 ring-[#D90429]/30' : 'bg-[#D90429] text-white') : 'bg-white/[0.06] text-white/25'
                  }`}>
                    {done && !current ? '✓' : i + 1}
                  </div>
                  <p className={`text-[10px] mt-1 whitespace-nowrap ${done ? 'text-[#D90429]/80 font-medium' : 'text-white/25'}`}>
                    {step}
                  </p>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`h-px w-7 mx-1 mb-4 ${i < stepIdx ? 'bg-[#D90429]/50' : 'bg-white/[0.06]'}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Items */}
      <div className="flex flex-col gap-1 mb-3">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-[13px]">
            <span className="text-white/50">{item.title} <span className="text-white/25">×{item.quantity}</span></span>
            <span className="text-white/60">{formatRupiah(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[13px] font-bold border-t border-white/[0.06] pt-2.5">
        <span className="text-white/40">Total (termasuk ongkir)</span>
        <span className={cancelled ? 'text-white/25 line-through' : 'text-[#D90429]'}>{formatRupiah(order.total)}</span>
      </div>
    </div>
  );
}

function ProfileContent() {
  const { user, loading, upgradeToSeller } = useAuth();
  const [upgrading,  setUpgrading]  = useState(false);
  const [orders,     setOrders]     = useState<Order[]>([]);
  const [editing,    setEditing]    = useState(false);
  const [editName,   setEditName]   = useState('');
  const [cancelling, setCancelling] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router       = useRouter();
  const tab          = searchParams.get('tab') ?? 'transaksi';

  function refreshOrders() {
    if (!user) return;
    getOrders().then(all =>
      setOrders(all.filter(o => o.userId === user.id || o.buyer.email === user.email))
    );
  }

  useEffect(() => {
    if (user) { refreshOrders(); setEditName(user.name); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.email, user?.name]);

  async function handleCancel(orderId: string) {
    if (!confirm('Batalkan pesanan ini? Tindakan tidak dapat diundur.')) return;
    setCancelling(orderId);
    await cancelOrder(orderId);
    refreshOrders();
    setCancelling(null);
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-white/30">Memuat...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-3xl mx-auto mb-5">👤</div>
        <h2 className="font-display text-xl font-bold text-[#F2F2F0] mb-2">Belum Masuk</h2>
        <p className="text-white/40 text-sm mb-6">Masuk untuk melihat profil dan riwayat pesananmu.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login"    className="bg-[#D90429] text-white px-6 py-2.5 rounded-[12px] hover:bg-[#B0021F] transition-colors font-semibold text-sm">Masuk</Link>
          <Link href="/register" className="border border-white/[0.10] text-white/60 px-6 py-2.5 rounded-[12px] hover:border-white/20 hover:text-white/80 transition-colors text-sm">Daftar</Link>
        </div>
      </div>
    );
  }

  const koleksi = orders
    .filter(o => o.status === 'Selesai')
    .flatMap(o => o.items);

  const activeOrders     = orders.filter(o => o.status !== 'Dibatalkan' && o.status !== 'Selesai');
  const completedOrders  = orders.filter(o => o.status === 'Selesai');
  const cancelledOrders  = orders.filter(o => o.status === 'Dibatalkan');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-[#F2F2F0] mb-6 tracking-tight">Akun Saya</h1>

      <div className="flex flex-col gap-5">

        {/* ── Profile card ── */}
        <div className="bg-[#111113] border border-white/[0.07] rounded-[20px] p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#D90429]/20 border border-[#D90429]/30 rounded-full flex items-center justify-center text-2xl font-bold text-[#D90429] shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {editing ? (
              <div className="flex-1 flex gap-2 items-center">
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  className="flex-1 bg-white/[0.05] border border-white/[0.10] rounded-[10px] px-3 py-1.5 text-sm text-white/80 focus:outline-none focus:border-white/25" />
                <button onClick={() => setEditing(false)}
                  className="bg-[#D90429] text-white px-3 py-1.5 rounded-[10px] text-sm hover:bg-[#B0021F] transition-colors">Simpan</button>
                <button onClick={() => setEditing(false)} className="text-white/30 text-sm hover:text-white/60 transition-colors">Batal</button>
              </div>
            ) : (
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-display font-bold text-[#F2F2F0]">{user.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${user.role === 'seller' ? 'bg-[#D90429]/10 text-[#D90429] border border-[#D90429]/20' : 'bg-blue-400/10 text-blue-400 border border-blue-400/20'}`}>
                    {user.role === 'seller' ? '🏪 Seller' : '🛍️ Pembeli'}
                  </span>
                </div>
                <p className="text-sm text-white/35">{user.email}</p>
              </div>
            )}
            {!editing && (
              <button onClick={() => setEditing(true)} className="text-[13px] text-white/30 hover:text-white/60 transition-colors shrink-0">Edit</button>
            )}
          </div>

          {user.role === 'buyer' && (
            <div className="mt-5 border-t border-white/[0.06] pt-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white/70">Ingin berjualan komik?</p>
                <p className="text-xs text-white/35 mt-0.5">Upgrade akun jadi Seller — gratis, tanpa daftar ulang.</p>
              </div>
              <button
                onClick={async () => {
                  if (!confirm('Upgrade akun jadi Seller? Kamu tetap bisa belanja seperti biasa.')) return;
                  setUpgrading(true);
                  await upgradeToSeller();
                  setUpgrading(false);
                }}
                disabled={upgrading}
                className="shrink-0 bg-[#D90429] text-white px-4 py-2 rounded-[12px] text-sm font-semibold hover:bg-[#B0021F] transition-colors disabled:opacity-50">
                {upgrading ? 'Memproses...' : '🏪 Buka Toko'}
              </button>
            </div>
          )}

          {user.role === 'seller' && (
            <div className="mt-4 border-t border-white/[0.06] pt-4">
              <Link href="/seller"
                className="inline-flex items-center gap-2 bg-[#D90429]/10 border border-[#D90429]/20 text-[#D90429] px-4 py-2 rounded-[12px] text-sm font-semibold hover:bg-[#D90429]/15 transition-colors">
                🏪 Kelola Toko Saya →
              </Link>
            </div>
          )}
        </div>

        {/* ── Tab panel ── */}
        <div className="bg-[#111113] border border-white/[0.07] rounded-[20px] overflow-hidden">

          {/* Tab bar */}
          <div className="flex border-b border-white/[0.07]">
            {TABS.map(t => (
              <button key={t.id}
                onClick={() => router.push(`/profile?tab=${t.id}`, { scroll: false })}
                className={`flex-1 py-3.5 text-[13px] font-semibold transition-colors relative ${
                  tab === t.id ? 'text-[#D90429]' : 'text-white/40 hover:text-white/60'
                }`}>
                {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D90429] rounded-t-full" />}
                {t.label}
                {t.id === 'transaksi' && orders.length > 0 && (
                  <span className="ml-1.5 text-[10px] bg-white/[0.08] text-white/35 px-1.5 py-0.5 rounded-full">{orders.length}</span>
                )}
                {t.id === 'koleksi' && koleksi.length > 0 && (
                  <span className="ml-1.5 text-[10px] bg-white/[0.08] text-white/35 px-1.5 py-0.5 rounded-full">{koleksi.length}</span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">

            {/* ── Transaksi ── */}
            {tab === 'transaksi' && (
              orders.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-2xl mx-auto mb-3">📦</div>
                  <p className="text-sm text-white/35 mb-4">Belum ada pesanan</p>
                  <Link href="/" className="bg-[#D90429] text-white px-5 py-2 rounded-[12px] hover:bg-[#B0021F] transition-colors text-sm font-semibold">
                    Mulai Belanja
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {activeOrders.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-white/25 tracking-widest uppercase mb-3">Sedang Berjalan</p>
                      <div className="flex flex-col gap-3">
                        {activeOrders.map(o => (
                          <OrderCard key={o.id} order={o} onCancel={handleCancel} cancelling={cancelling} />
                        ))}
                      </div>
                    </div>
                  )}
                  {completedOrders.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-white/25 tracking-widest uppercase mb-3 mt-2">Selesai</p>
                      <div className="flex flex-col gap-3">
                        {completedOrders.map(o => (
                          <OrderCard key={o.id} order={o} onCancel={handleCancel} cancelling={cancelling} />
                        ))}
                      </div>
                    </div>
                  )}
                  {cancelledOrders.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-white/25 tracking-widest uppercase mb-3 mt-2">Dibatalkan</p>
                      <div className="flex flex-col gap-3">
                        {cancelledOrders.map(o => (
                          <OrderCard key={o.id} order={o} onCancel={handleCancel} cancelling={cancelling} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}

            {/* ── Koleksi ── */}
            {tab === 'koleksi' && (
              koleksi.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-2xl mx-auto mb-3">📚</div>
                  <p className="text-sm text-white/35 mb-4">Belum ada komik di koleksimu</p>
                  <Link href="/" className="bg-[#D90429] text-white px-5 py-2 rounded-[12px] hover:bg-[#B0021F] transition-colors text-sm font-semibold">
                    Jelajahi Komik
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {koleksi.map((item, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/[0.07] rounded-[14px] p-3 flex flex-col gap-1">
                      <p className="text-[13px] font-semibold text-white/80 line-clamp-2 leading-snug">{item.title}</p>
                      <p className="text-[11px] text-white/35">{formatRupiah(item.price)}</p>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* ── Favorit / Wishlist ── */}
            {tab === 'favorit' && (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-2xl mx-auto mb-3">❤️</div>
                <p className="text-sm text-white/35 mb-1">Favorit kamu kosong</p>
                <p className="text-xs text-white/20 mb-4">Tap ikon hati di halaman komik untuk menyimpannya di sini.</p>
                <Link href="/" className="bg-[#D90429] text-white px-5 py-2 rounded-[12px] hover:bg-[#B0021F] transition-colors text-sm font-semibold">
                  Jelajahi Komik
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileContent />
    </Suspense>
  );
}
