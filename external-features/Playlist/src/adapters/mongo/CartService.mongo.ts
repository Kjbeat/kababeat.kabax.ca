import { CartService } from '../../core/services/CartService';
import { Cart, CartItem, AddToCartInput, UpdateCartItemInput } from '../../core/types';

export class CartServiceMongo implements CartService {
  async getCart(userId: string): Promise<Cart> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async addToCart(input: AddToCartInput, userId: string): Promise<CartItem> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async updateCartItem(input: UpdateCartItemInput, userId: string): Promise<CartItem> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async removeFromCart(itemId: string, userId: string): Promise<void> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async clearCart(userId: string): Promise<void> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async getCartItemCount(userId: string): Promise<number> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async getCartTotal(userId: string): Promise<number> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }
}
