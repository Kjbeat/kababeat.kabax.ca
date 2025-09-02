import { createContext } from 'react';

// This file is deprecated. Use '../interface-types/notifications' instead.
export type { NotificationType, NotificationItem, NotificationsContextType } from '../interface-types/notifications';

import type { NotificationsContextType } from '../interface-types/notifications';
export const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);
