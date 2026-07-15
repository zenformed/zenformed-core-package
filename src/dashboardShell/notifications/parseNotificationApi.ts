import type { ZenformedNotification, ZenformedNotificationsPageResult } from './types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value != null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function asNullableString(value: unknown): string | null {
  if (value == null) return null;
  return typeof value === 'string' ? value : null;
}

function asMetadata(value: unknown): Readonly<Record<string, unknown>> {
  if (value != null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

/**
 * Maps a Core (or BFF) notification JSON object into the shared client type.
 * Accepts `notificationType` (Core) or `type` (alias).
 */
export function parseZenformedNotification(raw: unknown): ZenformedNotification | null {
  const o = asRecord(raw);
  if (o == null) return null;

  const id = asString(o.id)?.trim();
  const appSlug = asString(o.appSlug)?.trim();
  const type =
    asString(o.type)?.trim() ||
    asString(o.notificationType)?.trim() ||
    '';
  const title = asString(o.title);
  const body = asString(o.body);
  const createdAt = asString(o.createdAt)?.trim();

  if (!id || !appSlug || !type || title == null || body == null || !createdAt) {
    return null;
  }

  const destinationRaw = asNullableString(o.destinationUrl)?.trim() ?? '';
  const destinationUrl = destinationRaw.length > 0 ? destinationRaw : null;

  return {
    id,
    appSlug,
    type,
    title,
    body,
    destinationUrl,
    actorUserId: asNullableString(o.actorUserId),
    entityType: asNullableString(o.entityType),
    entityId: asNullableString(o.entityId),
    metadata: asMetadata(o.metadata),
    readAt: asNullableString(o.readAt),
    createdAt,
  };
}

export function parseZenformedNotificationsList(raw: unknown): readonly ZenformedNotification[] {
  const o = asRecord(raw);
  const list = o != null && Array.isArray(o.notifications) ? o.notifications : Array.isArray(raw) ? raw : null;
  if (list == null) return [];
  const out: ZenformedNotification[] = [];
  for (const item of list) {
    const parsed = parseZenformedNotification(item);
    if (parsed) out.push(parsed);
  }
  return out;
}

export function parseZenformedNotificationsPage(raw: unknown): ZenformedNotificationsPageResult {
  const o = asRecord(raw);
  const notifications = parseZenformedNotificationsList(raw);
  if (o == null) {
    return { notifications, nextCursor: null, hasMore: false };
  }
  const nextCursor =
    o.nextCursor == null
      ? null
      : typeof o.nextCursor === 'string' && o.nextCursor.trim()
        ? o.nextCursor.trim()
        : null;
  const hasMore = typeof o.hasMore === 'boolean' ? o.hasMore : nextCursor != null;
  return { notifications, nextCursor, hasMore };
}

export function parseUnreadCount(raw: unknown): number {
  const o = asRecord(raw);
  if (o == null) return 0;
  const n = o.unreadCount;
  if (typeof n === 'number' && Number.isFinite(n) && n >= 0) return Math.floor(n);
  if (typeof n === 'string' && n.trim() && Number.isFinite(Number(n))) {
    return Math.max(0, Math.floor(Number(n)));
  }
  return 0;
}
