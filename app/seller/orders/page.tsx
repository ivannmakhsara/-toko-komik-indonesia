'use client';

import { useEffect, useState } from 'react';
import {
  getOrders, updateOrderStatus, cancelOrder,
  setTrackingNumber, getTrackingNumber,
  resolveDispute, getDisputeReason,
  Order, OrderStatus, STATUS_ICON,
} from '@/lib/orders';
import { formatRupiah } from '@/lib/data';

const ACTIVE_STEPS: OrderStatus[] = ['Pesanan Masuk', 'Diproses', 'Dikirim', 'Sampai', 'Selesai'];

const STATUS_COLOR: Record<string, string> = {
  'Pesanan Masuk': 'bg-orange-400/10 text-orange-400 border border-orange-400/20',
  'Diproses':      'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20',
  'Dikirim':       'bg-blue-400/10 text-blue-400 border border-blue-400/20',
  'Sampai':        'bg-purple-400/10 text-purple-400 border border-purple-400/20',
  'Selesai':       'bg-green-400/10 text-green-400 border border-green-400/20',
  'Dibatalkan':    'bg-red-500/10 text-red-400 border border-red-500/20',
  'Bermasalah':    'bg-amber-500/10 text-amber-400 border border-amber-500/20',
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  'Pesanan Masuk': 'Proses Pesanan',
  'Diproses':      'Input Resi & Kirim',
  'Dikirim':       'Konfirmasi Diterima',
  'Sampai':        'Selesaikan',
};

const CANCEL_REASONS = [
  'Stok habis / produk tidak tersedia',
  'Tidak bisa memenuhi pesanan saat ini',
  'Masalah pengiriman ke lokasi pembeli',
  'Permintaan pembeli',
  'Alasan lainnya',
];

export default function SellerOrdersPage() {
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [filter,   setFilter]   = useState<'Semua' | OrderStatus>('Semua');
  const [expanded, setExpanded] = useState<string | null>(null);

  /* Tracking modal */
  const [trackingModal, setTrackingModal] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  /* Cancel modal */
  const [cancelModal,  setCancelModal]  = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelOther,  setCancelOther]  = useState('');
  const [cancelling,   setCancelling]   = useState(false);

  function reload() { getOrders().then(setOrders); }
  useEffect(reload, []);

  async function advance(order: Order) {
    if (order.status === 'Diproses') {
      setTrackingModal(order.id);
      setTrackingInput('');
      return;
    }
    const steps = ACTIVE_STEPS;
    const idx   = steps.indexOf(order.status);
    if (idx < 0 || idx >= steps.length - 1) return;
    await updateOrderStatus(order.id, steps[idx + 1]);
    reload();
  }

  async function confirmTracking() {
    if (!trackingInput.trim()) return;
    setTrackingNumber(trackingModal!, trackingInput.trim());
    await updateOrderStatus(trackingModal!, 'Dikirim');
    setTrackingModal(null);
    reload();
  }

  async function handleCancel() {
    const reason = cancelReason === 'Alasan lainnya' ? cancelOther : cancelReason;
    if (!reason.trim()) return;
    setCancelling(true);
    await cancelOrder(cancelModal!, reason);
    setCancelModal(null);
    setCancelReason('');
    setCancelling(false);
    reload();
  }

  const canCancel    = (s: OrderStatus) => s === 'Pesanan Masuk' || s === 'Diproses';
  const activeOrders = orders.filter(o => o.status !== 'Dibatalkan');
  const filtered     = filter === 'Semua' ? activeOrders : activeOrders.filter(o => o.status === filter);
  const countBy      = (s: OrderStatus) => activeOrders.filter(o => o.status === s).length;
  const disputedCount = orders.filter(o => o.status === 'Bermasalah').length;

  return (
    <div className="p-6 lg:p-8 bg-[#0A0A0B] min-h-screen">
      <h1 className="font-display text-2xl font-bold text-[#F2F2F0] mb-1 tracking-tight">Daftar Pesanan</h1>
      <p className="text-white/35 text-sm mb-6">{activeOrders.length} pesanan aktif{disputedCount > 0 && <span className="ml-2 text-amber-400 font-semibold">· {disputedCount} bermasalah</span>}</p>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter('Semua')}
          className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${filter === 'Semua' ? 'bg-white/[0.10] text-white border border-white/[0.15]' : 'bg-white/[0.04] border border-white/[0.07] text-white/40 hover:text-white/65'}`}>
          Semua ({activeOrders.length})
        </button>
        {ACTIVE_STEPS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${filter === s ? 'bg-[#D90429]/15 border border-[#D90429]/30 text-[#D90429]' : 'bg-white/[0.04] border border-white/[0.07] text-white/40 hover:text-white/65'}`}>
            {STATUS_ICON[s]} {s} ({countBy(s)})
          </button>
        ))}
        {disputedCount > 0 && (
          <button onClick={() => setFilter('Bermasalah')}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${filter === 'Bermasalah' ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' : 'bg-amber-500/[0.06] border border-amber-500/20 text-amber-400/60 hover:text-amber-400/80'}`}>
            ⚠️ Bermasalah ({disputedCount})
          </button>
        )}
      </div>

      {/* Journey legend */}
      <div className="bg-[#111113] border border-white/[0.07] rounded-[16px] p-4 mb-6 overflow-x-auto">
        <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-3">Alur Pesanan Seller</p>
        <div className="flex items-center gap-0 min-w-max">
          {[
            { s: 'Pesanan Masuk', act: 'Konfirmasi & proses paket', color: 'text-orange-400' },
            { s: 'Diproses',      act: 'Input no. resi & kirim',    color: 'text-yellow-400' },
            { s: 'Dikirim',       act: 'Tunggu konfirmasi penerimaan', color: 'text-blue-400' },
            { s: 'Sampai',        act: 'Selesaikan transaksi',       color: 'text-purple-400' },
            { s: 'Selesai',       act: 'Pesanan selesai ✅',         color: 'text-green-400' },
          ].map((step, i, arr) => (
            <div key={step.s} className="flex items-center">
              <div className="text-center px-3">
                <p className={`text-[11px] font-bold ${step.color}`}>{step.s}</p>
                <p className="text-[10px] text-white/25 mt-0.5 max-w-[100px] leading-snug">{step.act}</p>
              </div>
              {i < arr.length - 1 && <span className="text-white/15 text-lg mx-1">→</span>}
            </div>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#111113] border border-white/[0.07] rounded-[16px] p-16 text-center">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-white/30 text-sm">Tidak ada pesanan{filter !== 'Semua' ? ` dengan status "${filter}"` : ''}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(order => {
            const isOpen  = expanded === order.id;
            const stepIdx = ACTIVE_STEPS.indexOf(order.status);
            const tracking = getTrackingNumber(order.id);
            return (
              <div key={order.id} className="bg-[#111113] border border-white/[0.07] rounded-[16px] overflow-hidden">
                {/* Header row */}
                <div className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpanded(isOpen ? null : order.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-semibold text-white/75 text-sm font-mono">{order.id}</p>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[order.status] ?? ''}`}>
                        {STATUS_ICON[order.status as OrderStatus]} {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-white/45">{order.buyer.name} · {order.buyer.email}</p>
                    <p className="text-xs text-white/25">{order.items.length} item · {new Date(order.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-[#D90429]">{formatRupiah(order.total)}</p>
                    <p className="text-xs text-white/25 mt-0.5">{isOpen ? '▲ Tutup' : '▼ Detail'}</p>
                  </div>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div className="border-t border-white/[0.06] px-5 py-5 bg-white/[0.015]">
                    <div className="grid sm:grid-cols-2 gap-6 mb-5">
                      {/* Buyer info */}
                      <div>
                        <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-3">Data Pembeli</p>
                        {[
                          ['Nama',     order.buyer.name],
                          ['Email',    order.buyer.email],
                          ['HP',       order.buyer.phone],
                          ['Alamat',   `${order.buyer.address}, ${order.buyer.city}, ${order.buyer.province}`],
                          ['Ekspedisi',order.shippingLabel],
                          ['Bayar',    order.payment],
                          ...(tracking ? [['No. Resi', tracking]] : []),
                        ].map(([label, value]) => (
                          <div key={label} className="flex gap-2 text-sm mb-1.5">
                            <span className="text-white/30 w-20 shrink-0">{label}</span>
                            <span className={`text-white/65 ${label === 'No. Resi' ? 'font-mono font-semibold text-blue-400' : ''}`}>{value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Items */}
                      <div>
                        <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-3">Item Pesanan</p>
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm mb-2">
                            <span className="text-white/55">{item.title} <span className="text-white/25">×{item.quantity}</span></span>
                            <span className="text-white/65 font-medium">{formatRupiah(item.price * item.quantity)}</span>
                          </div>
                        ))}
                        <div className="border-t border-white/[0.07] pt-2 mt-1 space-y-1">
                          <div className="flex justify-between text-sm text-white/35">
                            <span>Ongkir</span><span>{formatRupiah(order.shippingCost)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-[#F2F2F0]">
                            <span>Total</span><span className="text-[#D90429]">{formatRupiah(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stepper */}
                    {order.status !== 'Dibatalkan' && (
                      <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                        {ACTIVE_STEPS.map((s, i) => {
                          const done = i <= stepIdx;
                          const cur  = i === stepIdx;
                          return (
                            <div key={s} className="flex items-center shrink-0">
                              <div className="flex flex-col items-center">
                                <div className={`w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-bold ${done ? (cur ? 'bg-[#D90429] ring-2 ring-[#D90429]/30' : 'bg-[#D90429]') : 'bg-white/[0.08]'} text-white`}>
                                  {done && !cur ? '✓' : i + 1}
                                </div>
                                <p className={`text-[9px] mt-1 whitespace-nowrap ${done ? 'text-[#D90429]/80 font-semibold' : 'text-white/25'}`}>{s}</p>
                              </div>
                              {i < ACTIVE_STEPS.length - 1 && (
                                <div className={`h-px w-6 mx-1 mb-3 ${i < stepIdx ? 'bg-[#D90429]/50' : 'bg-white/[0.07]'}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Dispute banner */}
                    {order.status === 'Bermasalah' && (() => {
                      const reason = getDisputeReason(order.id);
                      return (
                        <div className="mb-4 px-4 py-3 bg-amber-500/[0.08] border border-amber-500/25 rounded-[12px]">
                          <p className="text-amber-400 text-sm font-semibold mb-1">⚠️ Pembeli melaporkan masalah</p>
                          {reason && <p className="text-amber-300/70 text-xs">Alasan: {reason}</p>}
                          <p className="text-white/40 text-xs mt-1">Hubungi pembeli melalui Chat dan selesaikan masalah sebelum menyelesaikan pesanan.</p>
                        </div>
                      );
                    })()}

                    {/* Actions */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {order.status !== 'Dibatalkan' && order.status !== 'Selesai' && order.status !== 'Bermasalah' && NEXT_LABEL[order.status] && (
                        <button onClick={() => advance(order)}
                          className="bg-[#D90429] text-white px-5 py-2 rounded-[10px] hover:bg-[#B0021F] transition-colors text-sm font-semibold">
                          {NEXT_LABEL[order.status]} →
                        </button>
                      )}
                      {order.status === 'Bermasalah' && (
                        <button onClick={async () => { await resolveDispute(order.id); reload(); }}
                          className="bg-green-600 text-white px-5 py-2 rounded-[10px] hover:bg-green-500 transition-colors text-sm font-semibold">
                          ✓ Tandai Selesai (Masalah Teratasi)
                        </button>
                      )}
                      {order.status === 'Selesai' && (
                        <span className="text-green-400 text-sm font-semibold">✅ Pesanan selesai</span>
                      )}
                      {canCancel(order.status) && (
                        <button onClick={() => { setCancelModal(order.id); setCancelReason(''); setCancelOther(''); }}
                          className="px-4 py-2 rounded-[10px] border border-red-500/30 text-red-400/70 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 transition-colors text-sm font-semibold">
                          Batalkan Pesanan
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tracking modal ── */}
      {trackingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-white/[0.10] rounded-[20px] p-6 w-full max-w-sm">
            <h3 className="font-display font-bold text-[#F2F2F0] mb-1">Input Nomor Resi</h3>
            <p className="text-white/40 text-sm mb-4">Masukkan nomor resi pengiriman dari ekspedisi.</p>
            <input
              autoFocus
              value={trackingInput}
              onChange={e => setTrackingInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmTracking()}
              placeholder="Contoh: JNE1234567890"
              className="w-full bg-white/[0.05] border border-white/[0.12] rounded-[12px] px-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-white/25 font-mono mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setTrackingModal(null)}
                className="flex-1 py-2.5 rounded-[10px] border border-white/[0.10] text-white/45 hover:text-white/70 text-sm transition-colors">
                Batal
              </button>
              <button onClick={confirmTracking} disabled={!trackingInput.trim()}
                className="flex-1 py-2.5 rounded-[10px] bg-[#D90429] text-white text-sm font-semibold hover:bg-[#B0021F] transition-colors disabled:opacity-40">
                Kirim & Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel modal ── */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-white/[0.10] rounded-[20px] p-6 w-full max-w-sm">
            <h3 className="font-display font-bold text-[#F2F2F0] mb-1">Batalkan Pesanan</h3>
            <p className="text-white/40 text-sm mb-4">Pilih alasan pembatalan:</p>
            <div className="flex flex-col gap-2 mb-4">
              {CANCEL_REASONS.map(r => (
                <button key={r} onClick={() => setCancelReason(r)}
                  className={`text-left px-4 py-2.5 rounded-[10px] border text-sm transition-colors ${
                    cancelReason === r
                      ? 'border-[#D90429]/50 bg-[#D90429]/10 text-white/80'
                      : 'border-white/[0.08] text-white/45 hover:border-white/[0.15] hover:text-white/65'
                  }`}>
                  {r}
                </button>
              ))}
            </div>
            {cancelReason === 'Alasan lainnya' && (
              <textarea
                value={cancelOther}
                onChange={e => setCancelOther(e.target.value)}
                placeholder="Tuliskan alasan..."
                rows={2}
                className="w-full bg-white/[0.05] border border-white/[0.12] rounded-[12px] px-4 py-2.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-white/25 resize-none mb-4"
              />
            )}
            <div className="flex gap-3">
              <button onClick={() => setCancelModal(null)}
                className="flex-1 py-2.5 rounded-[10px] border border-white/[0.10] text-white/45 hover:text-white/70 text-sm transition-colors">
                Kembali
              </button>
              <button
                disabled={!cancelReason || (cancelReason === 'Alasan lainnya' && !cancelOther.trim()) || cancelling}
                onClick={handleCancel}
                className="flex-1 py-2.5 rounded-[10px] bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-40">
                {cancelling ? 'Membatalkan...' : 'Batalkan Pesanan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
