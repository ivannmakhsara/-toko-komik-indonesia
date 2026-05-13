'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();

  return (
    <nav className="bg-red-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:text-red-200 transition-colors">
          <span className="text-2xl">📚</span>
          <span className="hidden sm:block">Toko Komik Indonesia</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-red-200 transition-colors text-sm font-medium hidden sm:block">
            Beranda
          </Link>

          {user?.role === 'seller' && (
            <Link href="/seller" className="hover:text-red-200 transition-colors text-sm font-medium bg-red-800 px-3 py-1 rounded-lg">
              Seller
            </Link>
          )}

          {/* Notification bell */}
          {user && <NotificationBell />}

          {/* Cart */}
          <Link href="/cart" className="relative flex items-center hover:text-red-200 transition-colors">
            <ShoppingCartIcon className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/profile" className="flex items-center gap-2 hover:text-red-200 transition-colors">
                <div className="w-8 h-8 bg-red-600 border-2 border-red-300 rounded-full flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">{user.name}</span>
              </Link>
              <button onClick={logout} className="text-xs text-red-300 hover:text-white transition-colors px-2 py-1 rounded hover:bg-red-800">
                Keluar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm hover:text-red-200 transition-colors">Masuk</Link>
              <Link href="/register" className="text-sm bg-white text-red-700 font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors">
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
