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
  syncToSupabase:    () => Promise<{ ok: number; fail: number; errors: string[] }>;
}

const SellerContext = createContext<SellerContextType | null>(null);

function mapRow(row: Record<string, unknown>): Comic {
  const cover = (row.cover as string) ?? '';
  return {
    id:          row.id          as string,
    sellerId:    row.seller_id   as string,
    sellerName:  row.seller_name as string,
    title:       row.title       as string,
    author:      row.author      as string,
    price:       row.price       as number,
    genre:       (row.genre       as string) ?? '',
    year:        (row.year        as number) ?? 0,
    cover,
    coverImage:  cover,
    description: (row.description as string) ?? '',
    condition:   (row.condition   as string) ?? '',
    rating:      (row.rating      as number) ?? 5.0,
    pages:       (row.pages       as number) ?? 0,
    color:       '#ef4444',
    stock:       (row.stock as number) ?? undefined,
  };
}

async function uploadCover(base64: string, productId: string): Promise<string | null> {
  try {
    const [header, data] = base64.split(',');
    const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
    const ext  = mime.split('/')[1] ?? 'jpg';
    const bytes = Uint8Array.from(atob(data), c => c.charCodeAt(0));
    const blob  = new Blob([bytes], { type: mime });
    const path  = `${productId}.${ext}`;
    const { error } = await supabase.storage.from('product-covers').upload(path, blob, { upsert: true });
    if (error) { console.error('[Cover upload]', error); return null; }
    return supabase.storage.from('product-covers').getPublicUrl(path).data.publicUrl;
  } catch { return null; }
}

export function SellerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [dbProducts, setDbProducts] = useState<Comic[]>([]);
  const [localProducts, setLocalProducts] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // 1. Fetch all products from Supabase
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('[SellerContext] fetch:', { count: data?.length, error });
      const dbRows = (!error && data) ? data : [];
      setDbProducts(dbRows.map(r => mapRow(r as Record<string, unknown>)));
      const dbIds = new Set(dbRows.map(r => r.id as string));

      // 2. Load localStorage products not already in Supabase
      let localRows: Comic[] = [];
      try {
        const raw = localStorage.getItem(LOCAL_KEY);
        if (raw) localRows = JSON.parse(raw);
      } catch { /* ignore */ }
      const unsynced = localRows.filter(p => !dbIds.has(p.id));
      setLocalProducts(unsynced);

      // 3. Auto-sync localStorage products to Supabase if user is logged in
      if (unsynced.length > 0 && user) {
        const synced: string[] = [];
        for (const p of unsynced) {
          const rawCover = p.coverImage ?? p.cover ?? '';
          const coverUrl = rawCover.startsWith('data:')
            ? (await uploadCover(rawCover, p.id)) ?? ''
            : rawCover;

          const { error: insertErr } = await supabase.from('products').upsert({
            id:          p.id,
            seller_id:   user.id,
            seller_name: user.name,
            title:       p.title,
            author:      p.author ?? '',
            price:       p.price,
            genre:       p.genre,
            year:        p.year,
            cover:       coverUrl,
            description: p.description,
            condition:   p.condition ?? '',
            rating:      p.rating ?? 5.0,
            stock:       p.stock ?? null,
          });
          if (!insertErr) {
            synced.push(p.id);
            console.log('[SellerContext] synced to Supabase:', p.title);
          } else {
            console.error('[SellerContext] sync failed:', p.title, insertErr);
          }
        }
        if (synced.length > 0) {
          const { data: refreshed } = await supabase
            .from('products').select('*').order('created_at', { ascending: false });
          if (refreshed) {
            setDbProducts(refreshed.map(r => mapRow(r as Record<string, unknown>)));
            const refreshedIds = new Set(refreshed.map(r => r.id as string));
            const stillLocal = localRows.filter(p => !refreshedIds.has(p.id));
            setLocalProducts(stillLocal);
            localStorage.setItem(LOCAL_KEY, JSON.stringify(stillLocal));
          }
        }
      }

      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const allDbAndLocal = [...dbProducts, ...localProducts];

  function notifyFollowers(sellerId: string, sellerName: string, productTitle: string) {
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

    const rawCover = product.coverImage ?? product.cover ?? '';
    const coverUrl = rawCover.startsWith('data:')
      ? (await uploadCover(rawCover, id)) ?? ''
      : rawCover;

    const { error } = await supabase.from('products').insert({
      id,
      seller_id:   user.id,
      seller_name: user.name,
      title:       product.title,
      author:      product.author ?? '',
      price:       product.price,
      genre:       product.genre,
      year:        product.year,
      cover:       coverUrl,
      description: product.description,
      condition:   product.condition ?? '',
      rating:      product.rating ?? 5.0,
      stock:       product.stock ?? null,
    });

    if (!error) {
      const newProduct: Comic = { ...product, id, sellerId: user.id, sellerName: user.name, cover: coverUrl, coverImage: coverUrl };
      setDbProducts(prev => [newProduct, ...prev]);
      notifyFollowers(user.id, user.name, product.title);
      return;
    }

    console.error('[SellerContext] Supabase insert error:', error);

    /* localStorage fallback */
    const newProduct: Comic = { ...product, id, sellerId: user.id, sellerName: user.name };
    const updated = [newProduct, ...localProducts];
    setLocalProducts(updated);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    notifyFollowers(user.id, user.name, product.title);
  }

  async function updateProduct(id: string, product: Omit<Comic, 'id' | 'sellerId' | 'sellerName'>) {
    if (!user) return;

    if (dbProducts.find(p => p.id === id)) {
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

    if (dbProducts.find(p => p.id === id)) {
      await supabase.from('products').delete().eq('id', id);
      setDbProducts(prev => prev.filter(p => p.id !== id));
      return;
    }

    const updated = localProducts.filter(p => p.id !== id);
    setLocalProducts(updated);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
  }

  async function syncToSupabase(): Promise<{ ok: number; fail: number; errors: string[] }> {
    const result = { ok: 0, fail: 0, errors: [] as string[] };
    if (!user) { result.errors.push('Belum login — silakan login terlebih dahulu'); return result; }

    const { data: existing } = await supabase.from('products').select('id');
    const existingIds = new Set((existing ?? []).map(r => r.id as string));

    const toSync = localProducts.filter(p => !existingIds.has(p.id));
    if (toSync.length === 0) { result.errors.push('Tidak ada produk baru di localStorage untuk disinkronkan'); return result; }

    for (const p of toSync) {
      const rawCover = p.coverImage ?? p.cover ?? '';
      const coverUrl = rawCover.startsWith('data:')
        ? (await uploadCover(rawCover, p.id)) ?? ''
        : rawCover;

      const { error } = await supabase.from('products').upsert({
        id:          p.id,
        seller_id:   user.id,
        seller_name: user.name,
        title:       p.title,
        author:      p.author ?? '',
        price:       p.price,
        genre:       p.genre,
        year:        p.year,
        cover:       coverUrl,
        description: p.description,
        condition:   p.condition ?? '',
        rating:      p.rating ?? 5.0,
        stock:       p.stock ?? null,
      });

      if (error) {
        result.fail++;
        result.errors.push(`"${p.title}": ${error.message}`);
      } else {
        result.ok++;
      }
    }

    if (result.ok > 0) {
      const { data: refreshed } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (refreshed) {
        setDbProducts(refreshed.map(r => mapRow(r as Record<string, unknown>)));
        const refreshedIds = new Set(refreshed.map(r => r.id as string));
        const stillLocal = localProducts.filter(p => !refreshedIds.has(p.id));
        setLocalProducts(stillLocal);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(stillLocal));
      }
    }
    return result;
  }

  async function deleteAllProducts() {
    if (!user) return;
    const mine = dbProducts.filter(p => p.sellerId === user.id);
    await Promise.all(mine.map(p => supabase.from('products').delete().eq('id', p.id)));
    setDbProducts(prev => prev.filter(p => p.sellerId !== user.id));

    const updatedLocal = localProducts.filter(p => p.sellerId !== user.id);
    setLocalProducts(updatedLocal);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updatedLocal));
  }

  const sellerProducts = user
    ? allDbAndLocal.filter(p => p.sellerId === user.id)
    : [];

  const allProducts = [...allDbAndLocal, ...staticComics];

  return (
    <SellerContext.Provider value={{ sellerProducts, allProducts, loading, addProduct, updateProduct, deleteProduct, deleteAllProducts, syncToSupabase }}>
      {children}
    </SellerContext.Provider>
  );
}

export function useSeller() {
  const ctx = useContext(SellerContext);
  if (!ctx) throw new Error('useSeller must be used inside SellerProvider');
  return ctx;
}
