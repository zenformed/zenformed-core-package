'use client';

import { useEffect, type ReactElement } from 'react';
import { useAccountMenuState } from '../useAccountMenuState';
import { ZENFORMED_DROPDOWN_SURFACE_BORDER_STYLE } from '../dropdownSurfaceBorderStyle';
import { useZenformedSidebarPresentation } from '../collapsibleSidebar/sidebarPresentationContext';
import { ZenformedNotificationItem } from './ZenformedNotificationItem';
import { ZenformedNotificationsEnvelopeIcon } from './notificationIcons';
import {
  formatNotificationsTriggerAriaLabel,
  formatUnreadBadgeLabel,
} from './notificationStateHelpers';
import type { ZenformedDashboardNotificationsConfig } from './types';
import { useZenformedNotificationsController } from './useZenformedNotificationsController';
import styles from './notifications.module.css';

export type ZenformedNotificationsMenuProps = ZenformedDashboardNotificationsConfig & {
  /** When set, show this label beside the envelope (sidebar expanded). */
  readonly sidebarLabel?: string;
  readonly onOpenChange?: (open: boolean) => void;
};

export function ZenformedNotificationsMenu({
  organizationId,
  api,
  notificationsPageHref,
  onNavigate,
  unreadPollIntervalMs,
  sidebarLabel,
  onOpenChange,
}: ZenformedNotificationsMenuProps): ReactElement {
  const { accountMenuOpen, setAccountMenuOpen, accountMenuRef, closeAccountMenu } =
    useAccountMenuState();

  // Controller mounts with the envelope control (not the open dropdown). Unread
  // count fetch + 30s polling run independently of `accountMenuOpen`.
  const controller = useZenformedNotificationsController({
    organizationId,
    api,
    enabled: Boolean(organizationId.trim()),
    unreadPollIntervalMs,
  });

  useEffect(() => {
    onOpenChange?.(accountMenuOpen);
  }, [accountMenuOpen, onOpenChange]);

  useEffect(() => {
    if (!accountMenuOpen) return;
    void controller.refreshLatest();
    void controller.refreshUnreadCount();
  }, [accountMenuOpen]); // eslint-disable-line react-hooks/exhaustive-deps -- latest refresh on open only

  useEffect(() => {
    if (!accountMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAccountMenu();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [accountMenuOpen, closeAccountMenu]);

  const badge = formatUnreadBadgeLabel(controller.unreadCount);
  const triggerLabel = formatNotificationsTriggerAriaLabel(controller.unreadCount);
  const showMarkAll =
    controller.unreadCount > 0 || controller.markingAllRead;
  const presentation = useZenformedSidebarPresentation();
  const navigateOnOpen = presentation === 'mobile';

  const onViewAll = () => {
    closeAccountMenu();
    onNavigate(notificationsPageHref);
  };

  const onRetryLatest = () => {
    void controller.refreshLatest();
    void controller.refreshUnreadCount();
  };

  const onTriggerClick = () => {
    if (navigateOnOpen) {
      onNavigate(notificationsPageHref);
      return;
    }
    setAccountMenuOpen((open) => !open);
  };

  return (
    <div className={styles.wrap} ref={accountMenuRef} data-zenformed-notifications-menu>
      <button
        type="button"
        className={sidebarLabel ? `${styles.trigger} ${styles.triggerWithLabel}` : styles.trigger}
        onClick={onTriggerClick}
        aria-label={triggerLabel}
        aria-expanded={navigateOnOpen ? undefined : accountMenuOpen}
        aria-haspopup={navigateOnOpen ? undefined : 'dialog'}
      >
        <span className={styles.triggerIcon}>
          <ZenformedNotificationsEnvelopeIcon />
        </span>
        {sidebarLabel ? <span className={styles.triggerLabelText}>{sidebarLabel}</span> : null}
        {badge ? (
          <span className={styles.badge} aria-hidden>
            {badge}
          </span>
        ) : null}
      </button>

      {!navigateOnOpen && accountMenuOpen ? (
        <div
          className={sidebarLabel ? `${styles.popover} ${styles.popoverFromSidebar}` : styles.popover}
          style={ZENFORMED_DROPDOWN_SURFACE_BORDER_STYLE}
          role="dialog"
          aria-label="Notifications"
        >
          <div className={styles.popoverHeader}>
            <h2 className={styles.popoverTitle}>Notifications</h2>
            <button
              type="button"
              className={styles.markAllBtn}
              disabled={!showMarkAll || controller.markingAllRead || controller.unreadCount === 0}
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

          <div className={styles.popoverBody}>
            {controller.latestLoading && controller.latest.length === 0 ? (
              <div className={styles.stateBlock} role="status">
                <div className={styles.spinner} aria-hidden />
                <p className={styles.stateCopy}>Loading notifications…</p>
              </div>
            ) : controller.latestError && controller.latest.length === 0 ? (
              <div className={styles.stateBlock} role="alert">
                <p className={styles.stateTitle}>Couldn’t load notifications</p>
                <p className={styles.stateCopy}>{controller.latestError}</p>
                <button type="button" className={styles.retryBtn} onClick={onRetryLatest}>
                  Retry
                </button>
              </div>
            ) : controller.latest.length === 0 ? (
              <div className={styles.stateBlock}>
                <p className={styles.stateTitle}>No notifications yet</p>
                <p className={styles.stateCopy}>
                  New updates from Zenformed apps will appear here.
                </p>
              </div>
            ) : (
              <ul className={styles.list}>
                {controller.latest.slice(0, 10).map((n) => (
                  <li key={n.id}>
                    <ZenformedNotificationItem
                      notification={n}
                      density="dropdown"
                      markingRead={controller.markingReadIds.has(n.id)}
                      onMarkRead={(id) => void controller.markRead(id)}
                      onNavigate={(url) => {
                        closeAccountMenu();
                        onNavigate(url);
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.popoverFooter}>
            <button type="button" className={styles.viewAllBtn} onClick={onViewAll}>
              View all notifications
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
