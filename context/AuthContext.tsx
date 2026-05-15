'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SbUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller';
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login:           (email: string, password: string) => Promise<string | null>;
  register:        (name: string, email: string, password: string, role: 'buyer' | 'seller') => Promise<{ error: string | null; needsVerification: boolean }>;
  loginWithGoogle: (email: string, name: string, role?: 'buyer' | 'seller') => void;
  logout:          () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

function fromSbUser(u: SbUser): User {
  return {
    id:    u.id,
    name:  u.user_metadata?.name ?? u.email?.split('@')[0] ?? 'User',
    email: u.email ?? '',
    role:  u.user_metadata?.role ?? 'buyer',
  };
}

function getLocalUser(): User | null {
  try {
    const s = localStorage.getItem('toko-session');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(fromSbUser(session.user));
      } else {
        setUser(getLocalUser());
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const next = session?.user ? fromSbUser(session.user) : getLocalUser();
      setUser(prev => {
        if (prev === next) return prev;
        if (prev && next &&
            prev.id === next.id && prev.name === next.name &&
            prev.email === next.email && prev.role === next.role) return prev;
        return next;
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) return null;
    if (error.message.includes('Email not confirmed')) return 'Cek email kamu untuk verifikasi terlebih dahulu';
    if (error.message.includes('Invalid login credentials')) return 'Email atau password salah';
    return error.message;
  }

  async function register(
    name: string, email: string, password: string, role: 'buyer' | 'seller'
  ): Promise<{ error: string | null; needsVerification: boolean }> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      const msg = error.message.includes('already registered')
        ? 'Email sudah terdaftar'
        : error.message;
      return { error: msg, needsVerification: false };
    }
    return { error: null, needsVerification: true };
  }

  /* Google login — tetap pakai localStorage sampai Supabase OAuth dikonfigurasi */
  function loginWithGoogle(email: string, name: string, role: 'buyer' | 'seller' = 'buyer'): void {
    const stored = JSON.parse(localStorage.getItem('toko-users') || '[]');
    let found = stored.find((u: { email: string }) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      found = { id: `user-${Date.now()}`, name, email, password: '', role };
      localStorage.setItem('toko-users', JSON.stringify([...stored, found]));
    }
    const { password: _p, ...u } = found;
    localStorage.setItem('toko-session', JSON.stringify(u));
    setUser(u);
  }

  async function logout(): Promise<void> {
    await supabase.auth.signOut();
    localStorage.removeItem('toko-session');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
