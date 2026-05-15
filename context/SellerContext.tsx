'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Comic } from '@/lib/types';
import { comics as staticComics } from '@/lib/data';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

const LOCAL_KEY = 'all-seller-products';

interface SellerContextType {
  sellerProducts: Comic[];
  allProducts:    Comic[];
  loading:        boolean;
  addProduct:    (product: Omit<Comic, 'id' | 'sellerId' | 'sellerName'>) => Promise<void>;
  updateProduct: (id: string, product: Omit<Comic, 'id' | 'sellerId' | 'sellerName'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

const SellerContext = createContext<SellerContextType | null>(null);

function mapRow(row: Record<string, unknown>): Comic {
  return {
    id:          row.id          as string,
    sellerId:    row.seller_id   as string,
    sellerName:  row.seller_name as string,
    title:       row.title       as string,
    author:      row.author      as string,
    price:       row.price       as number,
    genre:       (row.genre       as string) ?? '',
    year:        (row.year        as number) ?? 0,
    cover:       (row.cover       as string) ?? '',
    description: (row.description as string) ?? '',
    condition:   (row.condition   as string) ?? '',
    rating:      (row.rating      as number) ?? 5.0,
    color:       '#ef4444',
  };
}

export function SellerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [dbProducts, setDbProducts] = useState<Comic[]>([]);
  const [localProducts, setLocalProducts] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setDbProducts(data.map(r => mapRow(r as Record<string, unknown>)));
      }

      try {
        const raw = localStorage.getItem(LOCAL_KEY);
        if (raw) {
          const parsed: Comic[] = JSON.parse(raw);
          const dbIds = new Set((data ?? []).map(r => r.id as string));
          setLocalProducts(parsed.filter(p => !dbIds.has(p.id)));
        }
      } catch { /* ignore */ }

      setLoading(false);
    }
    load();
  }, []);

  const allDbAndLocal = [...dbProducts, ...localProducts];

  async function addProduct(product: Omit<Comic, 'id' | 'sellerId' | 'sellerName'>) {
    if (!user) return;
    const id = `seller-${Date.now()}`;

    const { data: { user: sbUser } } = await supabase.auth.getUser();
    if (sbUser) {
      const { error } = await supabase.from('products').insert({
        id,
        seller_id:   sbUser.id,
        seller_name: user.name,
        title:       product.title,
        author:      product.author,
        price:       product.price,
        genre:       product.genre,
        year:        product.year,
        cover:       product.cover,
        description: product.description,
        condition:   product.condition,
        rating:      product.rating ?? 5.0,
      });
      if (!error) {
        const newProduct: Comic = { ...product, id, sellerId: sbUser.id, sellerName: user.name };
        setDbProducts(prev => [newProduct, ...prev]);
        return;
      }
    }

    /* localStorage fallback */
    const newProduct: Comic = { ...product, id, sellerId: user.id, sellerName: user.name };
    const updated = [newProduct, ...localProducts];
    setLocalProducts(updated);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
  }

  async function updateProduct(id: string, product: Omit<Comic, 'id' | 'sellerId' | 'sellerName'>) {
    if (!user) return;

    const { data: { user: sbUser } } = await supabase.auth.getUser();
    if (sbUser && dbProducts.find(p => p.id === id)) {
      await supabase.from('products').update({
        title:       product.title,
        author:      product.author,
        price:       product.price,
        genre:       product.genre,
        year:        product.year,
        cover:       product.cover,
        description: product.description,
        condition:   product.condition,
      }).eq('id', id);
      setDbProducts(prev => prev.map(p =>
        p.id === id ? { ...product, id, sellerId: p.sellerId, sellerName: p.sellerName } : p
      ));
      return;
    }

    const updated = localProducts.map(p =>
      p.id === id ? { ...product, id, sellerId: p.sellerId, sellerName: p.sellerName } : p
    );
    setLocalProducts(updated);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
  }

  async function deleteProduct(id: string) {
    if (!user) return;

    const { data: { user: sbUser } } = await supabase.auth.getUser();
    if (sbUser && dbProducts.find(p => p.id === id)) {
      await supabase.from('products').delete().eq('id', id);
      setDbProducts(prev => prev.filter(p => p.id !== id));
      return;
    }

    const updated = localProducts.filter(p => p.id !== id);
    setLocalProducts(updated);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
  }

  const sellerProducts = user
    ? allDbAndLocal.filter(p => p.sellerId === user.id)
    : [];

  const allProducts = [...allDbAndLocal, ...staticComics];

  return (
    <SellerContext.Provider value={{ sellerProducts, allProducts, loading, addProduct, updateProduct, deleteProduct }}>
      {children}
    </SellerContext.Provider>
  );
}

export function useSeller() {
  const ctx = useContext(SellerContext);
  if (!ctx) throw new Error('useSeller must be used inside SellerProvider');
  return ctx;
}
