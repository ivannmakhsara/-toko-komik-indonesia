'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [showGoogle, setShowGoogle] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Isi semua field'); return; }
    setLoading(true);
    const err = login(form.email, form.password);
    setLoading(false);
    if (err) { setError(err); return; }
    router.push('/');
  }

  function handleGoogleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!googleEmail.includes('@')) { setError('Masukkan email yang valid'); return; }
    loginWithGoogle(googleEmail);
    router.push('/');
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-3xl mb-2">📚</p>
          <h1 className="text-2xl font-bold text-gray-800">Masuk ke Toko Komik</h1>
          <p className="text-gray-400 text-sm mt-1">Belum punya akun? <Link href="/register" className="text-red-700 hover:underline">Daftar</Link></p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Google login */}
          {!showGoogle ? (
            <button
              onClick={() => setShowGoogle(true)}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 hover:bg-gray-50 transition-colors mb-6"
            >
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
              <span className="text-sm font-medium text-gray-700">Lanjutkan dengan Google</span>
            </button>
          ) : (
            <form onSubmit={handleGoogleLogin} className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Masukkan email Google kamu</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={googleEmail}
                  onChange={e => setGoogleEmail(e.target.value)}
                  placeholder="nama@gmail.com"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  autoFocus
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                  Masuk
                </button>
              </div>
              <button type="button" onClick={() => setShowGoogle(false)} className="text-xs text-gray-400 mt-2 hover:text-gray-600">
                Batal
              </button>
            </form>
          )}

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">atau</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="email@contoh.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400" />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-red-700 text-white py-3 rounded-xl hover:bg-red-800 transition-colors font-medium disabled:opacity-60 mt-2">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
