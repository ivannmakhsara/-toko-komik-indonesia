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
  addProduct:        (product: Omit<Comic, 'id' | 'sellerId' | 'sellerName'>) => Promise<void>;
  updateProduct:     (id: string, product: Omit<Comic, 'id' | 'sellerId' | 'sellerName'>) => Promise<void>;
  deleteProduct:     (id: string) => Promise<void>;
  deleteAllProducts: () => Promise<void>;
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
    pages:       (row.pages       as number) ?? 0,
    color:       '#ef4444',
    stock:       (row.stock as number) ?? undefined,
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

  function notifyFollowers(sellerId: string, sellerName: string, productTitle: string) {
    /* Scan all tki-follows-* keys and write an update for each follower */
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith('tki-follows-')) continue;
        const buyerId = key.replace('tki-follows-', '');
        const followed: string[] = JSON.parse(localStorage.getItem(key) || '[]');
        if (!followed.includes(sellerId)) continue;
        const updKey = `tki-follow-updates-${buyerId}`;
        const updates = JSON.parse(localStorage.getItem(updKey) || '[]');
        updates.unshift({
          id: `upd-${Date.now()}`,
          sellerId,
          sellerName,
          productTitle,
          date: new Date().toISOString(),
          read: false,
        });
        localStorage.setItem(updKey, JSON.stringify(updates.slice(0, 50)));
      }
    } catch { /* ignore */ }
  }

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
        stock:       product.stock ?? null,
      });
      if (!error) {
        const newProduct: Comic = { ...product, id, sellerId: sbUser.id, sellerName: user.name };
        setDbProducts(prev => [newProduct, ...prev]);
        notifyFollowers(sbUser.id, user.name, product.title);
        return;
      }
    }

    /* localStorage fallback */
    const newProduct: Comic = { ...product, id, sellerId: user.id, sellerName: user.name };
    const updated = [newProduct, ...localProducts];
    setLocalProducts(updated);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    notifyFollowers(user.id, user.name, product.title);
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
        stock:       product.stock ?? null,
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

  async function deleteAllProducts() {
    if (!user) return;
    const { data: { user: sbUser } } = await supabase.auth.getUser();
    if (sbUser) {
      const mine = dbProducts.filter(p => p.sellerId === sbUser.id);
      await Promise.all(mine.map(p => supabase.from('products').delete().eq('id', p.id)));
      setDbProducts(prev => prev.filter(p => p.sellerId !== sbUser.id));
    }
    const updatedLocal = localProducts.filter(p => p.sellerId !== user.id);
    setLocalProducts(updatedLocal);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updatedLocal));
  }

  const sellerProducts = user
    ? allDbAndLocal.filter(p => p.sellerId === user.id)
    : [];

  const allProducts = [...allDbAndLocal, ...staticComics];

  return (
    <SellerContext.Provider value={{ sellerProducts, allProducts, loading, addProduct, updateProduct, deleteProduct, deleteAllProducts }}>
      {children}
    </SellerContext.Provider>
  );
}

export function useSeller() {
  const ctx = useContext(SellerContext);
  if (!ctx) throw new Error('useSeller must be used inside SellerProvider');
  return ctx;
}
