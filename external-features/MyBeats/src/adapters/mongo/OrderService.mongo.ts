import { OrderService } from '../../core/services/OrderService';
import { Order, CreateOrderInput } from '../../core/types';

export class OrderServiceMongo implements OrderService {
  async createOrder(input: CreateOrderInput, userId: string): Promise<Order> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async getOrder(id: string, userId: string): Promise<Order> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async processPayment(orderId: string, paymentIntentId: string): Promise<Order> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async processRefund(orderId: string, userId: string, amount?: number): Promise<Order> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    throw new Error('Not implemented - TODO: Implement with mock data');
  }
}
