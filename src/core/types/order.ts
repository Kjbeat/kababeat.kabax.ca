export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  beatId: string;
  beatTitle: string;
  artistName: string;
  price: number;
  licenseType: 'basic' | 'premium' | 'exclusive';
  license?: License;
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled' | 'refunded';

export interface License {
  id: string;
  orderItemId: string;
  beatId: string;
  userId: string;
  licenseType: 'basic' | 'premium' | 'exclusive';
  downloadUrl?: string;
  expiresAt?: Date;
  createdAt: Date;
}

export interface CreateOrderInput {
  items: {
    beatId: string;
    licenseType: 'basic' | 'premium' | 'exclusive';
  }[];
}

