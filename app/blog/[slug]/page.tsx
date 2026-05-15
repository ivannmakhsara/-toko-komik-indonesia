import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Article {
  title: string;
  era: string;
  icon: string;
  date: string;
  readTime: string;
  category: string;
  lead: string;
  color: string;
  sections: {
    heading?: string;
    body?: string;
    quote?: string;
    quoteAuthor?: string;
    comics?: { title: string; author: string; year: number; icon: string; desc: string }[];
    list?: string[];
  }[];
  closing: string;
  related: string[];
}

const ARTICLES: Record<string, Article> = {
  'era-keemasan': {
    title: 'Era Keemasan: Lahirnya Komik Indonesia (1950-an)',
    era: '1950-an', icon: '🌟', date: '10 Mei 2026', readTime: '6 menit',
    category: 'Sejarah', color: 'from-amber-600 to-orange-700',
    lead: 'Dekade 1950-an adalah momen lahirnya identitas komik Indonesia. Dari tangan R.A. Kosasih dan beberapa seniman pionir, dunia sequential art lokal mulai menemukan suaranya sendiri — jauh dari bayang-bayang komik impor Amerika dan Eropa.',
    sections: [
      {
        heading: 'Sebelum Ada "Komik Indonesia"',
        body: 'Sebelum era 1950-an, bacaan bergambar yang beredar di Indonesia didominasi oleh terbitan asing — komik strip Amerika seperti Flash Gordon dan Tarzan yang diterjemahkan, serta manga Jepang yang mulai masuk pasca-pendudukan. Seniman lokal pun ada, namun karya mereka masih banyak meniru gaya Barat tanpa identitas yang kuat.',
      },
      {
        quote: '"Saya ingin membuat komik yang bisa dimengerti oleh anak-anak Indonesia, dengan cerita yang dekat dengan kehidupan dan budaya kita."',
        quoteAuthor: 'R.A. Kosasih, Bapak Komik Indonesia',
      },
      {
        heading: 'R.A. Kosasih dan Sri Asih (1954)',
        body: 'Tahun 1954 menjadi tonggak bersejarah ketika Raden Ahmad Kosasih menerbitkan Sri Asih — superheroine wanita pertama Indonesia yang mendapat kekuatan dari Dewi Sri. Berbeda dari Wonder Woman milik DC Comics, Sri Asih lahir dari akar budaya Jawa yang kaya. Kostumnya terinspirasi tarian tradisional, kekuatannya datang dari dewi lokal, dan musuh-musuhnya adalah kejahatan yang benar-benar relevan dengan masyarakat Indonesia saat itu.',
      },
      {
        comics: [
          { title: 'Sri Asih', author: 'R.A. Kosasih', year: 1954, icon: '👸', desc: 'Superheroine pertama Indonesia dengan kekuatan dewi Sri. Pelopor representasi wanita kuat dalam budaya populer lokal.' },
          { title: 'Siti Gahara', author: 'R.A. Kosasih', year: 1954, icon: '📜', desc: 'Adaptasi epos Mahabharata dalam format komik. Kosasih berhasil membuat kisah pewayangan menjadi lebih aksesibel.' },
          { title: 'Roro Mendut', author: 'R.A. Kosasih', year: 1956, icon: '🏹', desc: 'Kisah romantis berlatar Mataram yang menggambarkan cinta terlarang dan perjuangan melawan tirani.' },
        ],
      },
      {
        heading: 'Komik Wayang: Jembatan Tradisi dan Modern',
        body: 'Salah satu kontribusi terbesar era ini adalah komik wayang — adaptasi epos besar seperti Mahabharata dan Ramayana ke dalam format komik. R.A. Kosasih adalah pionirnya, berhasil memvisualkan karakter-karakter wayang yang selama ini hanya dikenal melalui pertunjukan tradisional. Ini bukan sekadar adaptasi, melainkan pelestarian budaya dalam medium baru.',
      },
      {
        heading: 'Pengaruh Era Ini Hingga Kini',
        list: [
          'Komik wayang yang dipopulerkan Kosasih menjadi inspirasi puluhan seniman generasi berikutnya',
          'Sri Asih diangkat ke layar lebar pada 2022, membuktikan daya tahan karakter ikonik',
          'Gaya ilustrasi era ini memengaruhi estetika visual komik Indonesia hingga dekade 2000-an',
          'Format cerita berseri yang diperkenalkan era ini menjadi standar industri',
        ],
      },
    ],
    closing: 'Era 1950-an bukan sekadar "awal" dari komik Indonesia — ini adalah deklarasi identitas. Bahwa Indonesia bisa punya superhero sendiri, punya gaya seni sendiri, punya cerita yang lahir dari tanah dan budayanya sendiri. Warisan itu terus hidup hingga hari ini.',
    related: ['pahlawan-legendaris', 'gelombang-baru'],
  },

  'pahlawan-legendaris': {
    title: 'Pahlawan Legendaris: Masa Kejayaan Aksi & Silat (1960–70-an)',
    era: '1960–70-an', icon: '⚡', date: '2 Mei 2026', readTime: '7 menit',
    category: 'Sejarah', color: 'from-red-700 to-red-900',
    lead: 'Dekade 1960-an dan 1970-an adalah masa paling produktif dalam sejarah komik Indonesia. Ratusan judul lahir setiap tahun, karakter-karakter ikonik bermunculan, dan industri komik lokal benar-benar merasakan masa kejayaannya yang belum pernah terulang lagi hingga hari ini.',
    sections: [
      {
        heading: 'Boom Komik Silat',
        body: 'Jika era 1950-an ditandai oleh komik wayang dan superhero, era 1960–70-an dikuasai oleh komik silat. Cerita pendekar, dunia persilatan, dan pertempuran tiada henti menjadi menu utama pembaca komik Indonesia. Ini bukan kebetulan — pengaruh film-film silat Shaw Brothers dari Hong Kong sedang sangat kuat, dan penerbit komik lokal dengan cepat menangkap selera pasar.',
      },
      {
        comics: [
          { title: 'Gundala Putera Petir', author: 'Hasmi', year: 1969, icon: '⚡', desc: 'Sancaka, ilmuwan yang tersambar petir, menjadi superhero Indonesia paling ikonik. Pertama kali terbit 1969, masih relevan hingga kini.' },
          { title: 'Si Buta dari Goa Hantu', author: 'Ganes TH', year: 1967, icon: '👤', desc: 'Barda Mandrawata, pendekar buta dengan indera tajam. Kisahnya penuh filosofi tentang keadilan yang melampaui penglihatan fisik.' },
          { title: 'Wiro Sableng 212', author: 'Bastian Tito', year: 1967, icon: '🪓', desc: 'Pendekar bertato kapak 212 yang kocak sekaligus mematikan. Serial paling panjang dalam sejarah komik Indonesia.' },
          { title: 'Panji Tengkorak', author: 'Hans Jaladara', year: 1968, icon: '💀', desc: 'Pendekar bertopeng tengkorak yang misterius. Visualnya gelap dan dramatis, jauh mendahului tren komik dark di Indonesia.' },
          { title: 'Godam', author: 'Wid NS', year: 1969, icon: '🦸', desc: 'Manusia baja dari planet Covox. Bersama Gundala, membentuk duo superhero paling terkenal Indonesia.' },
        ],
      },
      {
        heading: 'Gundala: Lebih dari Sekadar Superhero',
        body: 'Di antara semua karakter era ini, Gundala Putera Petir karya Hasmi memiliki tempat yang sangat istimewa. Diterbitkan pertama kali pada 1969, Gundala bukan sekadar tiruan Superman atau Flash — ia adalah refleksi kegelisahan masyarakat Indonesia tentang ilmu pengetahuan, modernitas, dan tanggung jawab moral. Sancaka, sang ilmuwan, mewakili generasi terdidik Indonesia yang bergulat dengan identitas di tengah perubahan zaman.',
      },
      {
        quote: '"Komik Indonesia era ini bukan hanya hiburan. Di dalamnya tersimpan cermin masyarakat — kegelisahan, harapan, dan nilai-nilai yang dipegang teguh."',
        quoteAuthor: 'Peneliti Budaya Populer Indonesia',
      },
      {
        heading: 'Mengapa Era Ini Tidak Terulang?',
        body: 'Sayangnya, kejayaan ini tidak bertahan. Memasuki dekade 1980-an, manga Jepang mulai membanjiri pasar Indonesia dengan harga murah dan kualitas cetak yang lebih baik. Komik lokal terdesak dan banyak penerbit gulung tikar. Namun warisan yang mereka tinggalkan tidak bisa dihapus — ratusan karakter, ribuan judul, dan jutaan pembaca yang tumbuh bersama mereka.',
      },
      {
        heading: 'Warisan yang Tak Ternilai',
        list: [
          'Gundala diadaptasi menjadi film layar lebar berkali-kali, terakhir 2019 oleh Joko Anwar',
          'Wiro Sableng diangkat ke serial TV dan film pada 2018',
          'Si Buta dari Goa Hantu menjadi salah satu karakter paling sering dirujuk dalam kajian budaya pop Indonesia',
          'Karakter-karakter era ini menjadi "Jagat Sinema Bumilangit" — MCU versi Indonesia',
        ],
      },
    ],
    closing: 'Era 1960–70-an mengajarkan kita bahwa Indonesia mampu menciptakan mitologi pop-nya sendiri. Gundala, Si Buta, Wiro Sableng — mereka bukan sekadar karakter fiksi, melainkan bagian dari DNA budaya bangsa yang terus hidup dalam berbagai medium hingga hari ini.',
    related: ['era-keemasan', 'gelombang-baru'],
  },

  'gelombang-baru': {
    title: 'Gelombang Baru: Kebangkitan Komik Urban (2000-an)',
    era: '2000-an', icon: '🎭', date: '25 April 2026', readTime: '5 menit',
    category: 'Industri', color: 'from-blue-700 to-blue-900',
    lead: 'Setelah dua dekade "kegelapan" yang didominasi manga impor, komik Indonesia menemukan jalannya kembali di awal 2000-an — kali ini bukan dengan pendekar atau superhero, melainkan dengan satire, humor urban, dan karakter yang hidup di dunia yang sangat akrab bagi pembaca modern.',
    sections: [
      {
        heading: 'Kebangkitan dari Abu',
        body: 'Dekade 1980-an dan 1990-an adalah masa suram bagi komik lokal. Manga Jepang mendominasi toko buku, dan komik Indonesia nyaris tidak terlihat. Namun pada akhir 1990-an dan awal 2000-an, sesuatu mulai bergerak. Internet mulai masuk, kelas menengah perkotaan tumbuh, dan ada kebutuhan baru akan konten yang mencerminkan kehidupan mereka sendiri.',
      },
      {
        comics: [
          { title: 'Benny & Mice', author: 'Benny Rachmadi & Muhammad Mice', year: 2001, icon: '🗞️', desc: 'Strip komik satire tentang Jakarta. Dua karakter ikonik yang mengomentari politik, sosial, dan absurditas kehidupan urban Indonesia.' },
          { title: 'Si Juki', author: 'Faza Meonk', year: 2012, icon: '😂', desc: 'Pemuda kocak yang selalu sial. Humor relatable yang menjangkau pembaca dari berbagai generasi via media sosial.' },
          { title: 'Garudayana', author: 'Is Yuniarto', year: 2009, icon: '🦅', desc: 'Epik fantasi berbasis mitologi Mahabharata dengan visual modern. Jembatan antara tradisi dan manga culture.' },
        ],
      },
      {
        heading: 'Benny & Mice: Ketika Komik Bicara Politik',
        body: 'Benny Rachmadi dan Muhammad "Mice" Misrad melakukan sesuatu yang cukup berani: menggunakan komik sebagai medium kritik sosial-politik yang tajam. Strip mereka yang terbit di harian Kompas sejak 2001 menyentil korupsi, kemacetan Jakarta, birokrasi yang absurd, dan berbagai fenomena sosial dengan humor yang cerdas namun tidak menggurui. Benny & Mice membuktikan bahwa komik bisa serius tanpa harus kehilangan kesenangannya.',
      },
      {
        quote: '"Media sosial mengubah segalanya. Tiba-tiba komik bisa menjangkau jutaan orang tanpa harus melewati penerbit tradisional."',
        quoteAuthor: 'Faza Meonk, Kreator Si Juki',
      },
      {
        heading: 'Si Juki dan Revolusi Media Sosial',
        body: 'Si Juki lahir di era Twitter dan Facebook — dan ini bukan kebetulan. Faza Meonk dengan cerdas memanfaatkan media sosial untuk membangun fanbase sebelum buku pertamanya diterbitkan. Strategi ini menjadi blueprint bagi puluhan komikus muda Indonesia: bangun komunitas online dulu, baru masuk ke jalur penerbitan tradisional.',
      },
      {
        heading: 'Dampak Gelombang Baru',
        list: [
          'Membuka kembali pasar komik lokal yang nyaris mati selama 20 tahun',
          'Memperkenalkan model distribusi baru via media sosial dan platform digital',
          'Melahirkan generasi komikus muda yang lebih percaya diri berkarya',
          'Membuktikan bahwa humor lokal bisa bersaing di pasar yang didominasi konten asing',
          'Si Juki berkembang menjadi franchise animasi, merchandise, dan film',
        ],
      },
    ],
    closing: 'Gelombang Baru bukan hanya tentang komik — ini tentang bangkitnya kepercayaan diri kreator Indonesia. Bahwa cerita tentang kemacetan Jakarta, warung kopi, dan kehidupan kelas menengah Indonesia sama menariknya dengan cerita pahlawan super dari negeri lain.',
    related: ['pahlawan-legendaris', 'era-digital'],
  },

  'era-digital': {
    title: 'Era Digital: Komik Indonesia Menuju Panggung Global (2010-an ke Depan)',
    era: '2010-an+', icon: '🚀', date: '18 April 2026', readTime: '6 menit',
    category: 'Industri', color: 'from-purple-700 to-purple-900',
    lead: 'Era digital bukan hanya soal format — ini adalah transformasi menyeluruh dari bagaimana komik Indonesia diproduksi, didistribusikan, dikonsumsi, dan diakui secara global. Untuk pertama kalinya dalam sejarahnya, komik Indonesia punya kesempatan nyata untuk bersaing di panggung internasional.',
    sections: [
      {
        heading: 'Webtoon dan Demokratisasi Komik',
        body: 'Masuknya platform Webtoon dari Korea Selatan pada pertengahan 2010-an mengubah lanskap komik Indonesia secara fundamental. Tiba-tiba siapa pun bisa mempublikasikan komik mereka tanpa harus melalui penerbit tradisional. Ribuan kreator Indonesia mulai berkarya di platform ini, dan yang mengejutkan — beberapa dari mereka meraih jutaan pembaca internasional.',
      },
      {
        comics: [
          { title: 'Garudayana', author: 'Is Yuniarto', year: 2009, icon: '🦅', desc: 'Pionir era baru komik fantasi Indonesia. Raih penghargaan internasional dan membuktikan komik lokal bisa bersaing secara global.' },
          { title: 'Nusantara 2044', author: 'Ario Anindito', year: 2020, icon: '🌏', desc: 'Distopia Indonesia masa depan dengan visual sinematik. Menggabungkan isu kebangsaan kontemporer dengan sci-fi yang memukau.' },
          { title: 'Si Juki the Movie', author: 'Faza Meonk', year: 2017, icon: '🎬', desc: 'Franchise komik yang sukses merambah animasi dan film layar lebar, membuktikan potensi IP komik lokal.' },
        ],
      },
      {
        heading: 'Bumilangit: Membangun Semesta Komik Indonesia',
        body: 'Salah satu perkembangan paling signifikan era ini adalah lahirnya Bumilangit — perusahaan yang mengakuisisi hak cipta ratusan karakter komik klasik Indonesia dan membangunnya menjadi "universe" seperti Marvel/DC. Film Gundala (2019) dan Sri Asih (2022) garapan Joko Anwar adalah bukti bahwa karakter komik Indonesia siap untuk medium lain. Ini bukan sekadar nostalgia — ini adalah pengakuan terhadap nilai IP yang telah tidur selama puluhan tahun.',
      },
      {
        quote: '"Komik Indonesia punya 70 tahun konten yang menunggu untuk ditemukan kembali. Kita hanya perlu mengemas ulang dengan cara yang relevan untuk generasi hari ini."',
        quoteAuthor: 'Ario Anindito, Komikus & Seniman Marvel',
      },
      {
        heading: 'Komikus Indonesia di Panggung Internasional',
        body: 'Era digital juga melahirkan fenomena baru: komikus Indonesia yang bekerja untuk penerbit besar dunia. Ario Anindito, kreator Nusantara 2044, juga dikenal sebagai seniman untuk komik-komik Marvel dan DC. Ini bukan hanya pencapaian individu, melainkan bukti bahwa kualitas dan estetika seniman Indonesia sudah diakui di tingkat global.',
      },
      {
        heading: 'Tantangan Era Digital',
        list: [
          'Persaingan konten yang semakin ketat dari seluruh dunia',
          'Monetisasi yang belum optimal untuk kreator independen',
          'Perlindungan hak cipta yang masih lemah di ekosistem digital',
          'Kesenjangan antara popularitas online dan penghargaan finansial',
          'Dominasi konten asing di platform global',
        ],
      },
      {
        heading: 'Masa Depan yang Menjanjikan',
        list: [
          'Platform Webtoon Indonesia dengan puluhan kreator berbayar',
          'NFT dan Web3 membuka model monetisasi baru untuk komikus',
          'Adaptasi ke animasi dan film terus meningkat',
          'Komunitas komik indie yang semakin solid dan terorganisir',
          'Pengakuan internasional yang semakin luas untuk kreator Indonesia',
        ],
      },
    ],
    closing: 'Era digital bukan akhir dari perjalanan — ini baru permulaan babak baru. Dengan teknologi yang terus berkembang, koneksi global yang semakin mudah, dan generasi kreator baru yang lahir di era internet, masa depan komik Indonesia belum pernah secerah ini. Tugas kita adalah mendukung dan merayakan setiap karya yang lahir dari tanah Indonesia.',
    related: ['gelombang-baru', 'pahlawan-legendaris'],
  },
};

const RELATED_META: Record<string, { title: string; era: string; icon: string }> = {
  'era-keemasan':        { title: 'Era Keemasan',        era: '1950-an',    icon: '🌟' },
  'pahlawan-legendaris': { title: 'Pahlawan Legendaris',  era: '1960–70-an', icon: '⚡' },
  'gelombang-baru':      { title: 'Gelombang Baru',       era: '2000-an',    icon: '🎭' },
  'era-digital':         { title: 'Era Digital',          era: '2010-an+',   icon: '🚀' },
};

export function generateStaticParams() {
  return Object.keys(ARTICLES).map(slug => ({ slug }));
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = ARTICLES[slug];
  if (!article) notFound();

  return (
    <div className="bg-gray-50 min-h-full">

      {/* ── Hero ── */}
      <div className={`bg-gradient-to-br ${article.color} text-white`}>
        <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center gap-2 mb-4 text-white/60 text-sm">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>›</span>
            <Link href="/info/blog" className="hover:text-white transition-colors">Blog</Link>
            <span>›</span>
            <span>Napak Tilas</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">{article.category}</span>
            <span className="text-white/60 text-xs">{article.era}</span>
          </div>
          <div className="text-5xl mb-4">{article.icon}</div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight mb-4">{article.title}</h1>
          <div className="flex items-center gap-4 text-white/70 text-sm">
            <span>📅 {article.date}</span>
            <span>⏱ {article.readTime} membaca</span>
          </div>
        </div>
      </div>

      {/* ── Article body ── */}
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Lead */}
        <p className="text-lg text-gray-700 leading-relaxed mb-8 font-medium border-l-4 border-red-600 pl-5">
          {article.lead}
        </p>

        {/* Sections */}
        <div className="space-y-8">
          {article.sections.map((section, i) => (
            <div key={i}>
              {section.heading && (
                <h2 className="text-xl font-bold text-gray-900 mb-3">{section.heading}</h2>
              )}
              {section.body && (
                <p className="text-gray-600 leading-relaxed">{section.body}</p>
              )}
              {section.quote && (
                <blockquote className="my-6 bg-gray-100 rounded-2xl px-6 py-5 border-l-4 border-red-600">
                  <p className="text-gray-800 font-medium text-lg leading-relaxed italic">"{section.quote}"</p>
                  {section.quoteAuthor && (
                    <p className="text-sm text-gray-500 mt-2 font-semibold">— {section.quoteAuthor}</p>
                  )}
                </blockquote>
              )}
              {section.list && (
                <ul className="space-y-2 mt-2">
                  {section.list.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-gray-600">
                      <span className="text-red-500 mt-0.5 shrink-0">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {section.comics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {section.comics.map((comic, j) => (
                    <div key={j} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4">
                      <span className="text-3xl shrink-0 mt-0.5">{comic.icon}</span>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{comic.title}</p>
                        <p className="text-xs text-gray-400 mb-1.5">{comic.author} · {comic.year}</p>
                        <p className="text-xs text-gray-500 leading-relaxed">{comic.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Closing */}
        <div className="mt-10 bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="text-gray-700 leading-relaxed font-medium">{article.closing}</p>
        </div>

        {/* Related articles */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="font-bold text-gray-800 mb-4">Baca Juga</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {article.related.map(relSlug => {
              const rel = RELATED_META[relSlug];
              if (!rel) return null;
              return (
                <Link key={relSlug} href={`/blog/${relSlug}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-red-300 hover:shadow-sm transition-all group">
                  <span className="text-2xl shrink-0">{rel.icon}</span>
                  <div>
                    <p className="text-xs text-gray-400">{rel.era}</p>
                    <p className="font-semibold text-gray-800 text-sm group-hover:text-red-700 transition-colors">{rel.title}</p>
                  </div>
                  <span className="ml-auto text-gray-400 group-hover:text-red-600 transition-colors">→</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Back */}
        <div className="mt-8">
          <Link href="/" className="text-sm text-red-700 font-semibold hover:underline flex items-center gap-1.5">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
