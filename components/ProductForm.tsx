'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Comic } from '@/lib/types';
import { genres } from '@/lib/data';

const PRESET_COLORS = [
  '#1a1a2e', '#7f1d1d', '#064e3b', '#1c1917',
  '#4c1d95', '#78350f', '#0c4a6e', '#1e3a5f',
  '#365314', '#3b0764', '#881337', '#134e4a',
];

const CONDITIONS = ['Baru', 'Bekas Mulus', 'Bekas'];

function randomColor() {
  return PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
}

const MAX_PREVIEW = 4;

type FormData = Omit<Comic, 'id'>;

interface Props {
  initial?: FormData;
  onSubmit: (data: FormData) => void;
  submitLabel: string;
}

const EMPTY: FormData = {
  title: '', author: '', genre: 'Aksi',
  price: 0, color: randomColor(), coverImage: undefined,
  previewImages: [], description: '', year: new Date().getFullYear(), pages: 0,
  condition: 'Baru', weight: 300, minBuy: 1, preorderDays: undefined,
};

export default function ProductForm({ initial = EMPTY, onSubmit, submitLabel }: Props) {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const previewInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [rightTab, setRightTab] = useState<'cover' | 'preview'>('cover');
  const [dragOver, setDragOver] = useState(false);
  const [isPreorder, setIsPreorder] = useState(!!initial?.preorderDays);

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.title.trim()) e.title = 'Judul wajib diisi';
    if (form.price <= 0) e.price = 'Harga harus lebih dari 0';
    if (!form.description.trim()) e.description = 'Deskripsi wajib diisi';
    if (form.year < 1900 || form.year > new Date().getFullYear()) e.year = 'Tahun tidak valid';
    if ((form.pages ?? 0) <= 0) e.pages = 'Jumlah halaman harus lebih dari 0';
    if ((form.weight ?? 0) <= 0) e.weight = 'Berat harus lebih dari 0';
    if ((form.minBuy ?? 1) < 1) e.minBuy = 'Min. beli minimal 1';
    if (isPreorder && !form.preorderDays) e.preorderDays = 'Isi estimasi hari preorder';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: ['price','year','pages','weight','minBuy','preorderDays'].includes(name) ? Number(value) : value,
    }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  function readFile(file: File, maxMB: number, onLoad: (data: string) => void) {
    if (!file.type.startsWith('image/')) return;
    if (file.size > maxMB * 1024 * 1024) { alert(`Ukuran gambar maksimal ${maxMB} MB`); return; }
    const reader = new FileReader();
    reader.onload = () => onLoad(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleCoverInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) readFile(file, 5, data => setForm(prev => ({ ...prev, coverImage: data })));
    e.target.value = '';
  }

  function handleCoverDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file, 5, data => setForm(prev => ({ ...prev, coverImage: data })));
  }

  function handlePreviewInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    const remaining = MAX_PREVIEW - (form.previewImages ?? []).length;
    files.slice(0, remaining).forEach(file => {
      readFile(file, 3, data => setForm(prev => ({
        ...prev, previewImages: [...(prev.previewImages ?? []), data],
      })));
    });
  }

  function removePreviewImage(index: number) {
    setForm(prev => ({ ...prev, previewImages: (prev.previewImages ?? []).filter((_, i) => i !== index) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, preorderDays: isPreorder ? form.preorderDays : undefined });
  }

  const previewImages = form.previewImages ?? [];
  const canAddMore = previewImages.length < MAX_PREVIEW;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Left: Form fields ── */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Informasi Produk */}
          <div className="bg-[#111113] border border-white/[0.07] rounded-[16px] p-6">
            <h2 className="font-semibold text-white/40 mb-4 text-[11px] uppercase tracking-widest">Informasi Produk</h2>
            <div className="flex flex-col gap-4">
              <Field label="Judul Komik" error={errors.title}>
                <input name="title" value={form.title} onChange={handleChange}
                  placeholder="Contoh: Gundala Vol. 2" className={inp(errors.title)} />
              </Field>
              <Field label="Deskripsi" error={errors.description}>
                <textarea name="description" value={form.description} onChange={handleChange}
                  rows={4} placeholder="Sinopsis, nama pengarang/penggambar, dan info penting lainnya..."
                  className={`${inp(errors.description)} resize-none`} />
              </Field>
            </div>
          </div>

          {/* Detail Produk */}
          <div className="bg-[#111113] border border-white/[0.07] rounded-[16px] p-6">
            <h2 className="font-semibold text-white/40 mb-4 text-[11px] uppercase tracking-widest">Detail Produk</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Genre" error={errors.genre}>
                <select name="genre" value={form.genre} onChange={handleChange} className={inp()}>
                  {genres.filter(g => g !== 'Semua').map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </Field>
              <Field label="Kondisi" error={errors.condition}>
                <select name="condition" value={form.condition ?? 'Baru'} onChange={handleChange} className={inp()}>
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Harga (Rp)" error={errors.price}>
                <input type="number" name="price" value={form.price || ''} onChange={handleChange}
                  placeholder="25000" min={0} className={inp(errors.price)} />
              </Field>
              <Field label="Tahun Terbit" error={errors.year}>
                <input type="number" name="year" value={form.year || ''} onChange={handleChange}
                  placeholder="2024" min={1900} max={new Date().getFullYear()} className={inp(errors.year)} />
              </Field>
              <Field label="Jumlah Halaman" error={errors.pages}>
                <input type="number" name="pages" value={form.pages || ''} onChange={handleChange}
                  placeholder="100" min={1} className={inp(errors.pages)} />
              </Field>
              <Field label="Berat Satuan (gram)" error={errors.weight}>
                <input type="number" name="weight" value={form.weight || ''} onChange={handleChange}
                  placeholder="300" min={1} className={inp(errors.weight)} />
              </Field>
              <Field label="Min. Pembelian (eksemplar)" error={errors.minBuy}>
                <input type="number" name="minBuy" value={form.minBuy ?? 1} onChange={handleChange}
                  placeholder="1" min={1} className={inp(errors.minBuy)} />
              </Field>
            </div>

            {/* Preorder toggle */}
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => { setIsPreorder(v => !v); setErrors(p => ({ ...p, preorderDays: undefined })); }}
                  className={`relative w-10 h-5 rounded-full transition-colors ${isPreorder ? 'bg-[#D90429]' : 'bg-white/[0.12]'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isPreorder ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-sm font-medium text-white/60">Produk Preorder</span>
                {isPreorder && <span className="text-[11px] bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full">PO</span>}
              </label>
              {isPreorder && (
                <div className="mt-3">
                  <Field label="Estimasi Pengiriman (hari setelah pembayaran)" error={errors.preorderDays}>
                    <input type="number" name="preorderDays" value={form.preorderDays || ''} onChange={handleChange}
                      placeholder="14" min={1} max={90} className={inp(errors.preorderDays)} />
                  </Field>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Cover / Preview images ── */}
        <div className="lg:w-80 flex flex-col gap-4">
          <div className="bg-[#111113] border border-white/[0.07] rounded-[16px] overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/[0.07]">
              {(['cover', 'preview'] as const).map(tab => (
                <button key={tab} type="button" onClick={() => setRightTab(tab)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    rightTab === tab ? 'text-[#D90429] border-b-2 border-[#D90429]' : 'text-white/35 hover:text-white/60'
                  }`}>
                  {tab === 'cover' ? '🖼️ Cover' : '📄 Preview'}
                </button>
              ))}
            </div>

            {/* Cover tab */}
            {rightTab === 'cover' && (
              <div className="p-5">
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverInput} />
                <div
                  onClick={() => coverInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleCoverDrop}
                  className={`relative w-full aspect-[3/4] rounded-[12px] overflow-hidden cursor-pointer border-2 border-dashed transition-colors mb-4 ${
                    dragOver ? 'border-[#D90429] bg-[#D90429]/10' : 'border-white/[0.12] hover:border-white/25'
                  }`}
                >
                  {form.coverImage ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.coverImage} alt="Cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <span className="text-white text-3xl">🔄</span>
                        <p className="text-white text-xs font-medium">Ganti Gambar</p>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4"
                      style={{ background: `linear-gradient(135deg, ${form.color}, ${form.color}99)` }}>
                      <span className="text-5xl">📤</span>
                      <p className="text-white text-sm font-medium text-center">Klik atau drag & drop</p>
                      <p className="text-white/60 text-xs">PNG, JPG, WEBP · Maks 5 MB</p>
                    </div>
                  )}
                </div>
                {form.coverImage && (
                  <button type="button"
                    onClick={() => setForm(prev => ({ ...prev, coverImage: undefined }))}
                    className="w-full text-xs text-[#D90429]/60 hover:text-[#D90429] py-1 transition-colors">
                    ✕ Hapus gambar
                  </button>
                )}
              </div>
            )}

            {/* Preview tab */}
            {rightTab === 'preview' && (
              <div className="p-5">
                <p className="text-xs text-white/40 mb-1">Upload 2–4 foto halaman isi komik</p>
                <p className="text-xs text-white/20 mb-4">PNG, JPG, WEBP · Maks 3 MB per gambar</p>
                <input ref={previewInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePreviewInput} />
                <div className="grid grid-cols-2 gap-3">
                  {previewImages.map((src, i) => (
                    <div key={i} className="relative aspect-[3/4] rounded-[10px] overflow-hidden border border-white/[0.10]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removePreviewImage(i)}
                        className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors">✕</button>
                      <span className="absolute bottom-1.5 left-1.5 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">Hal. {i + 1}</span>
                    </div>
                  ))}
                  {canAddMore && (
                    <button type="button" onClick={() => previewInputRef.current?.click()}
                      className="aspect-[3/4] rounded-[10px] border-2 border-dashed border-white/[0.12] hover:border-[#D90429]/50 flex flex-col items-center justify-center gap-2 transition-colors">
                      <span className="text-2xl text-white/25">+</span>
                      <span className="text-xs text-white/25">{previewImages.length === 0 ? 'Upload gambar' : 'Tambah lagi'}</span>
                      <span className="text-xs text-white/15">{previewImages.length}/{MAX_PREVIEW}</span>
                    </button>
                  )}
                </div>
                {previewImages.length === MAX_PREVIEW && (
                  <p className="text-xs text-center text-white/30 mt-3">Maksimal {MAX_PREVIEW} gambar tercapai</p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-[#111113] border border-white/[0.07] rounded-[16px] p-5 flex flex-col gap-3">
            <div className="flex justify-between text-xs text-white/30 pb-3 border-b border-white/[0.06]">
              <span>Cover: {form.coverImage ? '✅ Diunggah' : '🎨 Warna'}</span>
              <span>Preview: {previewImages.length}/{MAX_PREVIEW}</span>
            </div>
            <button type="submit"
              className="w-full bg-[#D90429] text-white py-3 rounded-[12px] hover:bg-[#B0021F] transition-colors font-medium">
              {submitLabel}
            </button>
            <button type="button" onClick={() => router.push('/seller/products')}
              className="w-full border border-white/[0.10] text-white/50 py-2.5 rounded-[12px] hover:border-white/20 hover:text-white/70 transition-colors text-sm">
              Batal
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function inp(error?: string) {
  return `w-full bg-white/[0.05] border rounded-[10px] px-3 py-2 text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-white/25 ${
    error ? 'border-[#D90429]/60' : 'border-white/[0.10]'
  }`;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/50 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-[#D90429] mt-1">{error}</p>}
    </div>
  );
}
