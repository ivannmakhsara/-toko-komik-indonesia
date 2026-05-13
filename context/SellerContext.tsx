'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Comic } from '@/lib/types';
import { comics as staticComics } from '@/lib/data';

interface SellerContextType {
  sellerProducts: Comic[];
  allProducts: Comic[];
  addProduct: (product: Omit<Comic, 'id'>) => void;
  updateProduct: (id: string, product: Omit<Comic, 'id'>) => void;
  deleteProduct: (id: string) => void;
}

const SellerContext = createContext<SellerContextType | null>(null);

export function SellerProvider({ children }: { children: React.ReactNode }) {
  const [sellerProducts, setSellerProducts] = useState<Comic[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('seller-products');
    if (saved) setSellerProducts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('seller-products', JSON.stringify(sellerProducts));
  }, [sellerProducts]);

  function addProduct(product: Omit<Comic, 'id'>) {
    const newProduct: Comic = { ...product, id: `seller-${Date.now()}` };
    setSellerProducts(prev => [newProduct, ...prev]);
  }

  function updateProduct(id: string, product: Omit<Comic, 'id'>) {
    setSellerProducts(prev => prev.map(p => p.id === id ? { ...product, id } : p));
  }

  function deleteProduct(id: string) {
    setSellerProducts(prev => prev.filter(p => p.id !== id));
  }

  const allProducts = [...sellerProducts, ...staticComics];

  return (
    <SellerContext.Provider value={{ sellerProducts, allProducts, addProduct, updateProduct, deleteProduct }}>
      {children}
    </SellerContext.Provider>
  );
}

export function useSeller() {
  const ctx = useContext(SellerContext);
  if (!ctx) throw new Error('useSeller must be used inside SellerProvider');
  return ctx;
}
