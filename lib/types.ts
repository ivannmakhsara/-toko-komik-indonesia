export interface Comic {
  id: string;
  title: string;
  author?: string;        // optional — can be mentioned in description
  genre: string;
  price: number;
  color: string;
  coverImage?: string;
  previewImages?: string[];
  description: string;
  year: number;
  pages?: number;
  condition?: string;     // Baru | Bekas Mulus | Bekas
  weight?: number;        // grams per unit, used for shipping calculation
  minBuy?: number;        // minimum purchase quantity
  preorderDays?: number;  // days to ship if preorder; undefined = not preorder
  rating?: number;
  cover?: string;
  sellerId?: string;
  sellerName?: string;
}

export interface CartItem {
  comic: Comic;
  quantity: number;
}

export type Genre = 'Semua' | 'Aksi' | 'Petualangan' | 'Humor' | 'Horor' | 'Romantis' | 'Fantasi';
