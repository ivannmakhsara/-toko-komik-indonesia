export interface Review {
  id: string;
  orderId: string;
  productTitle: string;
  rating: number;
  text: string;
  photos: string[];
  buyerName: string;
  date: string;
}

function getAll(): Review[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('tki-reviews') || '[]'); } catch { return []; }
}

export function saveReview(r: Review): void {
  const all = getAll().filter(x => !(x.orderId === r.orderId && x.productTitle === r.productTitle));
  localStorage.setItem('tki-reviews', JSON.stringify([r, ...all]));
}

export function getReviewsForProduct(title: string): Review[] {
  return getAll().filter(r => r.productTitle === title);
}

export function hasReviewed(orderId: string, title: string): boolean {
  return getAll().some(r => r.orderId === orderId && r.productTitle === title);
}
