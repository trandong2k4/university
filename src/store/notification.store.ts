import { createContext, useContext, useState, useCallback } from 'react';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
}

export const NotificationContext = createContext<NotificationStore | undefined>(undefined);

export const useNotificationStore = (): NotificationStore => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotificationStore must be used within NotificationProvider');
  return context;
};
