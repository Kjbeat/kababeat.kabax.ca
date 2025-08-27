import { Cart, CartItem, AddToCartInput, UpdateCartItemInput } from '../types';

export interface CartService {
  // Cart operations
  getCart(userId: string): Promise<Cart>;
  addToCart(input: AddToCartInput, userId: string): Promise<CartItem>;
  updateCartItem(input: UpdateCartItemInput, userId: string): Promise<CartItem>;
  removeFromCart(itemId: string, userId: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Cart info
  getCartItemCount(userId: string): Promise<number>;
  getCartTotal(userId: string): Promise<number>;
}
