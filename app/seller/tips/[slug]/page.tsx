'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

const ARTICLES: Record<string, {
  icon: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  sections: { heading: string; body: string }[];
}> = {
  'tips-penjualan': {
    icon: '📈',
    title: 'Tips Meningkatkan Penjualan Komik',
    category: 'Strategi',
    date: '13 Mei 2026',
    readTime: '4 menit baca',
    sections: [
      {
        heading: 'Tulis deskripsi yang memikat',
        body: 'Pembeli tidak bisa memegang fisik komikmu, jadi deskripsi adalah satu-satunya jendela mereka. Ceritakan kondisi buku, apakah ada sobek kecil, cap penerbit, atau bonus stiker. Transparansi membangun kepercayaan dan mengurangi komplain setelah barang diterima.',
      },
      {
        heading: 'Harga kompetitif, margin tetap sehat',
        body: 'Riset harga komik serupa di platform lain. Harga terlalu tinggi membuat pembeli kabur, terlalu rendah merugikanmu. Pertimbangkan harga beli + ongkos kirim + margin 20–30% sebagai patokan awal. Sesuaikan berdasarkan kelangkaan dan kondisi buku.',
      },
      {
        heading: 'Manfaatkan fitur Preorder',
        body: 'Kalau kamu menjual komik yang belum terbit atau sedang dipesan dari luar negeri, aktifkan opsi Preorder. Tandai estimasi hari tiba dengan jelas agar ekspektasi pembeli terkelola dan kamu tidak panik dikejar-kejar pertanyaan.',
      },
      {
        heading: 'Balas chat dengan cepat',
        body: 'Respons dalam 1 jam meningkatkan kepercayaan pembeli secara signifikan. Aktifkan notifikasi di browser untuk mengetahui segera ketika ada pesan masuk. Pembeli yang mendapat respons cepat 3× lebih mungkin jadi membeli.',
      },
      {
        heading: 'Bundling untuk naikkan nilai transaksi',
        body: 'Tawarkan paket seri lengkap dengan harga lebih hemat dibanding beli satuan. Misalnya, seri 5 volume yang biasanya Rp 350.000 dijual bundling Rp 300.000. Cara ini mendorong pembeli menghabiskan lebih banyak sekaligus menguras stokmu lebih cepat.',
      },
    ],
  },
  'kelola-stok': {
    icon: '📦',
    title: 'Cara Mengelola Stok dengan Efisien',
    category: 'Operasional',
    date: '10 Mei 2026',
    readTime: '3 menit baca',
    sections: [
      {
        heading: 'Catat setiap masuk dan keluar',
        body: 'Buat spreadsheet sederhana: nama komik, jumlah stok, tanggal masuk, dan tanggal terjual. Kebiasaan ini mencegah kamu menjual barang yang sudah habis dan memudahkan reorder saat stok menipis.',
      },
      {
        heading: 'Pisahkan stok dijual dan koleksi pribadi',
        body: 'Jangan campurkan buku yang ingin kamu jual dengan koleksi pribadimu. Beri label fisik atau simpan di rak terpisah. Ini mencegah kejadian tidak enak seperti tidak sengaja menjual komik favoritmu sendiri.',
      },
      {
        heading: 'Tetapkan minimum stok alert',
        body: 'Untuk seri yang sering terjual, tetapkan batas minimum — misalnya 2 eksemplar. Kalau stok menyentuh batas itu, segera reorder agar kamu tidak kehilangan potensi penjualan ketika ada pembeli yang berminat.',
      },
      {
        heading: 'Foto ulang sebelum kirim',
        body: 'Sebelum mengemas, foto kondisi buku sekali lagi. Ini dokumentasi yang melindungimu jika pembeli mengklaim buku tiba dalam kondisi berbeda dari yang dijanjikan. Simpan foto ini setidaknya 30 hari setelah pesanan selesai.',
      },
    ],
  },
  'foto-produk': {
    icon: '📸',
    title: 'Pentingnya Foto Produk yang Menarik',
    category: 'Marketing',
    date: '5 Mei 2026',
    readTime: '3 menit baca',
    sections: [
      {
        heading: 'Cahaya alami adalah temanmu',
        body: 'Foto di dekat jendela pada siang hari menghasilkan cahaya lembut tanpa bayangan keras. Hindari flash langsung yang membuat cover komik terlihat pucat dan kehilangan detail warna.',
      },
      {
        heading: 'Latar belakang bersih, fokus ke produk',
        body: 'Gunakan kertas putih, kain gelap polos, atau meja kayu bersih sebagai background. Latar yang rapi membuat cover komik menjadi pusat perhatian dan terlihat lebih profesional.',
      },
      {
        heading: 'Tunjukkan semua sisi dan kondisi',
        body: 'Ambil foto cover depan, belakang, punggung, dan halaman pertama. Kalau ada cacat seperti lipatan atau noda, foto itu dengan jujur dan cantumkan di deskripsi. Kejujuran ini mengurangi komplain dan meningkatkan rating tokomu.',
      },
      {
        heading: 'Resolusi tinggi, ukuran teroptimasi',
        body: 'Upload foto minimal 800×800 piksel agar pembeli bisa zoom dan melihat detail. Kompres file sebelum upload agar halaman tetap cepat — gunakan tools gratis seperti Squoosh atau TinyPNG.',
      },
      {
        heading: 'Konsistensi membangun brand',
        body: 'Gunakan sudut pengambilan dan latar yang sama untuk semua produk di tokomu. Konsistensi visual membuat halaman tokomu terlihat profesional dan meningkatkan kepercayaan pembeli saat pertama kali melihat koleksimu.',
      },
    ],
  },
};

export default function TipsArticlePage() {
  const params  = useParams();
  const slug    = params?.slug as string;
  const article = ARTICLES[slug];

  if (!article) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
        <p className="text-5xl">📭</p>
        <p className="font-display text-lg font-bold text-white/70">Artikel tidak ditemukan</p>
        <Link href="/seller" className="text-sm text-[#D90429]/70 hover:text-[#D90429] transition-colors">← Kembali ke Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">

        <Link href="/seller" className="inline-flex items-center gap-1.5 text-sm text-white/35 hover:text-white/60 transition-colors mb-6">
          ← Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-[#D90429]/10 border border-[#D90429]/15 rounded-[14px] flex items-center justify-center text-3xl shrink-0">
            {article.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#D90429]/70 uppercase tracking-widest border border-[#D90429]/20 bg-[#D90429]/05 px-2 py-0.5 rounded-full">
                {article.category}
              </span>
              <span className="text-[10px] text-white/25">{article.readTime}</span>
            </div>
            <h1 className="font-display text-xl font-bold text-[#F2F2F0] leading-tight">{article.title}</h1>
            <p className="text-xs text-white/30 mt-1">{article.date}</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {article.sections.map((s, i) => (
            <div key={i} className="bg-[#111113] border border-white/[0.07] rounded-[16px] p-5">
              <p className="font-semibold text-white/80 mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#D90429]/15 text-[#D90429] text-[11px] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                {s.heading}
              </p>
              <p className="text-sm text-white/45 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Footer nav */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between">
          <Link href="/seller"
            className="text-sm text-white/35 hover:text-white/60 transition-colors">
            ← Kembali ke Dashboard
          </Link>
          <Link href="/seller/products/add"
            className="bg-[#D90429] text-white text-sm font-semibold px-4 py-2 rounded-[10px] hover:bg-[#B0021F] transition-colors">
            Tambah Produk →
          </Link>
        </div>
      </div>
    </div>
  );
}
