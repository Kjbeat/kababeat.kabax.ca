import { useContext } from 'react';
import { NotificationsContext } from './notifications-types';

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
