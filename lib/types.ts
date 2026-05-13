export interface Comic {
  id: string;
  title: string;
  author: string;
  genre: string;
  price: number;
  color: string;
  coverImage?: string;
  previewImages?: string[];
  description: string;
  year: number;
  pages: number;
}

export interface CartItem {
  comic: Comic;
  quantity: number;
}

export type Genre = 'Semua' | 'Aksi' | 'Petualangan' | 'Humor' | 'Horor' | 'Romantis' | 'Fantasi';
