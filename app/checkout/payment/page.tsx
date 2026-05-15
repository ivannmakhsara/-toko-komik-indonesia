'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatRupiah } from '@/lib/data';

interface PendingPayment {
  orderId: string;
  payment: string;
  total: number;
  deadline: string;
}

const VA_PREFIXES: Record<string, string> = {
  'bca-va':     '8077',
  'mandiri-va': '8988',
  'bni-va':     '8808',
  'bri-va':     '8881',
  'permata-va': '8215',
};

const PAYMENT_LABELS: Record<string, string> = {
  'bca-va':     'BCA Virtual Account',
  'mandiri-va': 'Mandiri Virtual Account',
  'bni-va':     'BNI Virtual Account',
  'bri-va':     'BRI Virtual Account',
  'permata-va': 'Permata Virtual Account',
  'gopay':      'GoPay',
  'ovo':        'OVO',
  'dana':       'DANA',
  'shopeepay':  'ShopeePay',
  'qris':       'QRIS',
};

const VA_INSTRUCTIONS: Record<string, { channel: string; steps: string[] }[]> = {
  'bca-va': [
    { channel: 'ATM BCA', steps: ['Masukkan kartu ATM & PIN', 'Pilih Transaksi Lainnya → Transfer → ke BCA Virtual Account', 'Masukkan nomor Virtual Account', 'Ikuti instruksi untuk menyelesaikan transaksi'] },
    { channel: 'm-BCA (BCA mobile)', steps: ['Login m-BCA', 'Pilih m-Transfer → BCA Virtual Account', 'Masukkan nomor Virtual Account', 'Masukkan PIN m-BCA'] },
    { channel: 'Internet Banking BCA', steps: ['Login KlikBCA', 'Pilih Transfer Dana → Transfer ke BCA Virtual Account', 'Masukkan nomor Virtual Account & nominal', 'Masukkan respon KeyBCA'] },
    { channel: 'Kantor Bank BCA', steps: ['Datang ke kantor BCA terdekat', 'Sampaikan ingin transfer ke BCA Virtual Account', 'Berikan nomor Virtual Account & nominal kepada teller'] },
  ],
  'mandiri-va': [
    { channel: 'ATM Mandiri', steps: ['Masukkan kartu ATM & PIN', 'Pilih Bayar/Beli → Lainnya → Multi Payment', 'Masukkan kode perusahaan & nomor Virtual Account', 'Konfirmasi pembayaran'] },
    { channel: "Livin' by Mandiri", steps: ["Login Livin' by Mandiri", 'Pilih Pembayaran → Multi Payment', 'Masukkan nomor Virtual Account', 'Konfirmasi & selesai'] },
  ],
  'bni-va': [
    { channel: 'ATM BNI', steps: ['Masukkan kartu ATM & PIN', 'Pilih Menu Lainnya → Transfer → Rekening Tabungan', 'Pilih Rekening Giro → ke Rekening BNI', 'Masukkan nomor Virtual Account'] },
    { channel: 'BNI Mobile Banking', steps: ['Login BNI Mobile', 'Pilih Transfer → Virtual Account Billing', 'Masukkan nomor Virtual Account', 'Konfirmasi pembayaran'] },
  ],
  'bri-va': [
    { channel: 'ATM BRI', steps: ['Masukkan kartu ATM & PIN', 'Pilih Transaksi Lain → Pembayaran → Lainnya → BRIVA', 'Masukkan nomor BRIVA', 'Konfirmasi pembayaran'] },
    { channel: 'BRImo', steps: ['Login BRImo', 'Pilih Pembayaran → BRIVA', 'Masukkan nomor BRIVA', 'Konfirmasi & selesai'] },
  ],
  'permata-va': [
    { channel: 'ATM Permata', steps: ['Masukkan kartu ATM & PIN', 'Pilih Transaksi Lainnya → Pembayaran → Pembayaran Lainnya → Virtual Account', 'Masukkan nomor Virtual Account', 'Konfirmasi pembayaran'] },
    { channel: 'PermataMobile X', steps: ['Login PermataMobile X', 'Pilih Pembayaran → Virtual Account', 'Masukkan nomor Virtual Account', 'Konfirmasi & selesai'] },
  ],
};

const EWALLET_INSTRUCTIONS: Record<string, string[]> = {
  'gopay':     ['Buka aplikasi Gojek', 'Pilih GoTagihan atau scan QR', 'Masukkan kode bayar atau gunakan link', 'Konfirmasi pembayaran dengan PIN GoPay'],
  'ovo':       ['Buka aplikasi OVO', 'Pilih Transfer → ke Merchant', 'Masukkan nomor bayar', 'Konfirmasi dengan PIN OVO'],
  'dana':      ['Buka aplikasi DANA', 'Pilih Bayar → masukkan kode bayar', 'Periksa detail & konfirmasi', 'Selesai'],
  'shopeepay': ['Buka aplikasi Shopee', 'Pilih ShopeePay → Bayar', 'Scan QR atau masukkan kode', 'Konfirmasi dengan PIN'],
  'qris':      ['Buka aplikasi dompet digital / m-banking apapun', 'Pilih Scan QR / QRIS', 'Scan kode QR di bawah', 'Konfirmasi pembayaran'],
};

function generateVA(payment: string, orderId: string): string {
  const prefix = VA_PREFIXES[payment] ?? '8000';
  const suffix = orderId.replace('ORD-', '').slice(-12).padStart(12, '0');
  return prefix + suffix;
}

function useCountdown(deadline: string) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const calc = () => Math.max(0, new Date(deadline).getTime() - Date.now());
    setRemaining(calc());
    const id = setInterval(() => setRemaining(calc()), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1_000);
  return { h, m, s, expired: remaining === 0 };
}

function Pad({ n }: { n: number }) {
  return <span>{String(n).padStart(2, '0')}</span>;
}

export default function PaymentPage() {
  const router = useRouter();
  const [data, setData] = useState<PendingPayment | null>(null);
  const [copied, setCopied] = useState<'va' | 'total' | null>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pending-payment');
      if (raw) setData(JSON.parse(raw));
      else router.replace('/');
    } catch { router.replace('/'); }
  }, [router]);

  const { h, m, s, expired } = useCountdown(data?.deadline ?? new Date().toISOString());

  if (!data) return null;

  const isVA = data.payment.endsWith('-va');
  const isEwallet = ['gopay','ovo','dana','shopeepay','qris'].includes(data.payment);
  const vaNumber = isVA ? generateVA(data.payment, data.orderId) : null;
  const deadlineDate = new Date(data.deadline);
  const deadlineStr = deadlineDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    + ', ' + deadlineDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

  function copy(text: string, type: 'va' | 'total') {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  const vaInstructions = isVA ? (VA_INSTRUCTIONS[data.payment] ?? []) : [];
  const ewalletSteps = isEwallet ? (EWALLET_INSTRUCTIONS[data.payment] ?? []) : [];

  return (
    <div className="max-w-lg mx-auto px-4 py-8">

      {/* Header card */}
      <div className="bg-white rounded-2xl shadow p-5 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white text-xl shrink-0">
              🕐
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Bayar sebelum</p>
              <p className="text-xs text-gray-500">{deadlineStr}</p>
            </div>
          </div>
          {!expired ? (
            <div className="flex gap-1 shrink-0">
              {[{ v: h, l: 'Jam' }, { v: m, l: 'Menit' }, { v: s, l: 'Detik' }].map(({ v, l }) => (
                <div key={l} className="flex flex-col items-center bg-red-600 text-white rounded-lg px-2 py-1 min-w-[36px]">
                  <span className="text-sm font-bold leading-none"><Pad n={v} /></span>
                  <span className="text-[9px] mt-0.5">{l}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-red-600 font-semibold">Kadaluarsa</span>
          )}
        </div>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 flex gap-2">
          <span className="text-amber-500 shrink-0">⚠️</span>
          <div>
            <p className="text-xs font-semibold text-amber-800">Yuk, buruan selesaikan pembayaranmu</p>
            <p className="text-xs text-amber-700">Stok barang di pesananmu terbatas. Segera bayar biar nggak kehabisan!</p>
          </div>
        </div>

        {/* VA Number */}
        {isVA && vaNumber && (
          <>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-500">Nomor Virtual Account</p>
              <span className="text-xs font-bold text-blue-700">{PAYMENT_LABELS[data.payment]?.replace(' Virtual Account','')}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-800 tracking-wide">{vaNumber}</span>
                <button onClick={() => copy(vaNumber, 'va')}
                  className="text-green-600 hover:text-green-700 text-xs font-semibold border border-green-200 rounded px-1.5 py-0.5">
                  {copied === 'va' ? '✓ Disalin' : '⎘ Salin'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* E-wallet notice */}
        {isEwallet && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-3 mb-4">
            <p className="text-sm font-semibold text-blue-800 mb-1">{PAYMENT_LABELS[data.payment]}</p>
            <p className="text-xs text-blue-600">Buka aplikasi {PAYMENT_LABELS[data.payment]} dan ikuti instruksi di bawah untuk menyelesaikan pembayaran.</p>
          </div>
        )}

        {/* Total */}
        <div className="flex items-center justify-between border-t pt-3">
          <div>
            <p className="text-xs text-gray-500">Total Tagihan</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-800">{formatRupiah(data.total)}</span>
              <button onClick={() => copy(String(data.total), 'total')}
                className="text-green-600 hover:text-green-700 text-xs font-semibold border border-green-200 rounded px-1.5 py-0.5">
                {copied === 'total' ? '✓ Disalin' : '⎘ Salin'}
              </button>
            </div>
          </div>
          <button onClick={() => setShowInstructions(true)} className="text-sm text-green-600 font-semibold hover:underline">
            Lihat Detail
          </button>
        </div>

        {/* Notes (VA only) */}
        {isVA && (
          <ul className="mt-4 space-y-1 text-xs text-gray-500 list-disc list-inside">
            <li><span className="font-semibold text-gray-700">Penting:</span> Transfer Virtual Account hanya bisa dilakukan dari <span className="font-semibold">bank yang kamu pilih</span></li>
            <li>Transaksi kamu baru akan diteruskan ke penjual setelah pembayaran berhasil diverifikasi.</li>
          </ul>
        )}

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => setShowInstructions(v => !v)}
            className="border border-green-500 text-green-600 rounded-lg py-2.5 text-sm font-semibold hover:bg-green-50 transition-colors"
          >
            {showInstructions ? 'Sembunyikan' : 'Lihat Cara Bayar'}
          </button>
          <Link href="/checkout/success"
            className="border border-green-500 text-green-600 rounded-lg py-2.5 text-sm font-semibold hover:bg-green-50 transition-colors text-center"
            onClick={() => localStorage.removeItem('pending-payment')}
          >
            Cek Status Bayar
          </Link>
        </div>
      </div>

      {/* Payment instructions */}
      {showInstructions && (
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="font-bold text-gray-800 mb-4">Cara pembayaran</h2>

          {/* VA accordion */}
          {isVA && vaInstructions.map((item, i) => (
            <div key={i} className="border-b border-gray-100 last:border-0">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between py-3 text-left"
              >
                <span className="text-sm font-semibold text-gray-800">{item.channel}</span>
                <span className="text-gray-400 text-lg">{openIdx === i ? '∧' : '∨'}</span>
              </button>
              {openIdx === i && (
                <ol className="pb-4 pl-4 space-y-2">
                  {item.steps.map((step, j) => (
                    <li key={j} className="flex gap-2 text-sm text-gray-600">
                      <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {j + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ))}

          {/* E-wallet steps */}
          {isEwallet && (
            <ol className="space-y-3">
              {ewalletSteps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-600">
                  <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      <p className="text-center text-xs text-gray-400 mt-4">
        ID Pesanan: {data.orderId}
      </p>
    </div>
  );
}
