'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function MobileBottomNav() {
  const pathname   = usePathname();
  const { totalItems } = useCart();
  const { user }   = useAuth();

  // Hide on seller pages, auth pages, and product detail pages (which have their own buy bar)
  if (
    pathname.startsWith('/seller') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/products/')
  ) return null;

  const NAV = [
    {
      label: 'Beranda',
      href: '/',
      active: pathname === '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: 'Jelajahi',
      href: '/#produk',
      active: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: 'Keranjang',
      href: '/cart',
      active: pathname === '/cart',
      badge: totalItems,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round"/>
          <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: 'Profil',
      href: user ? '/profile' : '/login',
      active: pathname.startsWith('/profile') || pathname.startsWith('/login'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0D0D0F]/95 backdrop-blur-xl border-t border-white/[0.06]">
      <div className="flex items-stretch h-16">
        {NAV.map(item => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors ${
              item.active ? 'text-[#D90429]' : 'text-white/40 active:text-white/70'
            }`}
          >
            <span className="relative">
              {item.icon}
              {item.badge != null && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#D90429] text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5 leading-none">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </span>
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
            {item.active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#D90429] rounded-full" />
            )}
          </Link>
        ))}
      </div>
      {/* Safe area for devices with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
