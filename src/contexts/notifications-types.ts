import { createContext } from 'react';

export type NotificationType = 'sale' | 'follower' | 'comment' | 'like';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  meta?: Record<string, unknown>;
}

export interface NotificationsContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (n: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  latest: NotificationItem[];
}

export const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);
