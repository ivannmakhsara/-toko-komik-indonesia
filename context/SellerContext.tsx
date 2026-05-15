'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Comic } from '@/lib/types';
import { comics as staticComics } from '@/lib/data';
import { useAuth } from './AuthContext';

const GLOBAL_KEY = 'all-seller-products';

interface SellerContextType {
  sellerProducts: Comic[];
  allProducts: Comic[];
  addProduct:    (product: Omit<Comic, 'id' | 'sellerId' | 'sellerName'>) => void;
  updateProduct: (id: string, product: Omit<Comic, 'id' | 'sellerId' | 'sellerName'>) => void;
  deleteProduct: (id: string) => void;
}

const SellerContext = createContext<SellerContextType | null>(null);

export function SellerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [globalProducts, setGlobalProducts] = useState<Comic[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(GLOBAL_KEY);
      if (raw) setGlobalProducts(JSON.parse(raw));

      /* migrate old single-seller products */
      const old = localStorage.getItem('seller-products');
      if (old) {
        const parsed: Comic[] = JSON.parse(old);
        if (parsed.length > 0 && !parsed[0].sellerId) {
          const session = localStorage.getItem('toko-session');
          const u = session ? JSON.parse(session) : null;
          const migrated = parsed.map(p => ({
            ...p,
            sellerId:   u?.id   ?? 'legacy',
            sellerName: u?.name ?? 'Toko Lama',
          }));
          localStorage.setItem(GLOBAL_KEY, JSON.stringify(migrated));
          localStorage.removeItem('seller-products');
          setGlobalProducts(migrated);
        }
      }
    } catch { /* ignore parse errors */ }
  }, []);

  function save(products: Comic[]) {
    setGlobalProducts(products);
    localStorage.setItem(GLOBAL_KEY, JSON.stringify(products));
  }

  function addProduct(product: Omit<Comic, 'id' | 'sellerId' | 'sellerName'>) {
    if (!user) return;
    const newProduct: Comic = {
      ...product,
      id:         `seller-${Date.now()}`,
      sellerId:   user.id,
      sellerName: user.name,
    };
    save([newProduct, ...globalProducts]);
  }

  function updateProduct(id: string, product: Omit<Comic, 'id' | 'sellerId' | 'sellerName'>) {
    if (!user) return;
    save(globalProducts.map(p =>
      p.id === id
        ? { ...product, id, sellerId: p.sellerId, sellerName: p.sellerName }
        : p
    ));
  }

  function deleteProduct(id: string) {
    if (!user) return;
    save(globalProducts.filter(p => p.id !== id));
  }

  const sellerProducts = user
    ? globalProducts.filter(p => p.sellerId === user.id)
    : [];

  const allProducts = [...globalProducts, ...staticComics];

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
