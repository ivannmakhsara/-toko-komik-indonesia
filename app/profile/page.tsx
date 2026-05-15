'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import {
  getOrders, cancelOrder, updateOrderStatus, getCancelReason,
  Order, OrderItem, STATUS_STEPS, STATUS_ICON, OrderStatus,
} from '@/lib/orders';
import { saveReview } from '@/lib/reviews';
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

const BUYER_CANCEL_REASONS = [
  'Salah pilih produk',
  'Ingin ganti metode pembayaran',
  'Harga lebih murah di tempat lain',
  'Pesanan duplikat',
  'Alasan lainnya',
];

const TABS = [
  { id: 'transaksi', label: 'Transaksi' },
  { id: 'koleksi',   label: 'Koleksi'   },
  { id: 'wishlist',  label: 'Wishlist'  },
  { id: 'favorit',   label: 'Favorit'   },
];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button"
          onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className="text-3xl transition-transform hover:scale-110 active:scale-95">
          <span className={(hover || value) >= s ? 'text-yellow-400' : 'text-white/20'}>★</span>
        </button>
      ))}
    </div>
  );
}

function OrderCard({ order, onCancelClick, onConfirmReceived, onWriteReview, reviewedKeys }: {
  order: Order;
  onCancelClick: (id: string) => void;
  onConfirmReceived: (id: string) => void;
  onWriteReview: (orderId: string, item: OrderItem) => void;
  reviewedKeys: Set<string>;
}) {
  const cancelled  = order.status === 'Dibatalkan';
  const stepIdx    = STATUS_STEPS.indexOf(order.status as OrderStatus);
  const canCancel  = order.status === 'Pesanan Masuk' || order.status === 'Diproses';
  const canConfirm = order.status === 'Dikirim';
  const isSelesai  = order.status === 'Selesai';
  const cancelReason = getCancelReason(order.id);

  return (
    <div className="border border-white/[0.07] rounded-[16px] p-5 bg-white/[0.02]">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div>
          <p className="font-semibold text-white/70 text-sm">{order.id}</p>
          <p className="text-xs text-white/30">{formatDate(order.date)}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColor[order.status] ?? statusColor['Pesanan Masuk']}`}>
            {STATUS_ICON[order.status as OrderStatus]} {order.status}
          </span>
          {canCancel && (
            <button onClick={() => onCancelClick(order.id)}
              className="text-xs px-3 py-1 rounded-full font-semibold border border-red-500/30 text-red-400/70 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 transition-colors">
              Batalkan
            </button>
          )}
          {canConfirm && (
            <button onClick={() => onConfirmReceived(order.id)}
              className="text-xs px-3 py-1 rounded-full font-semibold border border-green-500/30 text-green-400/70 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/50 transition-colors">
              Konfirmasi Diterima
            </button>
          )}
        </div>
      </div>

      {/* Stepper */}
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
                  <p className={`text-[10px] mt-1 whitespace-nowrap ${done ? 'text-[#D90429]/80 font-medium' : 'text-white/25'}`}>{step}</p>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`h-px w-7 mx-1 mb-4 ${i < stepIdx ? 'bg-[#D90429]/50' : 'bg-white/[0.06]'}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel reason */}
      {cancelled && cancelReason && (
        <div className="mb-3 px-3 py-2 bg-red-500/[0.06] border border-red-500/20 rounded-[10px]">
          <p className="text-xs text-red-400/70">Alasan: <span className="font-medium">{cancelReason}</span></p>
        </div>
      )}

      {/* Items */}
      <div className="flex flex-col gap-1.5 mb-3">
        {order.items.map((item, i) => {
          const key = `${order.id}::${item.title}`;
          const reviewed = reviewedKeys.has(key);
          return (
            <div key={i} className="flex justify-between items-center text-[13px] gap-2">
              <div className="flex-1 min-w-0">
                <span className="text-white/50">{item.title}</span>
                <span className="text-white/25"> ×{item.quantity}</span>
                {isSelesai && (
                  reviewed ? (
                    <span className="ml-2 text-[10px] text-green-400/60 font-medium">✓ Diulas</span>
                  ) : (
                    <button onClick={() => onWriteReview(order.id, item)}
                      className="ml-2 text-[10px] text-[#D90429]/70 hover:text-[#D90429] font-semibold transition-colors underline underline-offset-2">
                      Tulis Ulasan
                    </button>
                  )
                )}
              </div>
              <span className="text-white/60 shrink-0">{formatRupiah(item.price * item.quantity)}</span>
            </div>
          );
        })}
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
  const { addToCart } = useCart();
  const { wishlist, removeFromWishlist } = useWishlist();
  const [upgrading, setUpgrading] = useState(false);
  const [orders,    setOrders]    = useState<Order[]>([]);
  const [editing,   setEditing]   = useState(false);
  const [editName,  setEditName]  = useState('');
  const [avatar,    setAvatar]    = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Cancel modal state
  const [cancelModal,      setCancelModal]      = useState<string | null>(null);
  const [cancelReason,     setCancelReason]     = useState('');
  const [cancelReasonText, setCancelReasonText] = useState('');
  const [cancelling,       setCancelling]       = useState(false);

  // Review modal state
  const [reviewModal,      setReviewModal]      = useState<{ orderId: string; item: OrderItem } | null>(null);
  const [reviewRating,     setReviewRating]     = useState(0);
  const [reviewText,       setReviewText]       = useState('');
  const [reviewPhotos,     setReviewPhotos]     = useState<string[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedKeys,     setReviewedKeys]     = useState<Set<string>>(new Set());

  const photoInputRef = useRef<HTMLInputElement>(null);
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const tab           = searchParams.get('tab') ?? 'transaksi';

  function refreshOrders() {
    if (!user) return;
    getOrders().then(all =>
      setOrders(all.filter(o => o.userId === user.id || o.buyer.email === user.email))
    );
  }

  function refreshReviewedKeys() {
    try {
      const all = JSON.parse(localStorage.getItem('tki-reviews') || '[]') as Array<{ orderId: string; productTitle: string }>;
      setReviewedKeys(new Set(all.map(r => `${r.orderId}::${r.productTitle}`)));
    } catch { setReviewedKeys(new Set()); }
  }

  useEffect(() => {
    if (user) {
      refreshOrders();
      setEditName(user.name);
      refreshReviewedKeys();
      setAvatar(localStorage.getItem(`tki-avatar-${user.id}`));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.email, user?.name]);

  function handleAvatarUpload(file: File | null) {
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = e => {
      const b64 = e.target?.result as string;
      localStorage.setItem(`tki-avatar-${user.id}`, b64);
      setAvatar(b64);
      window.dispatchEvent(new Event('avatar-changed'));
    };
    reader.readAsDataURL(file);
  }

  function handleAvatarDelete() {
    if (!user) return;
    localStorage.removeItem(`tki-avatar-${user.id}`);
    setAvatar(null);
    window.dispatchEvent(new Event('avatar-changed'));
  }

  // ── Cancel flow ──
  function openCancelModal(orderId: string) {
    setCancelModal(orderId);
    setCancelReason('');
    setCancelReasonText('');
  }

  async function handleConfirmCancel() {
    if (!cancelModal) return;
    const reason = cancelReason === 'Alasan lainnya' ? cancelReasonText.trim() : cancelReason;
    if (!reason) { alert('Pilih atau tuliskan alasan pembatalan.'); return; }
    setCancelling(true);
    await cancelOrder(cancelModal, reason);
    setCancelModal(null);
    setCancelling(false);
    refreshOrders();
  }

  // ── Confirm received flow ──
  async function handleConfirmReceived(orderId: string) {
    if (!confirm('Konfirmasi pesanan sudah diterima dan selesai?')) return;
    await updateOrderStatus(orderId, 'Selesai');
    refreshOrders();
  }

  // ── Review flow ──
  function openReviewModal(orderId: string, item: OrderItem) {
    setReviewModal({ orderId, item });
    setReviewRating(0);
    setReviewText('');
    setReviewPhotos([]);
  }

  async function handlePhotoUpload(files: FileList | null) {
    if (!files) return;
    const remaining = 3 - reviewPhotos.length;
    const toProcess = Array.from(files).slice(0, remaining);
    const base64s = await Promise.all(toProcess.map(f => new Promise<string>(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.readAsDataURL(f);
    })));
    setReviewPhotos(prev => [...prev, ...base64s]);
  }

  async function handleSubmitReview() {
    if (!reviewModal || !user) return;
    if (reviewRating === 0) { alert('Pilih rating bintang terlebih dahulu.'); return; }
    setSubmittingReview(true);
    saveReview({
      id:           `rv-${Date.now()}`,
      orderId:      reviewModal.orderId,
      productTitle: reviewModal.item.title,
      rating:       reviewRating,
      text:         reviewText,
      photos:       reviewPhotos,
      buyerName:    user.name,
      date:         new Date().toISOString(),
    });
    setReviewModal(null);
    setSubmittingReview(false);
    refreshReviewedKeys();
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

  const koleksi          = orders.filter(o => o.status === 'Selesai').flatMap(o => o.items);
  const activeOrders     = orders.filter(o => o.status !== 'Dibatalkan' && o.status !== 'Selesai');
  const completedOrders  = orders.filter(o => o.status === 'Selesai');
  const cancelledOrders  = orders.filter(o => o.status === 'Dibatalkan');

  const cardProps = { onCancelClick: openCancelModal, onConfirmReceived: handleConfirmReceived, onWriteReview: openReviewModal, reviewedKeys };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-[#F2F2F0] mb-6 tracking-tight">Akun Saya</h1>

      <div className="flex flex-col gap-5">

        {/* ── Profile card ── */}
        <div className="bg-[#111113] border border-white/[0.07] rounded-[20px] p-6">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="w-14 h-14 rounded-full relative group overflow-hidden border-2 border-[#D90429]/30 hover:border-[#D90429]/60 transition-colors"
                title="Ganti foto profil"
              >
                {avatar
                  ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-[#D90429]/20 flex items-center justify-center text-2xl font-bold text-[#D90429]">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                }
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-semibold">Ganti</span>
                </div>
              </button>
              {avatar && (
                <button onClick={handleAvatarDelete}
                  className="text-[10px] text-red-400/50 hover:text-red-400 transition-colors">
                  Hapus
                </button>
              )}
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { handleAvatarUpload(e.target.files?.[0] ?? null); (e.target as HTMLInputElement).value = ''; }}
            />
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
            <div className="mt-4 border-t border-white/[0.06] pt-4 flex items-center gap-3 flex-wrap">
              <Link href="/seller"
                className="inline-flex items-center gap-2 bg-[#D90429]/10 border border-[#D90429]/20 text-[#D90429] px-4 py-2 rounded-[12px] text-sm font-semibold hover:bg-[#D90429]/15 transition-colors">
                🏪 Kelola Toko Saya →
              </Link>
              <Link href={`/toko/${user.id}`}
                className="inline-flex items-center gap-2 border border-white/[0.10] text-white/50 px-4 py-2 rounded-[12px] text-sm font-semibold hover:border-white/20 hover:text-white/70 transition-colors">
                Lihat Toko →
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
                {t.id === 'wishlist' && wishlist.length > 0 && (
                  <span className="ml-1.5 text-[10px] bg-white/[0.08] text-white/35 px-1.5 py-0.5 rounded-full">{wishlist.length}</span>
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
                  <Link href="/" className="bg-[#D90429] text-white px-5 py-2 rounded-[12px] hover:bg-[#B0021F] transition-colors text-sm font-semibold">Mulai Belanja</Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {activeOrders.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-white/25 tracking-widest uppercase mb-3">Sedang Berjalan</p>
                      <div className="flex flex-col gap-3">
                        {activeOrders.map(o => <OrderCard key={o.id} order={o} {...cardProps} />)}
                      </div>
                    </div>
                  )}
                  {completedOrders.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-white/25 tracking-widest uppercase mb-3 mt-2">Selesai</p>
                      <div className="flex flex-col gap-3">
                        {completedOrders.map(o => <OrderCard key={o.id} order={o} {...cardProps} />)}
                      </div>
                    </div>
                  )}
                  {cancelledOrders.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-white/25 tracking-widest uppercase mb-3 mt-2">Dibatalkan</p>
                      <div className="flex flex-col gap-3">
                        {cancelledOrders.map(o => <OrderCard key={o.id} order={o} {...cardProps} />)}
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
                  <Link href="/" className="bg-[#D90429] text-white px-5 py-2 rounded-[12px] hover:bg-[#B0021F] transition-colors text-sm font-semibold">Jelajahi Komik</Link>
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

            {/* ── Wishlist ── */}
            {tab === 'wishlist' && (
              wishlist.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-2xl mx-auto mb-3">🔖</div>
                  <p className="text-sm text-white/35 mb-1">Wishlist kamu kosong</p>
                  <p className="text-xs text-white/20 mb-4">Simpan komik dengan ikon ♡ di kartu produk.</p>
                  <Link href="/" className="bg-[#D90429] text-white px-5 py-2 rounded-[12px] hover:bg-[#B0021F] transition-colors text-sm font-semibold">Jelajahi Komik</Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {wishlist.map(comic => (
                    <div key={comic.id} className="flex items-center gap-4 p-3 bg-white/[0.02] border border-white/[0.07] rounded-[14px]">
                      <Link href={`/products/${comic.id}`}
                        className="w-12 h-16 rounded-[8px] overflow-hidden shrink-0 border border-white/[0.07]"
                        style={{ background: `linear-gradient(135deg, ${comic.color}BB, ${comic.color})` }}>
                        {(comic.coverImage || comic.cover) && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={(comic.coverImage || comic.cover)!} alt={comic.title} className="w-full h-full object-cover" />
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${comic.id}`}>
                          <p className="text-[13px] font-semibold text-white/80 truncate hover:text-white transition-colors">{comic.title}</p>
                        </Link>
                        <p className="text-[11px] text-white/35 truncate">{comic.author} · {comic.genre}</p>
                        <p className="text-[13px] font-bold text-[#D90429] mt-1">{formatRupiah(comic.price)}</p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => addToCart(comic)}
                          className="text-[11px] font-semibold px-3 py-1.5 bg-[#D90429] text-white rounded-[9px] hover:bg-[#B0021F] transition-colors whitespace-nowrap">
                          + Keranjang
                        </button>
                        <button onClick={() => removeFromWishlist(comic.id)}
                          className="text-[11px] text-white/30 hover:text-red-400 transition-colors text-center">
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* ── Favorit ── */}
            {tab === 'favorit' && (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-2xl mx-auto mb-3">❤️</div>
                <p className="text-sm text-white/35 mb-1">Fitur favorit segera hadir</p>
                <p className="text-xs text-white/20 mb-4">Beri rating komik yang sudah kamu beli untuk menyimpannya di sini.</p>
                <Link href="/" className="bg-[#D90429] text-white px-5 py-2 rounded-[12px] hover:bg-[#B0021F] transition-colors text-sm font-semibold">Jelajahi Komik</Link>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Cancel modal ── */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-white/[0.10] rounded-[20px] p-6 w-full max-w-sm">
            <h3 className="font-display font-bold text-[#F2F2F0] mb-1">Batalkan Pesanan</h3>
            <p className="text-xs text-white/35 mb-5">Pilih alasan pembatalan pesananmu.</p>

            <div className="flex flex-col gap-2 mb-4">
              {BUYER_CANCEL_REASONS.map(r => (
                <button key={r}
                  onClick={() => { setCancelReason(r); if (r !== 'Alasan lainnya') setCancelReasonText(''); }}
                  className={`text-left px-4 py-2.5 rounded-[12px] text-sm font-medium border transition-all ${
                    cancelReason === r
                      ? 'border-[#D90429]/60 bg-[#D90429]/10 text-white/80'
                      : 'border-white/[0.08] text-white/40 hover:border-white/[0.15] hover:text-white/60'
                  }`}>
                  {r}
                </button>
              ))}
            </div>

            {cancelReason === 'Alasan lainnya' && (
              <textarea
                value={cancelReasonText}
                onChange={e => setCancelReasonText(e.target.value)}
                placeholder="Tuliskan alasan..."
                rows={3}
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-[12px] px-4 py-3 text-sm text-white/70 placeholder-white/25 focus:outline-none focus:border-white/25 resize-none mb-4"
              />
            )}

            <div className="flex gap-3">
              <button onClick={() => setCancelModal(null)}
                className="flex-1 border border-white/[0.10] text-white/50 py-2.5 rounded-[12px] text-sm hover:border-white/20 hover:text-white/70 transition-colors">
                Kembali
              </button>
              <button onClick={handleConfirmCancel} disabled={cancelling}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-[12px] text-sm font-semibold hover:bg-red-500 transition-colors disabled:opacity-50">
                {cancelling ? 'Membatalkan...' : 'Batalkan Pesanan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Review modal ── */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-white/[0.10] rounded-[20px] p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <h3 className="font-display font-bold text-[#F2F2F0] mb-1">Tulis Ulasan</h3>
            <p className="text-xs text-white/35 mb-5 truncate">{reviewModal.item.title}</p>

            {/* Stars */}
            <div className="mb-5">
              <p className="text-xs text-white/40 mb-2">Rating keseluruhan</p>
              <StarRating value={reviewRating} onChange={setReviewRating} />
              <p className="text-xs text-white/30 mt-1.5">
                {['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Sangat Bagus'][reviewRating] ?? 'Pilih bintang'}
              </p>
            </div>

            {/* Text */}
            <div className="mb-5">
              <p className="text-xs text-white/40 mb-2">Ulasan (opsional)</p>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Bagikan pengalamanmu membaca komik ini..."
                rows={4}
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-[12px] px-4 py-3 text-sm text-white/70 placeholder-white/25 focus:outline-none focus:border-white/25 resize-none"
              />
            </div>

            {/* Photos */}
            <div className="mb-6">
              <p className="text-xs text-white/40 mb-2">Foto (maks. 3)</p>
              <div className="flex gap-2 flex-wrap">
                {reviewPhotos.map((src, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-[10px] overflow-hidden border border-white/[0.10]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setReviewPhotos(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white text-[10px] rounded-full flex items-center justify-center hover:bg-red-600/80 transition-colors">
                      ✕
                    </button>
                  </div>
                ))}
                {reviewPhotos.length < 3 && (
                  <button onClick={() => photoInputRef.current?.click()}
                    className="w-16 h-16 rounded-[10px] border border-dashed border-white/[0.15] flex flex-col items-center justify-center gap-1 text-white/25 hover:border-white/30 hover:text-white/40 transition-colors">
                    <span className="text-xl leading-none">+</span>
                    <span className="text-[9px]">Foto</span>
                  </button>
                )}
              </div>
              <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden"
                onChange={e => { handlePhotoUpload(e.target.files); e.target.value = ''; }} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setReviewModal(null)}
                className="flex-1 border border-white/[0.10] text-white/50 py-2.5 rounded-[12px] text-sm hover:border-white/20 hover:text-white/70 transition-colors">
                Batal
              </button>
              <button onClick={handleSubmitReview} disabled={submittingReview || reviewRating === 0}
                className="flex-1 bg-[#D90429] text-white py-2.5 rounded-[12px] text-sm font-semibold hover:bg-[#B0021F] transition-colors disabled:opacity-50">
                {submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
              </button>
            </div>
          </div>
        </div>
      )}
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
