import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Block {
  type: 'heading' | 'paragraph' | 'list' | 'highlight' | 'faq' | 'articles' | 'careers';
  text?: string;
  items?: string[];
  faqs?: { q: string; a: string }[];
  articles?: { title: string; date: string; category: string; excerpt: string }[];
  jobs?: { title: string; dept: string; location: string; type: string }[];
}

interface PageInfo {
  title: string;
  icon: string;
  desc: string;
  blocks: Block[];
}

const PAGES: Record<string, PageInfo> = {
  'tentang-kami': {
    title: 'Tentang Kami', icon: '📖',
    desc: 'Mengenal lebih dekat Toko Komik Indonesia',
    blocks: [
      { type: 'paragraph', text: 'Toko Komik Indonesia adalah platform e-commerce khusus komik lokal yang didirikan dengan misi sederhana: membuat karya komik Indonesia lebih mudah diakses oleh semua orang, di mana saja.' },
      { type: 'heading', text: 'Misi Kami' },
      { type: 'paragraph', text: 'Kami percaya bahwa komik Indonesia memiliki potensi besar yang belum sepenuhnya tergali. Dari era keemasan 1950-an hingga karya digital masa kini, setiap komik lokal membawa cerita tentang budaya, identitas, dan kreativitas bangsa.' },
      { type: 'heading', text: 'Apa yang Kami Lakukan' },
      { type: 'list', items: [
        'Menghubungkan pembeli dan penjual komik Indonesia dalam satu platform terpercaya',
        'Mendukung komikus lokal untuk memperluas jangkauan karya mereka',
        'Membangun ekosistem komik Indonesia yang sehat dan berkelanjutan',
        'Melestarikan warisan komik klasik Indonesia',
        'Mendorong generasi baru komikus Indonesia untuk berkarya',
      ]},
      { type: 'heading', text: 'Angka Kami' },
      { type: 'list', items: ['10.000+ koleksi komik tersedia', '500+ seller aktif dari seluruh Indonesia', '50.000+ pembeli terdaftar', 'Melayani pengiriman ke seluruh Indonesia'] },
      { type: 'highlight', text: 'Bersama kita jaga dan kembangkan komik Indonesia. Bangga Produk Lokal 🇮🇩' },
    ],
  },
  'karir': {
    title: 'Karir', icon: '💼',
    desc: 'Bergabunglah bersama tim Toko Komik Indonesia',
    blocks: [
      { type: 'paragraph', text: 'Kami selalu mencari orang-orang bersemangat yang ingin membangun industri komik Indonesia bersama kami. Bergabunglah dengan tim yang penuh passion dan inovasi.' },
      { type: 'heading', text: 'Posisi Terbuka' },
      { type: 'careers', jobs: [
        { title: 'Frontend Engineer', dept: 'Engineering', location: 'Jakarta (Remote)', type: 'Full-time' },
        { title: 'Product Designer', dept: 'Design', location: 'Jakarta / Remote', type: 'Full-time' },
        { title: 'Content & Community Manager', dept: 'Marketing', location: 'Jakarta', type: 'Full-time' },
        { title: 'Seller Success Specialist', dept: 'Operations', location: 'Jakarta / Remote', type: 'Full-time' },
        { title: 'Data Analyst', dept: 'Engineering', location: 'Remote', type: 'Full-time' },
      ]},
      { type: 'heading', text: 'Mengapa Bekerja di Sini?' },
      { type: 'list', items: [
        '🎨 Lingkungan kerja yang kreatif dan penuh semangat',
        '🏠 Fleksibel: remote-friendly untuk sebagian besar posisi',
        '📚 Akses gratis ke seluruh koleksi komik kami',
        '🚀 Kesempatan bertumbuh bersama startup yang berkembang cepat',
        '💰 Kompensasi kompetitif + tunjangan kesehatan',
      ]},
      { type: 'highlight', text: 'Kirim CV dan portofolio ke karir@tokokomikindonesia.id' },
    ],
  },
  'blog': {
    title: 'Blog', icon: '✍️',
    desc: 'Artikel, tips, dan cerita dari dunia komik Indonesia',
    blocks: [
      { type: 'articles', articles: [
        { title: '10 Komik Indonesia Klasik yang Wajib Kamu Koleksi', date: '10 Mei 2026', category: 'Koleksi', excerpt: 'Dari Gundala hingga Sri Asih, inilah daftar komik legenda yang harus ada di rak bukumu. Simak cerita di balik setiap judul dan mengapa karya-karya ini tetap relevan hingga hari ini.' },
        { title: 'Bangkitnya Komik Digital Indonesia di Era Webtoon', date: '2 Mei 2026', category: 'Industri', excerpt: 'Platform digital membuka peluang baru bagi komikus muda Indonesia. Kami berbicara dengan 5 kreator sukses tentang perjalanan mereka membangun fanbase di era digital.' },
        { title: 'Cara Memulai Koleksi Komik dengan Budget Terbatas', date: '25 April 2026', category: 'Tips', excerpt: 'Tidak harus mahal untuk jadi kolektor komik! Berikut strategi cerdas membangun koleksi komik berkualitas tanpa menguras kantong, mulai dari berburu komik bekas hingga edisi digital.' },
        { title: 'R.A. Kosasih: Bapak Komik Indonesia yang Terlupakan', date: '18 April 2026', category: 'Sejarah', excerpt: 'Mengenal sosok legenda di balik Sri Asih dan ratusan komik wayang yang menjadi fondasi industri komik lokal. Sebuah penghormatan untuk sang maestro.' },
        { title: 'Panduan Menjual Komik Online: Dari Hobi Jadi Cuan', date: '10 April 2026', category: 'Seller', excerpt: 'Punya koleksi komik yang sudah tidak dibaca? Atau ingin memulai bisnis komik? Panduan lengkap untuk seller pemula yang ingin berjualan di platform kami.' },
      ]},
    ],
  },
  'program-afiliasi': {
    title: 'Program Afiliasi', icon: '🤝',
    desc: 'Hasilkan komisi dengan merekomendasikan Toko Komik Indonesia',
    blocks: [
      { type: 'paragraph', text: 'Program afiliasi kami memungkinkan kamu menghasilkan komisi dari setiap transaksi yang berhasil melalui link referral kamu. Cocok untuk blogger, YouTuber, reviewer komik, atau siapa saja yang memiliki audiens pecinta komik.' },
      { type: 'heading', text: 'Keuntungan Program Afiliasi' },
      { type: 'list', items: ['Komisi hingga 8% dari setiap transaksi', 'Pembayaran bulanan langsung ke rekening', 'Dashboard real-time untuk pantau kinerja', 'Materi promosi siap pakai (banner, copy)', 'Support tim afiliasi yang responsif'] },
      { type: 'heading', text: 'Cara Bergabung' },
      { type: 'list', items: ['Daftar akun di platform kami', 'Ajukan permohonan program afiliasi', 'Dapatkan link unik kamu dalam 1×24 jam', 'Mulai bagikan dan hasilkan komisi!'] },
      { type: 'highlight', text: 'Daftar sekarang dan mulai hasilkan dari passion komikmu.' },
    ],
  },
  'bisnis': {
    title: 'Toko Komik untuk Bisnis', icon: '🏢',
    desc: 'Solusi korporat untuk kebutuhan komik bisnis kamu',
    blocks: [
      { type: 'paragraph', text: 'Toko Komik Indonesia hadir untuk memenuhi kebutuhan bisnis kamu — dari pengadaan komik untuk perpustakaan perusahaan, hingga merchandise komik kustom untuk keperluan korporat.' },
      { type: 'heading', text: 'Layanan untuk Bisnis' },
      { type: 'list', items: ['Pembelian massal dengan harga khusus', 'Pengadaan perpustakaan komik perusahaan', 'Komik kustom bermerek (white-label)', 'Invoice dan faktur pajak resmi', 'Account manager dedicated untuk klien korporat'] },
      { type: 'highlight', text: 'Hubungi tim kami di bisnis@tokokomikindonesia.id untuk penawaran khusus.' },
    ],
  },
  'marketing': {
    title: 'Solusi Marketing Komik', icon: '📣',
    desc: 'Promosikan produk kamu melalui medium komik yang unik',
    blocks: [
      { type: 'paragraph', text: 'Komik adalah medium storytelling yang kuat dan memorable. Kami membantu brand kamu berkomunikasi dengan audiens melalui komik yang menarik, kreatif, dan efektif.' },
      { type: 'heading', text: 'Produk Marketing Kami' },
      { type: 'list', items: ['Komik branded untuk kampanye marketing', 'Iklan native dalam komik populer kami', 'Sponsorship konten editorial blog & media sosial', 'Komik edukasi untuk CSR dan program sosial'] },
      { type: 'highlight', text: 'Mari buat kampanye komik yang berkesan. Hubungi marketing@tokokomikindonesia.id' },
    ],
  },
  'cara-berbelanja': {
    title: 'Cara Berbelanja', icon: '🛒',
    desc: 'Panduan lengkap berbelanja di Toko Komik Indonesia',
    blocks: [
      { type: 'heading', text: '1. Cari Komik' },
      { type: 'paragraph', text: 'Gunakan kolom pencarian atau filter genre untuk menemukan komik yang kamu inginkan. Klik judul komik untuk melihat detail lengkap, termasuk deskripsi, tahun terbit, jumlah halaman, dan ulasan pembeli.' },
      { type: 'heading', text: '2. Tambah ke Keranjang' },
      { type: 'paragraph', text: 'Klik tombol "Tambah ke Keranjang" atau langsung "Beli Sekarang" untuk checkout lebih cepat. Kamu bisa mengatur jumlah pembelian sesuai kebutuhan.' },
      { type: 'heading', text: '3. Isi Data Pengiriman' },
      { type: 'paragraph', text: 'Isi nama lengkap, nomor telepon, dan alamat pengiriman dengan benar. Pastikan kode pos dan nama kota sudah sesuai untuk memastikan paket tiba tepat waktu.' },
      { type: 'heading', text: '4. Pilih Metode Pembayaran' },
      { type: 'paragraph', text: 'Kami menerima berbagai metode pembayaran: transfer bank, kartu kredit/debit, dompet digital (GoPay, OVO, DANA), dan COD (bayar di tempat) untuk area tertentu.' },
      { type: 'heading', text: '5. Konfirmasi Pesanan' },
      { type: 'paragraph', text: 'Setelah pembayaran dikonfirmasi, pesanan akan langsung diproses oleh seller. Pantau status pesanan kamu di halaman Profil → Pesanan Saya.' },
      { type: 'highlight', text: 'Butuh bantuan? Hubungi tim support kami melalui fitur Chat di halaman utama.' },
    ],
  },
  'pembayaran-cod': {
    title: 'Pembayaran COD', icon: '💵',
    desc: 'Bayar saat barang tiba di tangan kamu',
    blocks: [
      { type: 'paragraph', text: 'COD (Cash on Delivery) memungkinkan kamu membayar pesanan saat barang tiba di alamat pengiriman. Tidak perlu khawatir soal keamanan transaksi online.' },
      { type: 'heading', text: 'Ketentuan COD' },
      { type: 'list', items: ['Tersedia untuk area Jabodetabek, Bandung, Surabaya, dan Yogyakarta', 'Minimum pembelian Rp 25.000', 'Maksimum transaksi COD Rp 500.000', 'Siapkan uang pas untuk memudahkan proses serah terima', 'Periksa kondisi paket sebelum membayar kepada kurir'] },
      { type: 'highlight', text: 'COD tersedia di kota pilihan. Cek ketersediaan saat checkout.' },
    ],
  },
  'bebas-ongkir': {
    title: 'Bebas Ongkir', icon: '🚚',
    desc: 'Nikmati gratis ongkos kirim untuk pembelianmu',
    blocks: [
      { type: 'paragraph', text: 'Program Bebas Ongkir hadir untuk memastikan kamu bisa berbelanja komik favorit tanpa khawatir biaya pengiriman yang memberatkan.' },
      { type: 'heading', text: 'Syarat Bebas Ongkir' },
      { type: 'list', items: ['Bebas ongkir untuk pembelian pertama (tanpa minimum)', 'Bebas ongkir reguler: minimum pembelian Rp 50.000', 'Berlaku untuk pengiriman ke seluruh wilayah Indonesia', 'Menggunakan mitra kurir: JNE, J&T, SiCepat, Pos Indonesia'] },
      { type: 'heading', text: 'Cara Mendapatkan Bebas Ongkir' },
      { type: 'list', items: ['Masuk ke akun kamu', 'Tambahkan komik ke keranjang (minimal sesuai syarat)', 'Pilih opsi "Gratis Ongkir" saat checkout', 'Selesaikan pembayaran — gratis ongkir otomatis teraplikasi'] },
      { type: 'highlight', text: 'Program bebas ongkir dapat berubah sewaktu-waktu. Cek syarat terkini saat checkout.' },
    ],
  },
  'promo': {
    title: 'Promo Hari Ini', icon: '🎉',
    desc: 'Penawaran terbaik yang sayang untuk dilewatkan',
    blocks: [
      { type: 'paragraph', text: 'Temukan berbagai promo menarik yang kami hadirkan setiap hari khusus untuk pecinta komik Indonesia.' },
      { type: 'heading', text: 'Promo Aktif' },
      { type: 'list', items: ['🔥 Flash Sale Komik Klasik — diskon hingga 20% setiap hari pukul 12.00–14.00', '📦 Bebas Ongkir untuk pembelian pertama', '🎁 Beli 3 komik gratis 1 (berlaku untuk koleksi tertentu)', '💳 Cashback 10% untuk pembayaran via GoPay & OVO', '⭐ Double poin untuk member baru bulan ini'] },
      { type: 'highlight', text: 'Promo berubah setiap hari. Pantau terus halaman ini dan ikuti media sosial kami!' },
    ],
  },
  'promosi-toko': {
    title: 'Promosi Toko', icon: '📣',
    desc: 'Tingkatkan visibilitas tokomu di platform kami',
    blocks: [
      { type: 'paragraph', text: 'Sebagai seller di Toko Komik Indonesia, kamu memiliki berbagai pilihan promosi untuk meningkatkan penjualan dan visibilitas toko.' },
      { type: 'heading', text: 'Fitur Promosi Tersedia' },
      { type: 'list', items: ['Iklan produk (tampil di posisi teratas pencarian)', 'Flash Sale mandiri (atur diskon waktu terbatas)', 'Bundle deal (beli 2 hemat lebih banyak)', 'Voucher toko (bagikan kode diskon ke pembeli)', 'Fitur unggulan di halaman utama (slot terbatas)'] },
      { type: 'highlight', text: 'Akses fitur promosi dari dashboard Seller → Promosi Toko.' },
    ],
  },
  'bantuan': {
    title: 'Pusat Bantuan', icon: '🆘',
    desc: 'Temukan jawaban untuk pertanyaan kamu',
    blocks: [
      { type: 'faq', faqs: [
        { q: 'Bagaimana cara melacak pesanan saya?', a: 'Masuk ke akun kamu, buka menu Profil → Pesanan Saya. Di sana kamu bisa melihat status terkini pesanan beserta nomor resi pengiriman.' },
        { q: 'Apa yang harus dilakukan jika pesanan tidak datang?', a: 'Jika pesanan belum tiba sesuai estimasi, hubungi seller melalui fitur chat. Jika tidak ada respons dalam 1×24 jam, ajukan komplain melalui menu Pesanan → Ajukan Komplain.' },
        { q: 'Bisakah saya membatalkan pesanan?', a: 'Pesanan dapat dibatalkan selama masih berstatus "Pesanan Masuk". Setelah seller memproses pesanan, pembatalan tidak dapat dilakukan.' },
        { q: 'Bagaimana cara mengembalikan produk?', a: 'Baca kebijakan pengembalian kami untuk detail lengkap. Secara umum, pengembalian diterima jika produk rusak atau tidak sesuai deskripsi.' },
        { q: 'Metode pembayaran apa saja yang tersedia?', a: 'Kami menerima transfer bank (BCA, Mandiri, BNI, BRI), kartu kredit/debit, GoPay, OVO, DANA, dan COD untuk area tertentu.' },
        { q: 'Bagaimana cara mendaftar sebagai seller?', a: 'Klik "Daftar sebagai Seller" di halaman register. Isi data toko kamu dan mulai berjualan dalam hitungan menit.' },
      ]},
      { type: 'highlight', text: 'Tidak menemukan jawaban? Chat dengan tim support kami melalui widget chat di pojok kanan bawah.' },
    ],
  },
  'cara-pemesanan': {
    title: 'Cara Pemesanan', icon: '📋',
    desc: 'Langkah mudah memesan komik favoritmu',
    blocks: [
      { type: 'list', items: [
        'Pilih komik yang ingin dibeli dan klik "Tambah ke Keranjang"',
        'Buka halaman Keranjang dan periksa daftar pesanan',
        'Klik "Checkout" dan isi form data pengiriman',
        'Pilih metode pengiriman (reguler/express)',
        'Pilih metode pembayaran dan selesaikan transaksi',
        'Kamu akan menerima notifikasi konfirmasi pesanan',
      ]},
      { type: 'highlight', text: 'Pesanan diproses dalam 1×24 jam hari kerja setelah pembayaran dikonfirmasi.' },
    ],
  },
  'cara-pembayaran': {
    title: 'Cara Pembayaran', icon: '💳',
    desc: 'Berbagai metode pembayaran yang aman dan mudah',
    blocks: [
      { type: 'heading', text: 'Transfer Bank' },
      { type: 'list', items: ['BCA Virtual Account', 'Mandiri Virtual Account', 'BNI Virtual Account', 'BRI Virtual Account'] },
      { type: 'heading', text: 'Dompet Digital' },
      { type: 'list', items: ['GoPay (langsung dari aplikasi)', 'OVO', 'DANA', 'ShopeePay'] },
      { type: 'heading', text: 'Kartu Kredit / Debit' },
      { type: 'list', items: ['Visa', 'Mastercard', 'JCB (kartu kredit tertentu)'] },
      { type: 'heading', text: 'COD (Cash on Delivery)' },
      { type: 'paragraph', text: 'Tersedia untuk area tertentu. Bayar tunai langsung kepada kurir saat paket tiba.' },
      { type: 'highlight', text: 'Seluruh transaksi dienkripsi dan aman. Kami tidak menyimpan data kartu pembayaranmu.' },
    ],
  },
  'syarat-ketentuan': {
    title: 'Syarat dan Ketentuan', icon: '📜',
    desc: 'Ketentuan penggunaan platform Toko Komik Indonesia',
    blocks: [
      { type: 'paragraph', text: 'Dengan menggunakan platform Toko Komik Indonesia, kamu menyetujui syarat dan ketentuan berikut ini. Harap baca dengan seksama.' },
      { type: 'heading', text: '1. Penggunaan Platform' },
      { type: 'list', items: ['Platform hanya boleh digunakan untuk tujuan yang sah dan sesuai hukum Indonesia', 'Pengguna wajib mendaftar dengan data yang valid dan akurat', 'Satu pengguna hanya boleh memiliki satu akun aktif', 'Dilarang menggunakan platform untuk penipuan atau aktivitas ilegal'] },
      { type: 'heading', text: '2. Transaksi dan Pembayaran' },
      { type: 'list', items: ['Harga yang tertera sudah final dan termasuk PPN', 'Pembayaran harus dilakukan dalam 24 jam setelah order dibuat', 'Toko Komik Indonesia tidak bertanggung jawab atas kesalahan input data pembeli'] },
      { type: 'heading', text: '3. Seller dan Produk' },
      { type: 'list', items: ['Seller bertanggung jawab atas keakuratan deskripsi produk', 'Produk yang dijual harus komik Indonesia original (bukan bajakan)', 'Toko Komik Indonesia berhak menghapus produk yang melanggar ketentuan'] },
      { type: 'heading', text: '4. Perubahan Ketentuan' },
      { type: 'paragraph', text: 'Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diinformasikan melalui email dan notifikasi platform.' },
      { type: 'highlight', text: 'Terakhir diperbarui: Mei 2026' },
    ],
  },
  'kebijakan-privasi': {
    title: 'Kebijakan Privasi', icon: '🔒',
    desc: 'Bagaimana kami melindungi data pribadimu',
    blocks: [
      { type: 'paragraph', text: 'Toko Komik Indonesia berkomitmen untuk melindungi privasi dan keamanan data pribadi seluruh pengguna platform kami, sesuai dengan peraturan perundang-undangan yang berlaku di Indonesia.' },
      { type: 'heading', text: 'Data yang Kami Kumpulkan' },
      { type: 'list', items: ['Informasi identitas: nama, email, nomor telepon', 'Informasi pengiriman: alamat, kota, provinsi', 'Data transaksi: riwayat pembelian dan penjualan', 'Data teknis: IP address, jenis browser, perangkat'] },
      { type: 'heading', text: 'Penggunaan Data' },
      { type: 'list', items: ['Memproses dan menyelesaikan transaksi', 'Mengirimkan konfirmasi dan update status pesanan', 'Meningkatkan layanan dan pengalaman pengguna', 'Mengirimkan informasi promo (dapat di-opt-out)'] },
      { type: 'heading', text: 'Keamanan Data' },
      { type: 'paragraph', text: 'Kami menggunakan enkripsi SSL/TLS untuk seluruh transmisi data dan menyimpan data di server yang aman. Kami tidak pernah menjual data pribadi kamu kepada pihak ketiga.' },
      { type: 'highlight', text: 'Kami mematuhi standar PCI DSS, ISO 27001, dan ISO 27701. Terakhir diperbarui: Mei 2026.' },
    ],
  },
  'kebijakan-pengembalian': {
    title: 'Kebijakan Pengembalian', icon: '↩️',
    desc: 'Ketentuan pengembalian produk dan refund',
    blocks: [
      { type: 'heading', text: 'Kapan Produk Bisa Dikembalikan?' },
      { type: 'list', items: ['Produk rusak atau cacat saat diterima', 'Produk tidak sesuai dengan deskripsi di platform', 'Produk yang diterima berbeda dari yang dipesan', 'Produk mengalami kerusakan selama pengiriman'] },
      { type: 'heading', text: 'Syarat Pengembalian' },
      { type: 'list', items: ['Pengajuan pengembalian dalam 3 hari setelah produk diterima', 'Sertakan foto produk yang menunjukkan kerusakan/ketidaksesuaian', 'Produk harus dalam kondisi belum digunakan (kecuali cacat produksi)', 'Kemasan original masih ada'] },
      { type: 'heading', text: 'Proses Refund' },
      { type: 'list', items: ['Pengajuan diverifikasi dalam 1-3 hari kerja', 'Jika disetujui, refund diproses dalam 3-7 hari kerja', 'Dana dikembalikan ke metode pembayaran asal'] },
      { type: 'highlight', text: 'Ajukan pengembalian melalui Profil → Pesanan Saya → Ajukan Komplain.' },
    ],
  },
  'hak-kekayaan-intelektual': {
    title: 'Hak Kekayaan Intelektual', icon: '©️',
    desc: 'Kebijakan perlindungan hak cipta di platform kami',
    blocks: [
      { type: 'paragraph', text: 'Toko Komik Indonesia sangat menghormati hak kekayaan intelektual para komikus, penulis, dan penerbit Indonesia. Kami berkomitmen untuk hanya menjual karya original dan berlisensi.' },
      { type: 'heading', text: 'Komitmen Kami' },
      { type: 'list', items: ['Hanya komik original berlisensi yang boleh dijual di platform', 'Setiap seller wajib memiliki hak jual yang sah', 'Laporan pelanggaran HKI ditindak dalam 1×24 jam', 'Kami bekerja sama dengan DJKI Kemenkumham RI'] },
      { type: 'highlight', text: 'Temukan pelanggaran HKI? Laporkan ke hki@tokokomikindonesia.id' },
    ],
  },
  'mitra': {
    title: 'Mitra Toko Komik', icon: '🤝',
    desc: 'Program kemitraan untuk toko buku dan distributor',
    blocks: [
      { type: 'paragraph', text: 'Kami membuka peluang kemitraan untuk toko buku, distributor, dan lembaga yang ingin berkolaborasi dalam mengembangkan ekosistem komik Indonesia.' },
      { type: 'list', items: ['Kemitraan toko buku fisik', 'Program distributor eksklusif', 'Kolaborasi penerbit komik', 'Kemitraan perpustakaan daerah', 'Program event dan festival komik'] },
      { type: 'highlight', text: 'Hubungi mitra@tokokomikindonesia.id untuk diskusi lebih lanjut.' },
    ],
  },
  'media-sosial': {
    title: 'Media Sosial', icon: '📱',
    desc: 'Ikuti kami di berbagai platform media sosial',
    blocks: [
      { type: 'paragraph', text: 'Tetap terhubung dengan komunitas Toko Komik Indonesia. Dapatkan update terbaru, promo eksklusif, dan konten menarik seputar dunia komik Indonesia.' },
      { type: 'list', items: [
        '📘 Facebook: facebook.com/TokokomikIndonesia — Komunitas & diskusi komik',
        '🐦 Twitter/X: @TokokomikID — Update cepat dan promo harian',
        '📸 Instagram: @tokokomik.indonesia — Visual komik & behind the scenes',
        '📌 Pinterest: pinterest.com/tokokomikindonesia — Inspirasi koleksi komik',
      ]},
      { type: 'highlight', text: 'Follow & tag kami dengan #KomikIndonesia untuk kesempatan tampil di feed kami!' },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map(slug => ({ slug }));
}

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-red-700 transition-colors">Beranda</Link>
        <span>›</span>
        <span className="text-gray-600">{page.title}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="text-4xl mb-3">{page.icon}</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{page.title}</h1>
        <p className="text-gray-500 text-lg">{page.desc}</p>
      </div>

      {/* Content */}
      <div className="space-y-5">
        {page.blocks.map((block, i) => {
          if (block.type === 'heading') return (
            <h2 key={i} className="text-xl font-bold text-gray-800 mt-8 pt-2 border-t border-gray-100">{block.text}</h2>
          );
          if (block.type === 'paragraph') return (
            <p key={i} className="text-gray-600 leading-relaxed">{block.text}</p>
          );
          if (block.type === 'list') return (
            <ul key={i} className="space-y-2">
              {block.items!.map((item, j) => (
                <li key={j} className="flex items-start gap-3 text-gray-600">
                  <span className="text-red-500 mt-0.5 shrink-0">•</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          );
          if (block.type === 'highlight') return (
            <div key={i} className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-800 font-medium text-sm">
              {block.text}
            </div>
          );
          if (block.type === 'faq') return (
            <div key={i} className="space-y-3">
              {block.faqs!.map((faq, j) => (
                <details key={j} className="bg-gray-50 rounded-xl border border-gray-200 group">
                  <summary className="px-5 py-4 font-semibold text-gray-800 cursor-pointer list-none flex items-center justify-between hover:text-red-700 transition-colors">
                    {faq.q}
                    <span className="text-gray-400 group-open:rotate-180 transition-transform text-sm">▼</span>
                  </summary>
                  <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-200 pt-3">{faq.a}</div>
                </details>
              ))}
            </div>
          );
          if (block.type === 'articles') return (
            <div key={i} className="space-y-4">
              {block.articles!.map((article, j) => (
                <div key={j} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-red-300 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{article.category}</span>
                    <span className="text-xs text-gray-400">{article.date}</span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2 hover:text-red-700 transition-colors">{article.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{article.excerpt}</p>
                </div>
              ))}
            </div>
          );
          if (block.type === 'careers') return (
            <div key={i} className="space-y-3">
              {block.jobs!.map((job, j) => (
                <div key={j} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-red-300 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">{job.title}</h3>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{job.dept}</span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">📍 {job.location}</span>
                        <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{job.type}</span>
                      </div>
                    </div>
                    <button className="shrink-0 bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-red-800 transition-colors">
                      Lamar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
          return null;
        })}
      </div>

      {/* Back */}
      <div className="mt-12 pt-6 border-t border-gray-100">
        <Link href="/" className="text-sm text-red-700 font-semibold hover:underline flex items-center gap-1.5">
          ← Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
