'use client';

import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus, nextStatus, STATUS_STEPS, STATUS_ICON, Order, OrderStatus } from '@/lib/orders';
import { formatRupiah } from '@/lib/data';

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'Semua' | OrderStatus>('Semua');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { setOrders(getOrders()); }, []);

  function advanceStatus(id: string, current: OrderStatus) {
    const next = nextStatus(current);
    if (!next) return;
    updateOrderStatus(id, next);
    setOrders(getOrders());
  }

  const filtered = filter === 'Semua' ? orders : orders.filter(o => o.status === filter);

  const countByStatus = (s: OrderStatus) => orders.filter(o => o.status === s).length;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Daftar Pesanan</h1>
      <p className="text-gray-400 text-sm mb-6">{orders.length} total pesanan</p>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter('Semua')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'Semua' ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}>
          Semua ({orders.length})
        </button>
        {STATUS_STEPS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === s ? 'bg-red-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}>
            {STATUS_ICON[s]} {s} ({countByStatus(s)})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-gray-400 text-sm">Tidak ada pesanan {filter !== 'Semua' ? `dengan status "${filter}"` : 'masuk'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(order => {
            const isOpen = expanded === order.id;
            const next = nextStatus(order.status);
            return (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Row */}
                <div
                  className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-gray-800 text-sm">{order.id}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        order.status === 'Selesai' ? 'bg-green-100 text-green-700' :
                        order.status === 'Dikirim' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'Sampai'  ? 'bg-purple-100 text-purple-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {STATUS_ICON[order.status]} {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{order.buyer.name} · {order.buyer.email}</p>
                    <p className="text-xs text-gray-400">{order.items.length} item · {new Date(order.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-red-700">{formatRupiah(order.total)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{isOpen ? '▲ Tutup' : '▼ Detail'}</p>
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-gray-100 px-5 py-5 bg-gray-50">
                    <div className="grid sm:grid-cols-2 gap-6">
                      {/* Buyer info */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Data Pembeli</p>
                        <div className="flex flex-col gap-1.5 text-sm">
                          <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">Nama</span><span className="font-medium text-gray-800">{order.buyer.name}</span></div>
                          <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">Email</span><span className="text-gray-700">{order.buyer.email}</span></div>
                          <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">HP</span><span className="text-gray-700">{order.buyer.phone}</span></div>
                          <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">Alamat</span><span className="text-gray-700">{order.buyer.address}, {order.buyer.city}, {order.buyer.province}</span></div>
                          <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">Ekspedisi</span><span className="text-gray-700">{order.shippingLabel}</span></div>
                          <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">Bayar</span><span className="text-gray-700">{order.payment === 'transfer' ? 'Transfer Bank' : order.payment === 'qris' ? 'QRIS' : 'COD'}</span></div>
                        </div>
                      </div>

                      {/* Items */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Item Pesanan</p>
                        <div className="flex flex-col gap-2">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-gray-700">{item.title} <span className="text-gray-400">×{item.quantity}</span></span>
                              <span className="font-medium text-gray-800">{formatRupiah(item.price * item.quantity)}</span>
                            </div>
                          ))}
                          <div className="border-t border-gray-200 pt-2 mt-1 flex justify-between text-sm">
                            <span className="text-gray-500">Ongkir</span>
                            <span>{formatRupiah(order.shippingCost)}</span>
                          </div>
                          <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span className="text-red-700">{formatRupiah(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status update */}
                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        {STATUS_STEPS.map((s, i) => {
                          const stepIdx = STATUS_STEPS.indexOf(order.status);
                          const done = i <= stepIdx;
                          return (
                            <div key={s} className="flex items-center gap-1">
                              <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${done ? 'bg-red-700 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                {i + 1}
                              </span>
                              <span className={`text-xs ${done ? 'text-red-700 font-medium' : 'text-gray-400'}`}>{s}</span>
                              {i < STATUS_STEPS.length - 1 && <span className="text-gray-300 text-xs">→</span>}
                            </div>
                          );
                        })}
                      </div>
                      {next && (
                        <button onClick={() => advanceStatus(order.id, order.status)}
                          className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition-colors text-sm font-medium shrink-0 ml-4">
                          → {next}
                        </button>
                      )}
                      {!next && <span className="text-green-600 text-sm font-medium">✅ Selesai</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
