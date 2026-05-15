'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Comic } from '@/lib/types';

interface WishlistCtx {
  wishlist: Comic[];
  addToWishlist:    (comic: Comic) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist:     (id: string) => boolean;
}

const WishlistContext = createContext<WishlistCtx>({
  wishlist: [],
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  isInWishlist: () => false,
});

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Comic[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('tki-wishlist') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('tki-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (comic: Comic) =>
    setWishlist(prev => prev.some(c => c.id === comic.id) ? prev : [...prev, comic]);

  const removeFromWishlist = (id: string) =>
    setWishlist(prev => prev.filter(c => c.id !== id));

  const isInWishlist = (id: string) => wishlist.some(c => c.id === id);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() { return useContext(WishlistContext); }
