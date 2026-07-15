/** Unread badge display: hidden at 0, `1`–`99`, then `99+`. */
export function formatUnreadBadgeLabel(unreadCount: number): string | null {
  if (!Number.isFinite(unreadCount) || unreadCount <= 0) return null;
  const n = Math.floor(unreadCount);
  if (n > 99) return '99+';
  return String(n);
}

export function formatNotificationsTriggerAriaLabel(unreadCount: number): string {
  const n = Math.max(0, Math.floor(Number.isFinite(unreadCount) ? unreadCount : 0));
  if (n <= 0) return 'Notifications';
  if (n === 1) return 'Notifications, 1 unread';
  if (n > 99) return 'Notifications, more than 99 unread';
  return `Notifications, ${n} unread`;
}

export function clampUnreadCount(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.floor(n);
}

export function decrementUnreadCount(current: number, by = 1): number {
  return clampUnreadCount(current - by);
}
