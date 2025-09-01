import { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  title: string;
  producer: string;
  artwork?: string;
  price: number;
  licenseType: string; // MP3, WAV, Exclusive, etc.
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string, licenseType: string) => void;
  updateQuantity: (id: string, licenseType: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existingItem = prev.find(
        item => item.id === newItem.id && item.licenseType === newItem.licenseType
      );
      
      if (existingItem) {
        return prev.map(item =>
          item.id === newItem.id && item.licenseType === newItem.licenseType
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prev, { ...newItem, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string, licenseType: string) => {
    setItems(prev => prev.filter(
      item => !(item.id === id && item.licenseType === licenseType)
    ));
  };

  const updateQuantity = (id: string, licenseType: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, licenseType);
      return;
    }
    
    setItems(prev => prev.map(item =>
      item.id === id && item.licenseType === licenseType
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}