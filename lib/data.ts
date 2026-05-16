import { Comic } from './types';

export const comics: Comic[] = [];

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const genres = ['Semua', 'Aksi', 'Petualangan', 'Humor', 'Horor', 'Romantis', 'Fantasi'];
