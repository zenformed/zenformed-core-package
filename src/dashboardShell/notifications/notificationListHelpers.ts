import type { ZenformedNotification } from './types';

export function withOptimisticReadAt(
  notifications: readonly ZenformedNotification[],
  notificationId: string,
  readAt: string
): ZenformedNotification[] {
  return notifications.map((n) =>
    n.id === notificationId && n.readAt == null ? { ...n, readAt } : n
  );
}

export function withAllOptimisticReadAt(
  notifications: readonly ZenformedNotification[],
  readAt: string
): ZenformedNotification[] {
  return notifications.map((n) => (n.readAt == null ? { ...n, readAt } : n));
}

export function mergeNotificationPages(
  existing: readonly ZenformedNotification[],
  next: readonly ZenformedNotification[]
): ZenformedNotification[] {
  const seen = new Set(existing.map((n) => n.id));
  const merged = [...existing];
  for (const n of next) {
    if (!seen.has(n.id)) {
      seen.add(n.id);
      merged.push(n);
    }
  }
  return merged;
}

export function replaceNotificationInLists(
  lists: {
    latest: readonly ZenformedNotification[];
    page: readonly ZenformedNotification[];
  },
  notificationId: string,
  updater: (n: ZenformedNotification) => ZenformedNotification
): {
  latest: ZenformedNotification[];
  page: ZenformedNotification[];
} {
  return {
    latest: lists.latest.map((n) => (n.id === notificationId ? updater(n) : n)),
    page: lists.page.map((n) => (n.id === notificationId ? updater(n) : n)),
  };
}
