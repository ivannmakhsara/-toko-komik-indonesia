'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { getOrders } from '@/lib/orders';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
  exactExcludeAdd?: boolean;
  badge?: 'orders' | 'chat';
}

const NAV: { group?: string; items: NavItem[] }[] = [
  {
    items: [{ href: '/seller', label: 'Dashboard', icon: '🏠', exact: true }],
  },
  {
    group: 'Kelola Toko',
    items: [
      { href: '/seller/products',     label: 'Daftar Produk',  icon: '📚', exactExcludeAdd: true },
      { href: '/seller/products/add', label: 'Tambah Produk',  icon: '➕', exact: true },
      { href: '/seller/orders',       label: 'Pesanan',        icon: '📬', badge: 'orders' },
      { href: '/seller/chat',         label: 'Chat',           icon: '💬', badge: 'chat'   },
    ],
  },
];

export default function SellerShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { unreadForSeller } = useChat();
  const router = useRouter();
  const pathname = usePathname();
  const [newOrders,    setNewOrders]    = useState(0);
  const [collapsed,    setCollapsed]    = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    getOrders().then(orders => setNewOrders(orders.filter(o => o.status === 'Pesanan Masuk').length));
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0A0A0B] text-white/30">
        Memuat...
      </div>
    );
  }

  if (!user) return null;

  if (user.role !== 'seller') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0A0A0B] gap-4 text-center px-4">
        <p className="text-4xl">🔒</p>
        <h2 className="text-xl font-bold text-white/80">Akses Ditolak</h2>
        <p className="text-white/40 text-sm">Halaman ini hanya untuk akun Seller.</p>
        <Link href="/register"
          className="bg-[#D90429] text-white px-6 py-2 rounded-xl hover:bg-[#B0021F] transition-colors text-sm font-medium">
          Daftar sebagai Seller
        </Link>
      </div>
    );
  }

  const badgeVal = (badge?: 'orders' | 'chat') =>
    badge === 'orders' ? newOrders : badge === 'chat' ? unreadForSeller : 0;

  const hasActivity = newOrders > 0 || unreadForSeller > 0;

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex bg-[#0A0A0B]">

      {/* ── Mobile overlay backdrop ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`bg-[#0D0D0F] border-r border-white/[0.05] text-white flex flex-col shrink-0 transition-all duration-200
        fixed md:relative inset-y-0 left-0 z-30
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${collapsed ? 'w-14' : 'w-56'}`}>

        {/* Store info */}
        <div className={`border-b border-white/[0.05] ${collapsed ? 'px-2 py-4' : 'px-4 py-4'}`}>
          {collapsed ? (
            <div className="w-10 h-10 bg-[#D90429] rounded-full flex items-center justify-center font-bold text-sm mx-auto">
              {user.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#D90429] rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-white truncate leading-tight">{user.name}</p>
                  <span className="text-[10px] text-white/40 bg-white/[0.06] px-1.5 py-0.5 rounded-full">
                    Seller Reguler
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-white/30 truncate">{user.email}</p>
            </>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {NAV.map((section, si) => (
            <div key={si} className={si > 0 ? 'mt-4' : ''}>
              {section.group && !collapsed && (
                <p className="text-[10px] text-white/25 uppercase tracking-widest px-2 mb-1.5 font-semibold">
                  {section.group}
                </p>
              )}
              {section.items.map(item => {
                const active = item.exact
                  ? pathname === item.href
                  : item.exactExcludeAdd
                    ? pathname.startsWith(item.href) && pathname !== '/seller/products/add'
                    : pathname.startsWith(item.href);
                const badge = badgeVal(item.badge);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-2.5 px-2 py-2 rounded-[10px] text-sm transition-colors mb-0.5 ${
                      collapsed ? 'justify-center' : 'justify-between'
                    } ${active ? 'bg-[#D90429] text-white' : 'text-white/45 hover:bg-white/[0.05] hover:text-white/80'}`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-base leading-none">{item.icon}</span>
                      {!collapsed && <span>{item.label}</span>}
                    </span>
                    {!collapsed && badge > 0 && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                        item.badge === 'chat' ? 'bg-yellow-400 text-gray-900' : 'bg-orange-500 text-white'
                      }`}>
                        {badge}
                      </span>
                    )}
                    {collapsed && badge > 0 && (
                      <span className="absolute ml-5 -mt-5 bg-[#D90429] text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={`border-t border-white/[0.05] ${collapsed ? 'p-2' : 'p-3'}`}>
          <button
            onClick={() => setCollapsed(v => !v)}
            className="w-full flex items-center gap-2 text-xs text-white/30 hover:text-white/70 transition-colors px-2 py-1.5 rounded-[10px] hover:bg-white/[0.05]"
            title={collapsed ? 'Tampilkan Menu' : 'Sembunyikan Menu'}
          >
            <span>{collapsed ? '→' : '←'}</span>
            {!collapsed && <span>Sembunyikan Menu</span>}
          </button>
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2 text-xs text-white/25 hover:text-white/60 transition-colors px-2 py-1.5 rounded-[10px] hover:bg-white/[0.05] mt-1">
              <span>🏪</span>
              <span>Kembali ke Toko</span>
            </Link>
          )}
        </div>
      </aside>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#0D0D0F] border-b border-white/[0.05] shrink-0">
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-white/[0.06] rounded-[10px] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#D90429] rounded-[6px] flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-3.5 h-3.5" fill="white"><path d="M16 6C16 6 9 4 4 6v18c5-2 12 0 12 0s7-2 12 0V6c-5-2-12 0-12 0z"/></svg>
            </div>
            <span className="font-display font-bold text-white/80 text-[13px]">Dashboard Seller</span>
          </div>
          {hasActivity && (
            <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 shrink-0" />
          )}
        </div>

        {/* Notification bar */}
        {hasActivity && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2.5 flex items-center gap-3 shrink-0">
            <span className="text-amber-400 text-sm">🔔</span>
            <div className="flex items-center gap-4 text-sm text-amber-300 font-medium">
              {newOrders > 0 && (
                <Link href="/seller/orders" className="hover:underline">
                  {newOrders} pesanan baru menunggu
                </Link>
              )}
              {newOrders > 0 && unreadForSeller > 0 && <span className="text-amber-500/50">·</span>}
              {unreadForSeller > 0 && (
                <Link href="/seller/chat" className="hover:underline">
                  {unreadForSeller} pesan belum dibaca
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 bg-[#0D0D0F] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
