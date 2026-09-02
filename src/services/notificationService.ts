import { NotificationItem, UserProfile, ViewMode } from '../types';
import { dbService } from './dbService';

export interface SendNotificationPayload {
  title: string;
  message: string;
  type: NotificationItem['type'];
  time?: string;
  recipientRole?: 'all' | 'admin' | 'manager' | 'employee';
  recipientId?: string;
  recipientEmpId?: string;
  senderName?: string;
  linkView?: ViewMode;
}

export const notificationService = {
  /**
   * Publish a new notification to Firestore
   */
  async sendNotification(payload: SendNotificationPayload): Promise<NotificationItem> {
    const now = new Date();
    const item: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: payload.title,
      message: payload.message,
      time: payload.time || 'Just now',
      createdAt: now.toISOString(),
      read: false,
      type: payload.type,
      recipientRole: payload.recipientRole || 'all',
      recipientId: payload.recipientId,
      recipientEmpId: payload.recipientEmpId,
      senderName: payload.senderName,
      linkView: payload.linkView
    };

    try {
      await dbService.saveItem('notifications', item);
    } catch (err) {
      console.error('Failed to dispatch notification to Firestore:', err);
    }

    return item;
  },

  /**
   * Filter notifications relevant to the logged-in user
   */
  filterForUser(notifications: NotificationItem[], user: UserProfile): NotificationItem[] {
    if (!user) return notifications;

    const userRole = user.roleType || 'employee';

    return notifications.filter(n => {
      // 1. Role match
      const roleMatch = !n.recipientRole || n.recipientRole === 'all' || n.recipientRole === userRole;
      if (userRole === 'admin') return true; // Admin sees all system alerts

      // 2. Specific recipient match if specified
      if (n.recipientId) {
        const matchesUser =
          n.recipientId === user.id ||
          n.recipientId.toLowerCase() === user.name.toLowerCase() ||
          n.recipientId.toLowerCase() === user.email.toLowerCase();
        if (!matchesUser) return false;
      }

      if (n.recipientEmpId && user.empId) {
        if (n.recipientEmpId !== user.empId) return false;
      }

      return roleMatch;
    });
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string, currentNotifs: NotificationItem[]): Promise<void> {
    const target = currentNotifs.find(n => n.id === id);
    if (!target || target.read) return;

    const updated = { ...target, read: true };
    try {
      await dbService.saveItem('notifications', updated);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  },

  /**
   * Mark all unread notifications visible to user as read
   */
  async markAllAsRead(relevantNotifs: NotificationItem[]): Promise<void> {
    const unread = relevantNotifs.filter(n => !n.read);
    for (const notif of unread) {
      const updated = { ...notif, read: true };
      try {
        await dbService.saveItem('notifications', updated);
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }
  },

  /**
   * Clear read notifications or all visible notifications
   */
  async clearAll(relevantNotifs: NotificationItem[]): Promise<void> {
    for (const notif of relevantNotifs) {
      try {
        await dbService.deleteItem('notifications', notif.id);
      } catch (err) {
        console.error('Error deleting notification:', err);
      }
    }
  }
};
