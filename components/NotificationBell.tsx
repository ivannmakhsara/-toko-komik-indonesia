'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { getOrders, Order, OrderStatus } from '@/lib/orders';

const STATUSES: { status: OrderStatus; icon: string; label: string }[] = [
  { status: 'Pesanan Masuk', icon: '🕐', label: 'Menunggu\nKonfirmasi' },
  { status: 'Diproses',      icon: '📦', label: 'Pesanan\nDiproses'   },
  { status: 'Dikirim',       icon: '🚚', label: 'Sedang\nDikirim'     },
  { status: 'Sampai',        icon: '📍', label: 'Sampai\nTujuan'      },
];

interface FollowUpdate {
  id: string;
  sellerId: string;
  sellerName: string;
  productTitle: string;
  date: string;
  read: boolean;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const { unreadForSeller, unreadForUser, messages, markAllRead, setIsOpen: openChat } = useChat();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'transaksi' | 'update'>('transaksi');
  const [orders, setOrders] = useState<Order[]>([]);
  const [followUpdates, setFollowUpdates] = useState<FollowUpdate[]>([]);

  useEffect(() => {
    if (!user || user.role === 'seller') return;
    const key = `tki-follow-updates-${user.id}`;
    try {
      setFollowUpdates(JSON.parse(localStorage.getItem(key) || '[]'));
    } catch { /* ignore */ }
  }, [open, user]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) getOrders().then(setOrders);
  }, [open]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const isSeller = user.role === 'seller';

  const relevantOrders = isSeller
    ? orders
    : orders.filter(o => o.userId === user.id || o.buyer?.email === user.email);

  const statusCounts: Partial<Record<OrderStatus, number>> = {};
  STATUSES.forEach(s => {
    statusCounts[s.status] = relevantOrders.filter(o => o.status === s.status).length;
  });

  const unreadChat    = isSeller ? unreadForSeller : unreadForUser;
  const unreadFollows = !isSeller ? followUpdates.filter(u => !u.read).length : 0;
  const totalBadge    = Object.values(statusCounts).reduce((a, b) => a + (b ?? 0), 0) + unreadChat + unreadFollows;

  const unreadMsgs = messages.filter(m =>
    isSeller ? (m.sender === 'user' && !m.read) : (m.sender === 'seller' && !m.read)
  ).slice(-5);

  function handleMarkAllRead() {
    markAllRead(isSeller ? 'seller' : 'user');
    if (!isSeller && user) {
      const key = `tki-follow-updates-${user.id}`;
      try {
        const updated = followUpdates.map(u => ({ ...u, read: true }));
        localStorage.setItem(key, JSON.stringify(updated));
        setFollowUpdates(updated);
      } catch { /* ignore */ }
    }
  }

  function handleOpenChat() {
    setOpen(false);
    openChat(true);
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-red-800 transition-colors"
        aria-label="Notifikasi"
      >
        <span className="text-lg">🔔</span>
        {totalBadge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-red-900 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
            {totalBadge > 9 ? '9+' : totalBadge}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-[60] overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {(['transaksi', 'update'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
                  tab === t
                    ? 'border-red-600 text-red-700'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {t === 'transaksi' ? 'Transaksi' : 'Update'}
                {t === 'update' && (unreadChat + unreadFollows) > 0 && (
                  <span className="ml-1.5 bg-red-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                    {unreadChat + unreadFollows}
                  </span>
                )}
              </button>
            ))}
          </div>

          {tab === 'transaksi' ? (
            <div className="py-3">
              {/* Section header */}
              <div className="flex items-center justify-between px-4 mb-3">
                <span className="font-semibold text-gray-800 text-sm">
                  {isSeller ? 'Penjualan' : 'Pembelian'}
                </span>
                <Link
                  href={isSeller ? '/seller/orders' : '/profile'}
                  onClick={() => setOpen(false)}
                  className="text-xs text-red-700 hover:underline"
                >
                  Lihat Semua
                </Link>
              </div>

              {/* Status grid */}
              <div className="grid grid-cols-4 gap-1 px-3 mb-4">
                {STATUSES.map(s => (
                  <Link
                    key={s.status}
                    href={isSeller ? '/seller/orders' : '/profile'}
                    onClick={() => setOpen(false)}
                    className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <span className="relative text-2xl">
                      {s.icon}
                      {(statusCounts[s.status] ?? 0) > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {statusCounts[s.status]}
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-gray-500 text-center leading-tight whitespace-pre-line">
                      {s.label}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Untuk Kamu */}
              <div className="border-t border-gray-100 pt-3">
                <p className="px-4 font-semibold text-gray-800 text-sm mb-2">Untuk Kamu</p>
                {relevantOrders.length === 0 ? (
                  <div className="flex flex-col items-center py-5 px-4 text-center">
                    <p className="text-3xl mb-2">📭</p>
                    <p className="font-semibold text-gray-700 text-sm mb-1">Belum ada notifikasi</p>
                    <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                      Notifikasi terkait transaksi kamu bakal muncul di sini
                    </p>
                    <Link
                      href={isSeller ? '/seller' : '/'}
                      onClick={() => setOpen(false)}
                      className="bg-red-700 text-white text-sm font-semibold px-6 py-2 rounded-lg hover:bg-red-800 transition-colors"
                    >
                      {isSeller ? 'Kelola Toko' : 'Mulai Belanja'}
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col max-h-36 overflow-y-auto">
                    {[...relevantOrders].reverse().slice(0, 5).map(o => (
                      <Link
                        key={o.id}
                        href={isSeller ? '/seller/orders' : '/profile'}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg shrink-0">
                          {o.status === 'Pesanan Masuk' ? '🕐'
                            : o.status === 'Diproses' ? '📦'
                            : o.status === 'Dikirim' ? '🚚'
                            : o.status === 'Sampai' ? '📍' : '✅'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700 truncate">{o.id}</p>
                          <p className="text-xs text-gray-400">{o.status}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Update tab – chat messages + follow updates */
            <div className="py-3 min-h-[160px] max-h-72 overflow-y-auto">
              {/* Follow updates (buyers only) */}
              {!isSeller && followUpdates.length > 0 && (
                <div className="mb-2">
                  <p className="px-4 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Toko Diikuti</p>
                  {followUpdates.slice(0, 5).map(u => (
                    <Link
                      key={u.id}
                      href={`/toko/${u.sellerId}`}
                      onClick={() => setOpen(false)}
                      className={`flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors ${!u.read ? 'bg-red-50/60' : ''}`}
                    >
                      <div className="w-8 h-8 bg-[#D90429] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.sellerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{u.sellerName}</p>
                        <p className="text-xs text-gray-400 truncate">Produk baru: {u.productTitle}</p>
                      </div>
                      {!u.read && <span className="w-2 h-2 bg-red-600 rounded-full shrink-0 mt-1.5" />}
                    </Link>
                  ))}
                  {unreadMsgs.length > 0 && <div className="border-t border-gray-100 mx-4 my-1" />}
                </div>
              )}

              {/* Chat messages */}
              {unreadMsgs.length === 0 && (!(!isSeller && followUpdates.length > 0)) ? (
                <div className="flex flex-col items-center py-8 px-4 text-center">
                  <p className="text-3xl mb-2">💬</p>
                  <p className="font-semibold text-gray-700 text-sm mb-1">Tidak ada update baru</p>
                  <p className="text-xs text-gray-400">Ikuti toko favoritmu untuk notifikasi produk baru</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {unreadMsgs.length > 0 && (
                    <p className="px-4 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pesan</p>
                  )}
                  {unreadMsgs.map(m => (
                    <button
                      key={m.id}
                      onClick={isSeller ? () => { setOpen(false); } : handleOpenChat}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left w-full"
                    >
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-sm shrink-0">
                        {isSeller ? '👤' : '📚'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700 mb-0.5">
                          {isSeller ? 'Pembeli' : 'Toko Komik Indonesia'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{m.text}</p>
                      </div>
                    </button>
                  ))}
                  {isSeller && (
                    <Link
                      href="/seller/chat"
                      onClick={() => setOpen(false)}
                      className="mx-4 mt-2 text-center text-xs text-red-700 hover:underline font-medium"
                    >
                      Buka halaman chat →
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex border-t border-gray-100">
            <button
              onClick={handleMarkAllRead}
              className="flex-1 py-3 text-xs text-red-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Tandai semua dibaca
            </button>
            <div className="w-px bg-gray-100" />
            <Link
              href={isSeller ? '/seller' : '/profile'}
              onClick={() => setOpen(false)}
              className="flex-1 py-3 text-xs text-red-700 hover:bg-gray-50 font-medium text-center transition-colors"
            >
              Lihat selengkapnya
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
