export interface CartItem {
  id: string;
  title: string;
  producer: string;
  artwork?: string;
  price: number;
  licenseType: string; // MP3, WAV, Exclusive, etc.
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string, licenseType: string) => void;
  updateQuantity: (id: string, licenseType: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}
