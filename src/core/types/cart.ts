export interface CartItem {
  id: string;
  beatId: string;
  beatTitle: string;
  artistName: string;
  artwork?: string;
  price: number;
  licenseType: 'basic' | 'premium' | 'exclusive';
  quantity: number;
  addedAt: Date;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartInput {
  beatId: string;
  licenseType: 'basic' | 'premium' | 'exclusive';
  quantity?: number;
}

export interface UpdateCartItemInput {
  itemId: string;
  quantity: number;
}

