'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'buyer' | 'seller';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller';
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => string | null;
  loginWithGoogle: (email: string, role?: 'buyer' | 'seller') => void;
  register: (name: string, email: string, password: string, role: 'buyer' | 'seller') => string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

function getStoredUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem('toko-users') || '[]'); } catch { return []; }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const s = localStorage.getItem('toko-session');
      if (s) setUser(JSON.parse(s));
    } finally {
      setLoading(false);
    }
  }, []);

  function startSession(u: User) {
    localStorage.setItem('toko-session', JSON.stringify(u));
    setUser(u);
  }

  function login(email: string, password: string): string | null {
    const found = getStoredUsers().find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return 'Email atau password salah';
    const { password: _p, ...u } = found;
    startSession(u);
    return null;
  }

  function loginWithGoogle(email: string, role: 'buyer' | 'seller' = 'buyer'): void {
    const users = getStoredUsers();
    let found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      const name = email.split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      found = { id: `user-${Date.now()}`, name, email, password: '', role };
      localStorage.setItem('toko-users', JSON.stringify([...users, found]));
    }
    const { password: _p, ...u } = found;
    startSession(u);
  }

  function register(name: string, email: string, password: string, role: 'buyer' | 'seller'): string | null {
    const users = getStoredUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) return 'Email sudah terdaftar';
    const newUser: StoredUser = { id: `user-${Date.now()}`, name, email, password, role };
    localStorage.setItem('toko-users', JSON.stringify([...users, newUser]));
    const { password: _p, ...u } = newUser;
    startSession(u);
    return null;
  }

  function logout() {
    localStorage.removeItem('toko-session');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
