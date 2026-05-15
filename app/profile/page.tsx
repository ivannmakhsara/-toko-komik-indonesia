'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getOrders, Order, STATUS_STEPS, STATUS_ICON, OrderStatus } from '@/lib/orders';
import { formatRupiah } from '@/lib/data';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (user) {
      getOrders().then(all =>
        setOrders(all.filter(o => o.userId === user.id || o.buyer.email === user.email))
      );
      setEditName(user.name);
    }
  }, [user?.id, user?.email, user?.name]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  const statusColor: Record<OrderStatus, string> = {
    'Pesanan Masuk': 'bg-orange-100 text-orange-700',
    'Diproses':      'bg-yellow-100 text-yellow-700',
    'Dikirim':       'bg-blue-100 text-blue-700',
    'Sampai':        'bg-purple-100 text-purple-700',
    'Selesai':       'bg-green-100 text-green-700',
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Memuat...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">👤</p>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Belum Masuk</h2>
        <p className="text-gray-400 text-sm mb-6">Masuk untuk melihat profil dan riwayat pesananmu.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/login" className="bg-red-700 text-white px-6 py-2 rounded-lg hover:bg-red-800 transition-colors font-medium">Masuk</Link>
          <Link href="/register" className="border border-gray-200 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">Daftar</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Akun Saya</h1>

      <div className="flex flex-col gap-6">
        {/* Profile card */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {editing ? (
              <div className="flex-1 flex gap-2 items-center">
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-red-400" />
                <button onClick={() => setEditing(false)}
                  className="bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-800">Simpan</button>
                <button onClick={() => setEditing(false)} className="text-gray-400 text-sm hover:text-gray-600">Batal</button>
              </div>
            ) : (
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-800">{user.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'seller' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {user.role === 'seller' ? '🏪 Seller' : '🛍️ Pembeli'}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
            )}
            {!editing && (
              <button onClick={() => setEditing(true)} className="text-sm text-red-700 hover:underline shrink-0">Edit</button>
            )}
          </div>
        </div>

        {/* Order history */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-5">Riwayat Pesanan</h2>

          {orders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-2">📦</p>
              <p className="text-sm text-gray-400 mb-4">Belum ada pesanan</p>
              <Link href="/" className="bg-red-700 text-white px-5 py-2 rounded-lg hover:bg-red-800 transition-colors text-sm font-medium">
                Mulai Belanja
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {orders.map(order => {
                const stepIdx = STATUS_STEPS.indexOf(order.status);
                return (
                  <div key={order.id} className="border border-gray-100 rounded-xl p-5">
                    {/* Order header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-semibold text-gray-700 text-sm">{order.id}</p>
                        <p className="text-xs text-gray-400">{formatDate(order.date)}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColor[order.status]}`}>
                        {STATUS_ICON[order.status]} {order.status}
                      </span>
                    </div>

                    {/* Status stepper */}
                    <div className="flex items-center mb-4 overflow-x-auto pb-1">
                      {STATUS_STEPS.map((step, i) => {
                        const done = i <= stepIdx;
                        const current = i === stepIdx;
                        return (
                          <div key={step} className="flex items-center shrink-0">
                            <div className="flex flex-col items-center">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                done ? (current ? 'bg-red-700 text-white ring-2 ring-red-300' : 'bg-red-700 text-white') : 'bg-gray-200 text-gray-400'
                              }`}>
                                {done && !current ? '✓' : i + 1}
                              </div>
                              <p className={`text-xs mt-1 whitespace-nowrap ${done ? 'text-red-700 font-medium' : 'text-gray-400'}`}>
                                {step}
                              </p>
                            </div>
                            {i < STATUS_STEPS.length - 1 && (
                              <div className={`h-0.5 w-8 mx-1 mb-4 ${i < stepIdx ? 'bg-red-700' : 'bg-gray-200'}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Items */}
                    <div className="flex flex-col gap-1 mb-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.title} <span className="text-gray-400">×{item.quantity}</span></span>
                          <span>{formatRupiah(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2">
                      <span>Total (termasuk ongkir)</span>
                      <span className="text-red-700">{formatRupiah(order.total)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
