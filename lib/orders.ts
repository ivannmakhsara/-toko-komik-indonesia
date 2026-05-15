import { supabase } from './supabase';

export type OrderStatus = 'Pesanan Masuk' | 'Diproses' | 'Dikirim' | 'Sampai' | 'Selesai' | 'Dibatalkan';

export const STATUS_STEPS: OrderStatus[] = [
  'Pesanan Masuk', 'Diproses', 'Dikirim', 'Sampai', 'Selesai',
];

export const STATUS_ICON: Record<OrderStatus, string> = {
  'Pesanan Masuk': '📋',
  'Diproses':      '⚙️',
  'Dikirim':       '🚚',
  'Sampai':        '📦',
  'Selesai':       '✅',
  'Dibatalkan':    '❌',
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

/* ── localStorage fallback (guests / Google-login users) ── */
function getLocalOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('all-orders') || '[]'); } catch { return []; }
}

/* ── Supabase ── */
function mapRow(o: Record<string, unknown>): Order {
  const items = (o.order_items as Record<string, unknown>[] ?? []).map(i => ({
    title:    i.title    as string,
    price:    i.price    as number,
    quantity: i.quantity as number,
  }));
  return {
    id:           o.id           as string,
    userId:       o.user_id      as string,
    date:         o.created_at   as string,
    items,
    subtotal:     o.subtotal     as number,
    shippingCost: o.shipping_cost as number,
    total:        o.total        as number,
    shippingLabel: o.shipping_label as string,
    payment:      o.payment      as string,
    status:       o.status       as OrderStatus,
    buyer: {
      name:     o.buyer_name     as string,
      email:    o.buyer_email    as string,
      phone:    o.buyer_phone    as string,
      address:  o.buyer_address  as string,
      city:     o.buyer_city     as string,
      province: o.buyer_province as string,
    },
  };
}

function getStatusOverrides(): Record<string, OrderStatus> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem('tki-status-overrides') || '{}'); } catch { return {}; }
}

function applyOverrides(orders: Order[]): Order[] {
  const overrides = getStatusOverrides();
  return orders.map(o => overrides[o.id] ? { ...o, status: overrides[o.id] } : o);
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (!error && data && data.length >= 0) {
    const sbOrders = data.map(o => mapRow(o as Record<string, unknown>));
    const local = getLocalOrders();
    const sbIds = new Set(sbOrders.map(o => o.id));
    return applyOverrides([...sbOrders, ...local.filter(o => !sbIds.has(o.id))]);
  }

  return applyOverrides(getLocalOrders());
}

export async function saveOrder(order: Order): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { error } = await supabase.from('orders').insert({
      id:             order.id,
      user_id:        user.id,
      subtotal:       order.subtotal,
      shipping_cost:  order.shippingCost,
      total:          order.total,
      shipping_label: order.shippingLabel,
      payment:        order.payment,
      status:         order.status,
      buyer_name:     order.buyer.name,
      buyer_email:    order.buyer.email,
      buyer_phone:    order.buyer.phone,
      buyer_address:  order.buyer.address,
      buyer_city:     order.buyer.city,
      buyer_province: order.buyer.province,
    });

    if (!error) {
      await supabase.from('order_items').insert(
        order.items.map(item => ({
          order_id: order.id,
          title:    item.title,
          price:    item.price,
          quantity: item.quantity,
        }))
      );
      return;
    }
  }

  /* fallback: localStorage */
  localStorage.setItem('all-orders', JSON.stringify([order, ...getLocalOrders()]));
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  /* Always cache locally so UI reflects change immediately regardless of RLS */
  if (typeof window !== 'undefined') {
    const overrides = getStatusOverrides();
    overrides[orderId] = status;
    localStorage.setItem('tki-status-overrides', JSON.stringify(overrides));
  }

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    /* Also update guest orders stored directly in localStorage */
    localStorage.setItem('all-orders', JSON.stringify(
      getLocalOrders().map(o => o.id === orderId ? { ...o, status } : o)
    ));
  }
}

export function nextStatus(current: OrderStatus): OrderStatus | null {
  const idx = STATUS_STEPS.indexOf(current);
  return idx >= 0 && idx < STATUS_STEPS.length - 1 ? STATUS_STEPS[idx + 1] : null;
}

export async function cancelOrder(orderId: string, reason?: string): Promise<void> {
  if (reason && typeof window !== 'undefined') {
    const map = JSON.parse(localStorage.getItem('tki-cancel-reasons') || '{}');
    map[orderId] = reason;
    localStorage.setItem('tki-cancel-reasons', JSON.stringify(map));
  }
  await updateOrderStatus(orderId, 'Dibatalkan');
}

export function getCancelReason(orderId: string): string | null {
  if (typeof window === 'undefined') return null;
  const map = JSON.parse(localStorage.getItem('tki-cancel-reasons') || '{}');
  return map[orderId] ?? null;
}

export function setTrackingNumber(orderId: string, tracking: string): void {
  if (typeof window === 'undefined') return;
  const map = JSON.parse(localStorage.getItem('tki-tracking') || '{}');
  map[orderId] = tracking;
  localStorage.setItem('tki-tracking', JSON.stringify(map));
}

export function getTrackingNumber(orderId: string): string | null {
  if (typeof window === 'undefined') return null;
  const map = JSON.parse(localStorage.getItem('tki-tracking') || '{}');
  return map[orderId] ?? null;
}
