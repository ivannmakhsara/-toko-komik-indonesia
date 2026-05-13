'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Comic } from '@/lib/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (comic: Comic) => void;
  removeFromCart: (comicId: string) => void;
  updateQuantity: (comicId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('toko-komik-cart');
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('toko-komik-cart', JSON.stringify(items));
  }, [items]);

  function addToCart(comic: Comic) {
    setItems(prev => {
      const existing = prev.find(item => item.comic.id === comic.id);
      if (existing) {
        return prev.map(item =>
          item.comic.id === comic.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { comic, quantity: 1 }];
    });
  }

  function removeFromCart(comicId: string) {
    setItems(prev => prev.filter(item => item.comic.id !== comicId));
  }

  function updateQuantity(comicId: string, quantity: number) {
    if (quantity < 1) return removeFromCart(comicId);
    setItems(prev =>
      prev.map(item =>
        item.comic.id === comicId ? { ...item, quantity } : item
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.comic.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
