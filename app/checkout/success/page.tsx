import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="bg-white rounded-2xl shadow-lg p-10">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Pesanan Berhasil!</h1>
        <p className="text-gray-500 mb-2">
          Terima kasih sudah berbelanja di <span className="font-semibold text-red-700">Toko Komik Indonesia</span>.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Pesananmu sedang kami proses. Kamu akan menerima konfirmasi via email segera.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="block bg-red-700 text-white py-3 rounded-lg hover:bg-red-800 transition-colors font-medium"
          >
            Belanja Lagi
          </Link>
        </div>
      </div>
    </div>
  );
}
