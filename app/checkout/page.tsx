'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { saveOrder } from '@/lib/orders';
import { formatRupiah } from '@/lib/data';
import Link from 'next/link';

const SHIPPING_OPTIONS = [
  { value: 'jne-reg',    label: 'JNE Reguler',      estimate: '2-3 hari', price: 15000 },
  { value: 'jne-yes',    label: 'JNE YES',           estimate: '1-2 hari', price: 25000 },
  { value: 'jt-express', label: 'J&T Express',       estimate: '2-3 hari', price: 14000 },
  { value: 'sicepat',    label: 'SiCepat REG',       estimate: '2-3 hari', price: 13000 },
  { value: 'anteraja',   label: 'Anteraja',           estimate: '1-2 hari', price: 20000 },
  { value: 'pos',        label: 'Pos Indonesia',      estimate: '3-5 hari', price: 10000 },
];

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    shipping: '',
    payment: 'bca-va',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-3">🛒</p>
        <p className="text-gray-600 mb-4">Keranjang kamu kosong.</p>
        <Link href="/" className="text-red-700 hover:underline">Kembali ke beranda</Link>
      </div>
    );
  }

  const selectedShipping = SHIPPING_OPTIONS.find(o => o.value === form.shipping);
  const shippingCost = selectedShipping?.price ?? 0;
  const grandTotal = totalPrice + shippingCost;

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nama wajib diisi';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Email tidak valid';
    if (!form.phone.trim()) e.phone = 'Nomor HP wajib diisi';
    if (!form.address.trim()) e.address = 'Alamat wajib diisi';
    if (!form.city.trim()) e.city = 'Kota wajib diisi';
    if (!form.province.trim()) e.province = 'Provinsi wajib diisi';
    if (!form.shipping) e.shipping = 'Pilih ekspedisi pengiriman';
    return e;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    const orderId = `ORD-${Date.now()}`;
    saveOrder({
      id: orderId,
      userId: user?.id ?? 'guest',
      date: new Date().toISOString(),
      items: items.map(({ comic, quantity }) => ({ title: comic.title, price: comic.price, quantity })),
      subtotal: totalPrice,
      shippingCost,
      total: grandTotal,
      shippingLabel: selectedShipping?.label ?? form.shipping,
      payment: form.payment,
      buyer: {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        province: form.province,
      },
      status: 'Pesanan Masuk',
    });
    localStorage.setItem('user-profile', JSON.stringify({ name: form.name, email: form.email, phone: form.phone }));
    localStorage.setItem('pending-payment', JSON.stringify({
      orderId,
      payment: form.payment,
      total: grandTotal,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }));

    clearCart();
    if (form.payment === 'cod') {
      router.push('/checkout/success');
    } else {
      router.push('/checkout/payment');
    }
  }

  const Field = ({ name, label, type = 'text', placeholder = '' }: { name: string; label: string; type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={(form as Record<string, string>)[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 ${errors[name] ? 'border-red-400' : 'border-gray-200'}`}
      />
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
        {/* Form */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Data Penerima */}
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-semibold text-gray-700 mb-4">Data Penerima</h2>
            <div className="flex flex-col gap-3">
              <Field name="name" label="Nama Lengkap" placeholder="Budi Santoso" />
              <Field name="email" label="Email" type="email" placeholder="budi@email.com" />
              <Field name="phone" label="Nomor HP" placeholder="08xxxxxxxxxx" />
            </div>
          </div>

          {/* Alamat */}
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-semibold text-gray-700 mb-4">Alamat Pengiriman</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Jl. Merdeka No. 1, RT 01/RW 02"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 resize-none ${errors.address ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field name="city" label="Kota" placeholder="Jakarta" />
                <Field name="province" label="Provinsi" placeholder="DKI Jakarta" />
              </div>
            </div>
          </div>

          {/* Ekspedisi */}
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-semibold text-gray-700 mb-4">Pilih Ekspedisi</h2>
            <div className="flex flex-col gap-2">
              {SHIPPING_OPTIONS.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-center justify-between border rounded-lg p-3 cursor-pointer transition-colors ${
                    form.shipping === opt.value
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      value={opt.value}
                      checked={form.shipping === opt.value}
                      onChange={handleChange}
                      className="accent-red-700"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                      <p className="text-xs text-gray-400">Estimasi {opt.estimate}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{formatRupiah(opt.price)}</span>
                </label>
              ))}
            </div>
            {errors.shipping && <p className="text-xs text-red-500 mt-2">{errors.shipping}</p>}
          </div>

          {/* Pembayaran */}
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-semibold text-gray-700 mb-4">Metode Pembayaran</h2>

            {/* Virtual Account */}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Transfer Virtual Account</p>
            <div className="flex flex-col gap-2 mb-4">
              {[
                { value: 'bca-va',     label: 'BCA Virtual Account',     color: 'bg-blue-600',  initial: 'BCA' },
                { value: 'mandiri-va', label: 'Mandiri Virtual Account',  color: 'bg-yellow-500', initial: 'MDR' },
                { value: 'bni-va',     label: 'BNI Virtual Account',      color: 'bg-orange-500', initial: 'BNI' },
                { value: 'bri-va',     label: 'BRI Virtual Account',      color: 'bg-blue-800',  initial: 'BRI' },
                { value: 'permata-va', label: 'Permata Virtual Account',  color: 'bg-red-500',   initial: 'PRM' },
              ].map(opt => (
                <label key={opt.value} className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${
                  form.payment === opt.value ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'
                }`}>
                  <input type="radio" name="payment" value={opt.value}
                    checked={form.payment === opt.value} onChange={handleChange} className="accent-red-700" />
                  <div className={`w-10 h-6 ${opt.color} rounded flex items-center justify-center`}>
                    <span className="text-white text-[9px] font-bold">{opt.initial}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>

            {/* E-Wallet */}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Dompet Digital</p>
            <div className="flex flex-col gap-2 mb-4">
              {[
                { value: 'gopay',      label: 'GoPay',      color: 'bg-green-500',  initial: 'GP' },
                { value: 'ovo',        label: 'OVO',         color: 'bg-purple-600', initial: 'OVO' },
                { value: 'dana',       label: 'DANA',        color: 'bg-blue-500',  initial: 'DN' },
                { value: 'shopeepay',  label: 'ShopeePay',  color: 'bg-orange-500', initial: 'SP' },
              ].map(opt => (
                <label key={opt.value} className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${
                  form.payment === opt.value ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'
                }`}>
                  <input type="radio" name="payment" value={opt.value}
                    checked={form.payment === opt.value} onChange={handleChange} className="accent-red-700" />
                  <div className={`w-10 h-6 ${opt.color} rounded flex items-center justify-center`}>
                    <span className="text-white text-[9px] font-bold">{opt.initial}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>

            {/* QRIS & COD */}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Lainnya</p>
            <div className="flex flex-col gap-2">
              {[
                { value: 'qris', label: 'QRIS', color: 'bg-gray-800', initial: 'QR' },
                { value: 'cod',  label: 'Bayar di Tempat (COD)', color: 'bg-green-700', initial: 'COD' },
              ].map(opt => (
                <label key={opt.value} className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${
                  form.payment === opt.value ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'
                }`}>
                  <input type="radio" name="payment" value={opt.value}
                    checked={form.payment === opt.value} onChange={handleChange} className="accent-red-700" />
                  <div className={`w-10 h-6 ${opt.color} rounded flex items-center justify-center`}>
                    <span className="text-white text-[9px] font-bold">{opt.initial}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-72">
          <div className="bg-white rounded-xl shadow p-5 sticky top-20">
            <h2 className="font-bold text-gray-800 mb-4">Pesanan Kamu</h2>
            <div className="flex flex-col gap-2 mb-4">
              {items.map(({ comic, quantity }) => (
                <div key={comic.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate flex-1 mr-2">{comic.title} ×{quantity}</span>
                  <span className="text-gray-800 font-medium shrink-0">{formatRupiah(comic.price * quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 flex flex-col gap-2 mb-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatRupiah(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Ongkos Kirim</span>
                <span>{selectedShipping ? formatRupiah(shippingCost) : '-'}</span>
              </div>
            </div>

            <div className="border-t pt-3 flex justify-between font-bold text-gray-800 mb-5">
              <span>Total</span>
              <span className="text-red-700">{formatRupiah(grandTotal)}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-700 text-white py-3 rounded-lg hover:bg-red-800 transition-colors font-medium disabled:opacity-60"
            >
              {loading ? 'Memproses...' : 'Pesan Sekarang'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
