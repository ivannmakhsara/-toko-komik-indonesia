'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  return (
    <nav className="bg-red-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">

        {/* Logo */}
        <Link href="/" onClick={close}
          className="flex items-center gap-2 font-bold text-xl tracking-tight hover:text-red-200 transition-colors shrink-0">
          <span className="text-2xl">📚</span>
          <span className="hidden sm:block">Toko Komik Indonesia</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">

          {/* Beranda — desktop only */}
          <Link href="/" className="hidden md:block hover:text-red-200 transition-colors text-sm font-medium">
            Beranda
          </Link>

          {/* Seller badge — desktop only */}
          {user?.role === 'seller' && (
            <Link href="/seller"
              className="hidden sm:block hover:text-red-200 transition-colors text-sm font-medium bg-red-800 px-3 py-1 rounded-lg">
              Seller
            </Link>
          )}

          {/* Notification bell — desktop */}
          {user && <span className="hidden sm:block"><NotificationBell /></span>}

          {/* Cart */}
          <Link href="/cart" onClick={close} className="relative flex items-center hover:text-red-200 transition-colors">
            <ShoppingCartIcon className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>

          {/* Auth — desktop */}
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/profile" className="flex items-center gap-2 hover:text-red-200 transition-colors">
                <div className="w-8 h-8 bg-red-600 border-2 border-red-300 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden md:block max-w-[100px] truncate">{user.name}</span>
              </Link>
              <button onClick={logout}
                className="text-xs text-red-300 hover:text-white transition-colors px-2 py-1 rounded hover:bg-red-800">
                Keluar
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login" className="text-sm hover:text-red-200 transition-colors">Masuk</Link>
              <Link href="/register"
                className="text-sm bg-white text-red-700 font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors">
                Daftar
              </Link>
            </div>
          )}

          {/* Hamburger — mobile only */}
          <button onClick={() => setMenuOpen(v => !v)}
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl hover:bg-red-600 transition-colors">
            {menuOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="sm:hidden bg-red-800 border-t border-red-600 px-4 py-3 space-y-1 shadow-xl">
          {user ? (
            <>
              {/* Profile row */}
              <Link href="/profile" onClick={close}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-700 transition-colors">
                <div className="w-10 h-10 bg-red-600 border-2 border-red-400 rounded-full flex items-center justify-center font-bold shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{user.name}</p>
                  <p className="text-xs text-red-300 truncate">{user.email}</p>
                </div>
              </Link>

              <div className="border-t border-red-700 pt-1" />

              <Link href="/" onClick={close}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-700 transition-colors text-sm font-medium">
                🏠 Beranda
              </Link>

              <Link href="/cart" onClick={close}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-700 transition-colors text-sm font-medium">
                🛒 Keranjang{totalItems > 0 ? ` (${totalItems})` : ''}
              </Link>

              {user.role === 'seller' && (
                <Link href="/seller" onClick={close}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-700 transition-colors text-sm font-medium">
                  🏪 Dashboard Seller
                </Link>
              )}

              <div className="border-t border-red-700 pt-1" />

              <button onClick={() => { logout(); close(); }}
                className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-900 transition-colors text-sm text-red-300 hover:text-white">
                🚪 Keluar
              </button>
            </>
          ) : (
            <>
              <Link href="/" onClick={close}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-700 transition-colors text-sm font-medium">
                🏠 Beranda
              </Link>
              <div className="border-t border-red-700 pt-1" />
              <Link href="/login" onClick={close}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-700 transition-colors text-sm font-medium">
                🔐 Masuk
              </Link>
              <Link href="/register" onClick={close}
                className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-white text-red-700 font-bold text-sm hover:bg-red-50 transition-colors">
                ✨ Daftar Sekarang
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
