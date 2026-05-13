export type OrderStatus = 'Pesanan Masuk' | 'Diproses' | 'Dikirim' | 'Sampai' | 'Selesai';

export const STATUS_STEPS: OrderStatus[] = [
  'Pesanan Masuk', 'Diproses', 'Dikirim', 'Sampai', 'Selesai',
];

export const STATUS_ICON: Record<OrderStatus, string> = {
  'Pesanan Masuk': '📋',
  'Diproses':      '⚙️',
  'Dikirim':       '🚚',
  'Sampai':        '📦',
  'Selesai':       '✅',
};

export interface OrderItem {
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingLabel: string;
  payment: string;
  buyer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
  };
  status: OrderStatus;
}

export function getOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('all-orders') || '[]'); } catch { return []; }
}

export function saveOrder(order: Order): void {
  localStorage.setItem('all-orders', JSON.stringify([order, ...getOrders()]));
}

export function updateOrderStatus(orderId: string, status: OrderStatus): void {
  localStorage.setItem('all-orders', JSON.stringify(
    getOrders().map(o => o.id === orderId ? { ...o, status } : o)
  ));
}

export function nextStatus(current: OrderStatus): OrderStatus | null {
  const idx = STATUS_STEPS.indexOf(current);
  return idx < STATUS_STEPS.length - 1 ? STATUS_STEPS[idx + 1] : null;
}
