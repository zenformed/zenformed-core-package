'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toUserFacingNotificationsError } from './notificationErrors';
import {
  mergeNotificationPages,
  withAllOptimisticReadAt,
  withOptimisticReadAt,
} from './notificationListHelpers';
import { clampUnreadCount, decrementUnreadCount } from './notificationStateHelpers';
import type { ZenformedNotification, ZenformedNotificationsApi } from './types';

const DEFAULT_POLL_MS = 30_000;
const LATEST_LIMIT = 10;
const PAGE_LIMIT = 20;

export type UseZenformedNotificationsControllerOptions = {
  readonly organizationId: string;
  readonly api: ZenformedNotificationsApi;
  readonly enabled?: boolean;
  readonly unreadPollIntervalMs?: number;
};

export type UseZenformedNotificationsControllerResult = {
  readonly unreadCount: number;
  readonly latest: readonly ZenformedNotification[];
  readonly pageItems: readonly ZenformedNotification[];
  readonly nextCursor: string | null;
  readonly hasMore: boolean;

  readonly unreadLoading: boolean;
  readonly latestLoading: boolean;
  readonly pageLoading: boolean;
  readonly loadMoreLoading: boolean;
  readonly markingAllRead: boolean;
  readonly markingReadIds: ReadonlySet<string>;

  readonly unreadError: string | null;
  readonly latestError: string | null;
  readonly pageError: string | null;
  readonly actionError: string | null;

  readonly refreshUnreadCount: () => Promise<void>;
  readonly refreshLatest: () => Promise<void>;
  readonly loadInitialPage: () => Promise<void>;
  readonly loadMore: () => Promise<void>;
  readonly markRead: (notificationId: string) => Promise<void>;
  readonly markAllRead: () => Promise<void>;
  readonly clearActionError: () => void;
};

export function useZenformedNotificationsController({
  organizationId,
  api,
  enabled = true,
  unreadPollIntervalMs = DEFAULT_POLL_MS,
}: UseZenformedNotificationsControllerOptions): UseZenformedNotificationsControllerResult {
  const [unreadCount, setUnreadCount] = useState(0);
  const [latest, setLatest] = useState<readonly ZenformedNotification[]>([]);
  const [pageItems, setPageItems] = useState<readonly ZenformedNotification[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [unreadLoading, setUnreadLoading] = useState(false);
  const [latestLoading, setLatestLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [markingReadIds, setMarkingReadIds] = useState<ReadonlySet<string>>(() => new Set());

  const [unreadError, setUnreadError] = useState<string | null>(null);
  const [latestError, setLatestError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const orgRef = useRef(organizationId);
  const apiRef = useRef(api);
  apiRef.current = api;
  const unreadInflight = useRef(false);
  const latestInflight = useRef(false);
  const pageInflight = useRef(false);
  const loadMoreInflight = useRef(false);
  const markReadInflight = useRef(new Set<string>());
  const unreadAbort = useRef<AbortController | null>(null);
  const latestAbort = useRef<AbortController | null>(null);
  const pageAbort = useRef<AbortController | null>(null);
  const latestRef = useRef(latest);
  const pageItemsRef = useRef(pageItems);
  const unreadCountRef = useRef(unreadCount);

  useEffect(() => {
    latestRef.current = latest;
  }, [latest]);
  useEffect(() => {
    pageItemsRef.current = pageItems;
  }, [pageItems]);
  useEffect(() => {
    unreadCountRef.current = unreadCount;
  }, [unreadCount]);

  const clearActionError = useCallback(() => setActionError(null), []);

  const resetForOrganization = useCallback(() => {
    setUnreadCount(0);
    setLatest([]);
    setPageItems([]);
    setNextCursor(null);
    setHasMore(false);
    setUnreadError(null);
    setLatestError(null);
    setPageError(null);
    setActionError(null);
    setMarkingReadIds(new Set());
    markReadInflight.current.clear();
  }, []);

  useEffect(() => {
    if (orgRef.current !== organizationId) {
      orgRef.current = organizationId;
      resetForOrganization();
    }
  }, [organizationId, resetForOrganization]);

  const refreshUnreadCount = useCallback(async () => {
    if (!enabled || !organizationId.trim()) return;
    // Always restart — never early-return while inflight. Host re-renders that
    // recreate an API object used to skip the mount fetch until dropdown open.
    unreadAbort.current?.abort();
    const ac = new AbortController();
    unreadAbort.current = ac;
    unreadInflight.current = true;
    setUnreadLoading(true);
    try {
      const count = await apiRef.current.getUnreadCount({
        organizationId,
        signal: ac.signal,
      });
      if (ac.signal.aborted) return;
      setUnreadCount(clampUnreadCount(count));
      setUnreadError(null);
    } catch (err) {
      if (ac.signal.aborted || (err instanceof Error && err.name === 'AbortError')) return;
      setUnreadError(toUserFacingNotificationsError(err));
    } finally {
      if (unreadAbort.current === ac) {
        unreadInflight.current = false;
        setUnreadLoading(false);
      }
    }
    // Intentionally omit `api` — keep callback identity stable for mount/poll effects.
  }, [enabled, organizationId]);

  const refreshLatest = useCallback(async () => {
    if (!enabled || !organizationId.trim()) return;
    latestAbort.current?.abort();
    const ac = new AbortController();
    latestAbort.current = ac;
    latestInflight.current = true;
    setLatestLoading(true);
    try {
      const items = await apiRef.current.getLatest({
        organizationId,
        limit: LATEST_LIMIT,
        signal: ac.signal,
      });
      if (ac.signal.aborted) return;
      setLatest(items);
      setLatestError(null);
    } catch (err) {
      if (ac.signal.aborted || (err instanceof Error && err.name === 'AbortError')) return;
      setLatestError(toUserFacingNotificationsError(err));
    } finally {
      if (latestAbort.current === ac) {
        latestInflight.current = false;
        setLatestLoading(false);
      }
    }
  }, [enabled, organizationId]);

  const loadInitialPage = useCallback(async () => {
    if (!enabled || !organizationId.trim()) return;
    pageAbort.current?.abort();
    const ac = new AbortController();
    pageAbort.current = ac;
    pageInflight.current = true;
    setPageLoading(true);
    try {
      const result = await apiRef.current.getPage({
        organizationId,
        limit: PAGE_LIMIT,
        cursor: null,
        signal: ac.signal,
      });
      if (ac.signal.aborted) return;
      setPageItems(result.notifications);
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
      setPageError(null);
    } catch (err) {
      if (ac.signal.aborted || (err instanceof Error && err.name === 'AbortError')) return;
      setPageError(toUserFacingNotificationsError(err));
    } finally {
      if (pageAbort.current === ac) {
        pageInflight.current = false;
        setPageLoading(false);
      }
    }
  }, [enabled, organizationId]);

  const loadMore = useCallback(async () => {
    if (!enabled || !organizationId.trim() || !hasMore || !nextCursor) return;
    if (loadMoreInflight.current || pageInflight.current) return;
    loadMoreInflight.current = true;
    setLoadMoreLoading(true);
    try {
      const result = await apiRef.current.getPage({
        organizationId,
        limit: PAGE_LIMIT,
        cursor: nextCursor,
      });
      setPageItems((prev) => mergeNotificationPages(prev, result.notifications));
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
      setPageError(null);
    } catch (err) {
      setPageError(toUserFacingNotificationsError(err));
    } finally {
      loadMoreInflight.current = false;
      setLoadMoreLoading(false);
    }
  }, [enabled, hasMore, nextCursor, organizationId]);

  const markRead = useCallback(
    async (notificationId: string) => {
      if (!enabled || !organizationId.trim() || !notificationId) return;
      if (markReadInflight.current.has(notificationId)) return;

      const priorLatest = latestRef.current;
      const priorPage = pageItemsRef.current;
      const priorUnread = unreadCountRef.current;
      const alreadyRead =
        priorLatest.find((n) => n.id === notificationId)?.readAt != null ||
        priorPage.find((n) => n.id === notificationId)?.readAt != null;

      markReadInflight.current.add(notificationId);
      setMarkingReadIds(new Set(markReadInflight.current));
      setActionError(null);

      if (!alreadyRead) {
        const readAt = new Date().toISOString();
        setLatest((prev) => withOptimisticReadAt(prev, notificationId, readAt));
        setPageItems((prev) => withOptimisticReadAt(prev, notificationId, readAt));
        setUnreadCount((c) => decrementUnreadCount(c, 1));
      }

      try {
        await apiRef.current.markRead({ organizationId, notificationId });
        void refreshUnreadCount();
      } catch (err) {
        setLatest(priorLatest);
        setPageItems(priorPage);
        setUnreadCount(priorUnread);
        setActionError(toUserFacingNotificationsError(err));
        void refreshUnreadCount();
        void refreshLatest();
      } finally {
        markReadInflight.current.delete(notificationId);
        setMarkingReadIds(new Set(markReadInflight.current));
      }
    },
    [enabled, organizationId, refreshLatest, refreshUnreadCount]
  );

  const markAllRead = useCallback(async () => {
    if (!enabled || !organizationId.trim()) return;
    if (markingAllRead) return;

    const priorLatest = latestRef.current;
    const priorPage = pageItemsRef.current;
    const priorUnread = unreadCountRef.current;
    const readAt = new Date().toISOString();

    setMarkingAllRead(true);
    setActionError(null);
    setLatest((prev) => withAllOptimisticReadAt(prev, readAt));
    setPageItems((prev) => withAllOptimisticReadAt(prev, readAt));
    setUnreadCount(0);

    try {
      await apiRef.current.markAllRead({ organizationId });
      void refreshUnreadCount();
    } catch (err) {
      setActionError(toUserFacingNotificationsError(err));
      setLatest(priorLatest);
      setPageItems(priorPage);
      setUnreadCount(priorUnread);
      void refreshUnreadCount();
      void refreshLatest();
      void loadInitialPage();
    } finally {
      setMarkingAllRead(false);
    }
  }, [
    enabled,
    loadInitialPage,
    markingAllRead,
    organizationId,
    refreshLatest,
    refreshUnreadCount,
  ]);

  // Initial unread + org change refetch
  useEffect(() => {
    if (!enabled || !organizationId.trim()) return;
    void refreshUnreadCount();
  }, [enabled, organizationId, refreshUnreadCount]);

  // Poll + focus + visibility
  useEffect(() => {
    if (!enabled || !organizationId.trim()) return;

    const pollMs = Math.max(5_000, unreadPollIntervalMs);

    const onFocus = () => {
      void refreshUnreadCount();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void refreshUnreadCount();
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    const id = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }
      void refreshUnreadCount();
    }, pollMs);

    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, organizationId, refreshUnreadCount, unreadPollIntervalMs]);

  // Cancel on unmount / org change
  useEffect(() => {
    return () => {
      unreadAbort.current?.abort();
      latestAbort.current?.abort();
      pageAbort.current?.abort();
    };
  }, [organizationId]);

  return {
    unreadCount,
    latest,
    pageItems,
    nextCursor,
    hasMore,
    unreadLoading,
    latestLoading,
    pageLoading,
    loadMoreLoading,
    markingAllRead,
    markingReadIds,
    unreadError,
    latestError,
    pageError,
    actionError,
    refreshUnreadCount,
    refreshLatest,
    loadInitialPage,
    loadMore,
    markRead,
    markAllRead,
    clearActionError,
  };
}
