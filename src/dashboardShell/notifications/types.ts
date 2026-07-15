/**
 * Shared client types for Zenformed platform notifications (Phase 2 UI).
 * Mirrors ZenformedCore consumer API fields; omits producer/idempotency internals.
 */

export type ZenformedNotification = {
  readonly id: string;
  readonly appSlug: string;
  /** Dot-separated type from Core (`notificationType`). */
  readonly type: string;
  readonly title: string;
  readonly body: string;
  /** Relative or absolute destination; null/empty means non-navigable. */
  readonly destinationUrl: string | null;
  readonly actorUserId: string | null;
  readonly entityType: string | null;
  readonly entityId: string | null;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly readAt: string | null;
  readonly createdAt: string;
};

export type ZenformedNotificationsPageResult = {
  readonly notifications: readonly ZenformedNotification[];
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
};

export type ZenformedNotificationsUnreadResult = {
  readonly unreadCount: number;
};

export type ZenformedNotificationsApi = {
  getLatest(input: {
    organizationId: string;
    limit?: number;
    signal?: AbortSignal;
  }): Promise<readonly ZenformedNotification[]>;

  getUnreadCount(input: {
    organizationId: string;
    signal?: AbortSignal;
  }): Promise<number>;

  getPage(input: {
    organizationId: string;
    limit?: number;
    cursor?: string | null;
    signal?: AbortSignal;
  }): Promise<ZenformedNotificationsPageResult>;

  markRead(input: {
    organizationId: string;
    notificationId: string;
    signal?: AbortSignal;
  }): Promise<void>;

  markAllRead(input: {
    organizationId: string;
    signal?: AbortSignal;
  }): Promise<number>;
};

export type ZenformedDashboardNotificationsConfig = {
  readonly organizationId: string;
  readonly api: ZenformedNotificationsApi;
  readonly notificationsPageHref: string;
  readonly onNavigate: (destinationUrl: string) => void;
  /** Poll interval for unread count (ms). Default 30_000. */
  readonly unreadPollIntervalMs?: number;
};
