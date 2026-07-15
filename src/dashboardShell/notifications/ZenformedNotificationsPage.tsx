'use client';

import { useEffect, type ReactElement } from 'react';
import { ZenformedNotificationItem } from './ZenformedNotificationItem';
import type { ZenformedNotificationsApi } from './types';
import { useZenformedNotificationsController } from './useZenformedNotificationsController';
import styles from './notifications.module.css';

export type ZenformedNotificationsPageProps = {
  readonly organizationId: string;
  readonly api: ZenformedNotificationsApi;
  readonly onNavigate: (destinationUrl: string) => void;
  readonly unreadPollIntervalMs?: number;
};

/**
 * Shared notifications page body. Host apps mount this at `/notifications`.
 */
export function ZenformedNotificationsPage({
  organizationId,
  api,
  onNavigate,
  unreadPollIntervalMs,
}: ZenformedNotificationsPageProps): ReactElement {
  const controller = useZenformedNotificationsController({
    organizationId,
    api,
    enabled: Boolean(organizationId.trim()),
    unreadPollIntervalMs,
  });

  useEffect(() => {
    void controller.loadInitialPage();
    void controller.refreshUnreadCount();
  }, [organizationId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.page} data-zenformed-notifications-page>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Notifications</h1>
        <button
          type="button"
          className={styles.markAllBtn}
          disabled={controller.unreadCount === 0 || controller.markingAllRead}
          onClick={() => void controller.markAllRead()}
        >
          Mark all as read
        </button>
      </div>

      {controller.actionError ? (
        <p className={styles.actionError} role="status">
          {controller.actionError}
        </p>
      ) : null}

      {controller.pageLoading && controller.pageItems.length === 0 ? (
        <div className={styles.stateBlock} role="status">
          <div className={styles.spinner} aria-hidden />
          <p className={styles.stateCopy}>Loading notifications…</p>
        </div>
      ) : controller.pageError && controller.pageItems.length === 0 ? (
        <div className={styles.stateBlock} role="alert">
          <p className={styles.stateTitle}>Couldn’t load notifications</p>
          <p className={styles.stateCopy}>{controller.pageError}</p>
          <button
            type="button"
            className={styles.retryBtn}
            onClick={() => void controller.loadInitialPage()}
          >
            Retry
          </button>
        </div>
      ) : controller.pageItems.length === 0 ? (
        <div className={styles.stateBlock}>
          <p className={styles.stateTitle}>No notifications yet</p>
          <p className={styles.stateCopy}>
            New updates from Zenformed apps will appear here.
          </p>
        </div>
      ) : (
        <>
          <ul className={`${styles.list} ${styles.pageList}`}>
            {controller.pageItems.map((n) => (
              <li key={n.id} className={styles.pageItem}>
                <ZenformedNotificationItem
                  notification={n}
                  density="page"
                  markingRead={controller.markingReadIds.has(n.id)}
                  onMarkRead={(id) => void controller.markRead(id)}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>

          {controller.hasMore ? (
            <button
              type="button"
              className={styles.loadMoreBtn}
              disabled={controller.loadMoreLoading}
              onClick={() => void controller.loadMore()}
            >
              {controller.loadMoreLoading ? 'Loading…' : 'Load more'}
            </button>
          ) : null}

          {controller.pageError ? (
            <div className={styles.stateBlock} role="alert">
              <p className={styles.stateCopy}>{controller.pageError}</p>
              <button
                type="button"
                className={styles.retryBtn}
                onClick={() => void controller.loadMore()}
              >
                Retry
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
