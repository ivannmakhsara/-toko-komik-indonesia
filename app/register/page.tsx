'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');

  const googleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setGoogleLoading(true);
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const info = await res.json();
        loginWithGoogle(info.email, info.name ?? info.email.split('@')[0], role);
        router.push(role === 'seller' ? '/seller' : '/');
      } catch {
        setError('Gagal mendapatkan info akun Google');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => setError('Pendaftaran Google dibatalkan atau gagal'),
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Nama wajib diisi'); return; }
    if (!form.email.includes('@')) { setError('Email tidak valid'); return; }
    if (form.password.length < 6) { setError('Password minimal 6 karakter'); return; }
    if (form.password !== form.confirm) { setError('Password tidak sama'); return; }
    setLoading(true);
    const { error: err, needsVerification } = await register(form.name, form.email, form.password, role);
    setLoading(false);
    if (err) { setError(err); return; }
    if (needsVerification) { setVerifyEmail(form.email); setVerified(true); }
    else router.push(role === 'seller' ? '/seller' : '/');
  }

  const inputCls = 'w-full bg-white/[0.05] border border-white/[0.10] rounded-[12px] px-4 py-3 text-sm text-white/80 placeholder-white/22 focus:outline-none focus:border-white/25 transition-colors';

  if (verified) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center bg-[#111113] border border-white/[0.07] rounded-[24px] p-10">
          <p className="text-5xl mb-4">📧</p>
          <h1 className="font-display text-xl font-bold text-[#F2F2F0] mb-2">Cek Email Kamu!</h1>
          <p className="text-white/40 text-sm mb-1">Kami kirim link verifikasi ke:</p>
          <p className="font-semibold text-[#D90429] mb-4">{verifyEmail}</p>
          <p className="text-white/30 text-sm mb-6">Klik link di email tersebut untuk mengaktifkan akun, lalu kamu bisa masuk.</p>
          <Link href="/login"
            className="inline-block bg-[#D90429] text-white px-6 py-3 rounded-[12px] hover:bg-[#B0021F] transition-colors font-semibold text-sm">
            Ke Halaman Masuk
          </Link>
          <p className="text-xs text-white/20 mt-4">Tidak dapat email? Cek folder Spam.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-3xl mb-2">📚</p>
          <h1 className="font-display text-2xl font-bold text-[#F2F2F0]">Buat Akun Baru</h1>
          <p className="text-white/35 text-sm mt-1">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-[#D90429] hover:text-[#FF1A3E] transition-colors">Masuk</Link>
          </p>
        </div>

        <div className="bg-[#111113] border border-white/[0.07] rounded-[24px] p-8">
          {/* Pilih role */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-white/55 mb-3">Daftar sebagai</p>
            <div className="grid grid-cols-2 gap-3">
              {(['buyer', 'seller'] as const).map(r => (
                <button key={r} type="button" onClick={() => { setRole(r); setError(''); }}
                  className={`flex items-center gap-3 border-2 rounded-[14px] p-3 cursor-pointer transition-all text-left ${
                    role === r
                      ? 'border-[#D90429] bg-[#D90429]/10'
                      : 'border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15]'
                  }`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    role === r ? 'border-[#D90429]' : 'border-white/20'
                  }`}>
                    {role === r && <div className="w-2 h-2 rounded-full bg-[#D90429]" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/80">{r === 'buyer' ? '🛍️ Pembeli' : '🏪 Seller'}</p>
                    <p className="text-xs text-white/35">{r === 'buyer' ? 'Belanja komik' : 'Jual komik'}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Google */}
          <button
            onClick={() => { setError(''); googleSignup(); }}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-white/[0.10] bg-white/[0.03] rounded-[12px] py-3 hover:bg-white/[0.06] transition-colors mb-6 disabled:opacity-50">
            {googleLoading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
              : (
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
                </svg>
              )}
            <span className="text-sm font-medium text-white/65">
              {googleLoading ? 'Memproses...' : `Daftar sebagai ${role === 'seller' ? 'Seller' : 'Pembeli'} dengan Google`}
            </span>
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-xs text-white/25">atau daftar manual</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-white/55 mb-1">Nama Lengkap</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Budi Santoso" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/55 mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@contoh.com" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/55 mb-1">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 6 karakter" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/55 mb-1">Konfirmasi Password</label>
              <input name="confirm" type="password" value={form.confirm} onChange={handleChange} placeholder="Ulangi password" className={inputCls} />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-[10px]">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-[#D90429] text-white py-3 rounded-[12px] hover:bg-[#B0021F] transition-colors font-semibold disabled:opacity-60 mt-1">
              {loading ? 'Mendaftarkan...' : `Buat Akun ${role === 'seller' ? 'Seller' : 'Pembeli'}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
