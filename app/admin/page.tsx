'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const ADMIN_EMAIL = 'ivannmakhsara@gmail.com';
const STORAGE_KEY = 'tki-admin-posts';

interface AdminPost {
  slug: string;
  title: string;
  category: string;
  icon: string;
  date: string;
  lead: string;
  body: string;
  published: boolean;
}

const EMPTY_POST: Omit<AdminPost, 'slug'> = {
  title: '', category: 'Berita', icon: '📰',
  date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
  lead: '', body: '', published: true,
};

const CATEGORIES = ['Berita', 'Sejarah', 'Review', 'Tutorial', 'Event', 'Komunitas'];
const ICONS      = ['📰','📚','🎨','🏆','🌟','💡','🎭','🖼️','📖','✏️'];

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60);
}

function getPosts(): AdminPost[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function savePosts(posts: AdminPost[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [posts,    setPosts]    = useState<AdminPost[]>([]);
  const [view,     setView]     = useState<'list' | 'edit' | 'new'>('list');
  const [editing,  setEditing]  = useState<AdminPost | null>(null);
  const [form,     setForm]     = useState<Omit<AdminPost, 'slug'>>({ ...EMPTY_POST });
  const [editSlug, setEditSlug] = useState('');
  const [saved,    setSaved]    = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    setPosts(getPosts());
  }, []);

  function openNew() {
    setForm({ ...EMPTY_POST, date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) });
    setEditSlug('');
    setEditing(null);
    setView('new');
  }

  function openEdit(post: AdminPost) {
    setEditing(post);
    setForm({ title: post.title, category: post.category, icon: post.icon, date: post.date, lead: post.lead, body: post.body, published: post.published });
    setEditSlug(post.slug);
    setView('edit');
  }

  function handleSave() {
    if (!form.title.trim() || !form.lead.trim()) { alert('Judul dan lead wajib diisi.'); return; }
    const slug = view === 'new' ? slugify(form.title) || `post-${Date.now()}` : editSlug;
    const post: AdminPost = { slug, ...form };
    const existing = getPosts();

    let updated: AdminPost[];
    if (view === 'edit') {
      updated = existing.map(p => p.slug === editSlug ? post : p);
    } else {
      if (existing.find(p => p.slug === slug)) {
        post.slug = `${slug}-${Date.now()}`;
      }
      updated = [post, ...existing];
    }
    savePosts(updated);
    setPosts(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setView('list');
  }

  function handleDelete(slug: string) {
    if (!confirm('Hapus artikel ini?')) return;
    const updated = getPosts().filter(p => p.slug !== slug);
    savePosts(updated);
    setPosts(updated);
  }

  function togglePublish(slug: string) {
    const updated = getPosts().map(p => p.slug === slug ? { ...p, published: !p.published } : p);
    savePosts(updated);
    setPosts(updated);
  }

  if (loading || !user) return null;
  if (user.email !== ADMIN_EMAIL) return null;

  const inp = 'w-full bg-[#1a1a1c] border border-white/[0.12] rounded-[10px] px-3 py-2 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-white/30 [color-scheme:dark]';

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      {/* Top bar */}
      <div className="bg-[#0D0D0F] border-b border-white/[0.06] px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-white/30 hover:text-white/60 transition-colors text-sm">← Kembali ke Toko</Link>
        <div className="w-px h-4 bg-white/[0.08]" />
        <p className="font-display font-bold text-white/80">Panel Admin</p>
        <span className="text-[10px] bg-[#D90429]/15 text-[#D90429] border border-[#D90429]/20 px-2 py-0.5 rounded-full font-semibold">
          {user.email}
        </span>
        <div className="ml-auto flex items-center gap-3">
          {saved && <span className="text-green-400 text-sm font-semibold animate-pulse">✓ Tersimpan</span>}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* ── List view ── */}
        {view === 'list' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display text-2xl font-bold text-[#F2F2F0]">Manajemen Blog</h1>
                <p className="text-white/35 text-sm mt-0.5">{posts.length} artikel tersimpan</p>
              </div>
              <button onClick={openNew}
                className="bg-[#D90429] text-white px-4 py-2 rounded-[12px] text-sm font-semibold hover:bg-[#B0021F] transition-colors">
                + Artikel Baru
              </button>
            </div>

            {posts.length === 0 ? (
              <div className="bg-[#111113] border border-white/[0.07] rounded-[16px] p-16 text-center">
                <p className="text-4xl mb-3">📝</p>
                <p className="text-white/40 text-sm mb-4">Belum ada artikel. Buat artikel pertama!</p>
                <button onClick={openNew}
                  className="bg-[#D90429] text-white px-5 py-2 rounded-[12px] text-sm font-semibold hover:bg-[#B0021F] transition-colors">
                  Tulis Artikel
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map(post => (
                  <div key={post.slug} className="bg-[#111113] border border-white/[0.07] rounded-[16px] px-5 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#D90429]/10 border border-[#D90429]/15 rounded-[10px] flex items-center justify-center text-xl shrink-0">
                      {post.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-white/80 text-sm truncate">{post.title}</p>
                        {!post.published && (
                          <span className="text-[10px] border border-white/[0.12] text-white/30 px-1.5 py-0.5 rounded-full shrink-0">Draft</span>
                        )}
                      </div>
                      <p className="text-xs text-white/30">{post.category} · {post.date} · /blog/{post.slug}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => togglePublish(post.slug)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          post.published
                            ? 'border-green-500/30 text-green-400/70 hover:bg-green-500/10'
                            : 'border-white/[0.10] text-white/35 hover:border-white/20'
                        }`}>
                        {post.published ? 'Publik' : 'Draft'}
                      </button>
                      <Link href={`/blog/${post.slug}`} target="_blank"
                        className="text-xs px-2.5 py-1 rounded-full border border-white/[0.10] text-white/35 hover:border-white/20 hover:text-white/60 transition-colors">
                        Lihat
                      </Link>
                      <button onClick={() => openEdit(post)}
                        className="text-xs px-2.5 py-1 rounded-full border border-[#D90429]/20 text-[#D90429]/60 hover:bg-[#D90429]/10 hover:text-[#D90429] transition-colors">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(post.slug)}
                        className="text-xs px-2.5 py-1 rounded-full border border-red-500/20 text-red-400/50 hover:bg-red-500/10 hover:text-red-400 transition-colors">
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Edit / New view ── */}
        {(view === 'edit' || view === 'new') && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setView('list')} className="text-white/30 hover:text-white/60 transition-colors text-sm">← Kembali</button>
              <h1 className="font-display text-xl font-bold text-[#F2F2F0]">
                {view === 'new' ? 'Artikel Baru' : 'Edit Artikel'}
              </h1>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main content */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-[#111113] border border-white/[0.07] rounded-[16px] p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-1.5">Judul Artikel</label>
                    <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="Tulis judul artikel..." className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-1.5">Lead / Ringkasan</label>
                    <textarea value={form.lead} onChange={e => setForm(p => ({ ...p, lead: e.target.value }))}
                      placeholder="Paragraf pembuka yang menarik perhatian pembaca..." rows={3}
                      className={`${inp} resize-none`} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-1.5">Isi Artikel</label>
                    <p className="text-[10px] text-white/25 mb-2">Gunakan baris kosong untuk memisahkan paragraf.</p>
                    <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                      placeholder="Tulis isi artikel di sini..." rows={14}
                      className={`${inp} resize-none`} />
                  </div>
                </div>
              </div>

              {/* Sidebar settings */}
              <div className="space-y-4">
                <div className="bg-[#111113] border border-white/[0.07] rounded-[16px] p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-1.5">Kategori</label>
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inp}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-1.5">Ikon</label>
                    <div className="grid grid-cols-5 gap-2">
                      {ICONS.map(ic => (
                        <button key={ic} type="button" onClick={() => setForm(p => ({ ...p, icon: ic }))}
                          className={`text-xl h-10 rounded-[8px] transition-colors ${form.icon === ic ? 'bg-[#D90429]/20 border border-[#D90429]/40' : 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08]'}`}>
                          {ic}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-1.5">Tanggal</label>
                    <input value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                      placeholder="13 Mei 2026" className={inp} />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div onClick={() => setForm(p => ({ ...p, published: !p.published }))}
                      className={`relative w-10 h-5 rounded-full transition-colors ${form.published ? 'bg-[#D90429]' : 'bg-white/[0.12]'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.published ? 'translate-x-5' : ''}`} />
                    </div>
                    <span className="text-sm font-medium text-white/60">{form.published ? 'Publik' : 'Draft'}</span>
                  </label>
                </div>

                {view === 'new' && (
                  <div className="bg-[#111113] border border-white/[0.07] rounded-[16px] p-4">
                    <p className="text-xs text-white/30">URL artikel: /blog/<span className="text-white/60 font-mono">{slugify(form.title) || '...'}</span></p>
                  </div>
                )}

                <button onClick={handleSave}
                  className="w-full bg-[#D90429] text-white py-3 rounded-[12px] font-semibold hover:bg-[#B0021F] transition-colors">
                  {view === 'new' ? 'Terbitkan Artikel' : 'Simpan Perubahan'}
                </button>
                <button onClick={() => setView('list')}
                  className="w-full border border-white/[0.10] text-white/50 py-2.5 rounded-[12px] text-sm hover:border-white/20 transition-colors">
                  Batal
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
