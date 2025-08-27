import { Order, CreateOrderInput } from '../types';

export interface OrderService {
  // Order operations
  createOrder(input: CreateOrderInput, userId: string): Promise<Order>;
  getOrder(id: string, userId: string): Promise<Order>;
  getUserOrders(userId: string): Promise<Order[]>;
  
  // Payment
  processPayment(orderId: string, paymentIntentId: string): Promise<Order>;
  processRefund(orderId: string, userId: string, amount?: number): Promise<Order>;
  
  // Order status
  updateOrderStatus(id: string, status: string): Promise<Order>;
}
