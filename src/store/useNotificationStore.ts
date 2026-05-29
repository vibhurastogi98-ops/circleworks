import { create } from "zustand";

import {
  createDemoNotifications,
  getNotificationDefinition,
  type NotificationCategory,
  type NotificationRecord,
  type NotificationSeverity,
} from "@/lib/notifications/registry";

export type { NotificationCategory, NotificationRecord };

export type IncomingNotification = Partial<NotificationRecord> & {
  description?: string;
  createdAt?: string;
  eventType?: string;
};

type NotificationState = {
  notifications: NotificationRecord[];
  unreadCount: number;
  isLoading: boolean;
  lastLoadedAt: string | null;
  loadNotifications: () => Promise<void>;
  addNotification: (notification: IncomingNotification) => NotificationRecord;
  setNotifications: (notifications: NotificationRecord[]) => void;
  markAsRead: (id: string) => void;
  markVisibleAsRead: (ids: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => void;
};

function normalizeCategory(value: unknown, fallback: NotificationCategory): NotificationCategory {
  const categories: NotificationCategory[] = [
    "payroll",
    "hr",
    "hiring",
    "onboarding",
    "benefits",
    "time",
    "expenses",
    "compliance",
    "system",
    "billing",
  ];
  return categories.includes(value as NotificationCategory) ? (value as NotificationCategory) : fallback;
}

function normalizeSeverity(value: unknown, fallback: NotificationSeverity): NotificationSeverity {
  const severities: NotificationSeverity[] = ["success", "info", "warning", "critical"];
  return severities.includes(value as NotificationSeverity) ? (value as NotificationSeverity) : fallback;
}

function sortNotifications(notifications: NotificationRecord[]) {
  return [...notifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

function getUnreadCount(notifications: NotificationRecord[]) {
  return notifications.filter((notification) => !notification.isRead).length;
}

function normalizeIncoming(notification: IncomingNotification): NotificationRecord {
  const type = notification.type ?? notification.eventType ?? "system.new_feature";
  const definition = getNotificationDefinition(type);

  return {
    id: notification.id ?? `live-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: definition.type,
    category: normalizeCategory(notification.category, definition.category),
    title: notification.title ?? definition.title,
    message: notification.message ?? notification.description ?? definition.message,
    timestamp: notification.timestamp ?? notification.createdAt ?? new Date().toISOString(),
    isRead: notification.isRead ?? false,
    link: notification.link ?? definition.link,
    actionLabel: notification.actionLabel ?? definition.actionLabel,
    severity: normalizeSeverity(notification.severity, definition.severity),
    metadata: notification.metadata,
  };
}

async function persistReadState(ids?: string[]) {
  try {
    await fetch("/api/notifications/mark-read", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ids?.length ? { ids } : { all: true }),
    });
  } catch {
    // Optimistic UI should not be rolled back for transient read-receipt failures.
  }
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: createDemoNotifications(),
  unreadCount: createDemoNotifications().filter((notification) => !notification.isRead).length,
  isLoading: false,
  lastLoadedAt: null,

  loadNotifications: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/notifications", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to load notifications");
      const data = (await response.json()) as { notifications?: IncomingNotification[] };
      const notifications = sortNotifications((data.notifications ?? []).map(normalizeIncoming));
      set({
        notifications: notifications.length ? notifications : createDemoNotifications(),
        unreadCount: getUnreadCount(notifications.length ? notifications : createDemoNotifications()),
        lastLoadedAt: new Date().toISOString(),
      });
    } catch {
      const fallback = createDemoNotifications();
      set({
        notifications: fallback,
        unreadCount: getUnreadCount(fallback),
        lastLoadedAt: new Date().toISOString(),
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addNotification: (incoming) => {
    const notification = normalizeIncoming(incoming);
    set((state) => {
      const withoutDuplicate = state.notifications.filter((item) => item.id !== notification.id);
      const notifications = sortNotifications([notification, ...withoutDuplicate]);
      return {
        notifications,
        unreadCount: getUnreadCount(notifications),
      };
    });
    return notification;
  },

  setNotifications: (notifications) => {
    const sorted = sortNotifications(notifications);
    set({ notifications: sorted, unreadCount: getUnreadCount(sorted) });
  },

  markAsRead: (id) => {
    set((state) => {
      const notifications = state.notifications.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification,
      );
      return { notifications, unreadCount: getUnreadCount(notifications) };
    });
    void persistReadState([id]);
  },

  markVisibleAsRead: async (ids) => {
    if (!ids.length) return;
    set((state) => {
      const idSet = new Set(ids);
      const notifications = state.notifications.map((notification) =>
        idSet.has(notification.id) ? { ...notification, isRead: true } : notification,
      );
      return { notifications, unreadCount: getUnreadCount(notifications) };
    });
    await persistReadState(ids);
  },

  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((notification) => ({ ...notification, isRead: true })),
      unreadCount: 0,
    }));
    await persistReadState();
  },

  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));
