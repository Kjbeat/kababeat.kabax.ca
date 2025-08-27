import { useState, ReactNode, useCallback, useMemo } from 'react';
import { NotificationsContext, NotificationItem } from './notifications-types';

function demoSeed(): NotificationItem[] {
  const now = Date.now();
  return [
    {
      id: 'n1',
      type: 'sale',
      title: 'Beat Sold',
      message: 'You sold "Sunset Boulevard" (MP3 License)',
      createdAt: new Date(now - 1000 * 60 * 2),
      read: false,
      meta: { amount: 29.99, beatId: 'beat1' }
    },
    {
      id: 'n2',
      type: 'follower',
      title: 'New Follower',
      message: 'ProducerX started following you',
      createdAt: new Date(now - 1000 * 60 * 10),
      read: false,
      meta: { userId: 'user45' }
    },
    {
      id: 'n3',
      type: 'comment',
      title: 'New Comment',
      message: 'Nice vibe on "City Lights"',
      createdAt: new Date(now - 1000 * 60 * 30),
      read: true,
      meta: { beatId: 'beat2', commentId: 'c1' }
    },
  ];
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(demoSeed());

  const addNotification = useCallback((n: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => {
    setNotifications(prev => [
      {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        read: false,
        ...n
      },
      ...prev
    ]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => n.read ? n : { ...n, read: true }));
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const latest = useMemo(() => [...notifications].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()), [notifications]);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearNotifications, latest }}>
      {children}
    </NotificationsContext.Provider>
  );
}

// Provider only; hook & context types live in separate files for fast-refresh friendliness.
