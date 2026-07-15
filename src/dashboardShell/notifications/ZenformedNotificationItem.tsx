'use client';

import type { MouseEvent, ReactElement } from 'react';
import {
  isSafeNotificationDestinationUrl,
  warnUnsafeNotificationDestination,
} from './destinationUrlSafety';
import {
  formatNotificationAbsoluteDateTime,
  formatNotificationRelativeTime,
} from './formatNotificationRelativeTime';
import { ZenformedNotificationsCheckIcon } from './notificationIcons';
import {
  resolveNotificationAppIdentity,
  stripRedundantAppNameBodyPrefix,
} from './resolveNotificationAppIdentity';
import type { ZenformedNotification } from './types';
import styles from './notifications.module.css';

export type ZenformedNotificationItemProps = {
  readonly notification: ZenformedNotification;
  readonly density?: 'dropdown' | 'page';
  readonly markingRead?: boolean;
  readonly onMarkRead: (notificationId: string) => void;
  readonly onNavigate: (destinationUrl: string) => void;
};

export function ZenformedNotificationItem({
  notification,
  density = 'dropdown',
  markingRead = false,
  onMarkRead,
  onNavigate,
}: ZenformedNotificationItemProps): ReactElement {
  const identity = resolveNotificationAppIdentity(notification.appSlug);
  const unread = notification.readAt == null;
  const destination = notification.destinationUrl;
  const navigable = isSafeNotificationDestinationUrl(destination);
  if (destination && !navigable) {
    warnUnsafeNotificationDestination(destination);
  }

  const body = stripRedundantAppNameBodyPrefix(notification.body, identity.displayName);
  const relative = formatNotificationRelativeTime(notification.createdAt);
  const absolute = formatNotificationAbsoluteDateTime(notification.createdAt);
  const initial = identity.displayName.charAt(0).toUpperCase() || 'Z';

  const onPrimaryClick = () => {
    if (!navigable || !destination) return;
    if (unread) {
      void onMarkRead(notification.id);
    }
    onNavigate(destination);
  };

  const onCheckClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!unread || markingRead) return;
    void onMarkRead(notification.id);
  };

  const rowClass = [
    styles.item,
    unread ? styles.itemUnread : '',
    navigable ? styles.itemInteractive : '',
  ]
    .filter(Boolean)
    .join(' ');

  const main = (
    <>
      <span className={styles.appIconWrap} aria-hidden>
        {identity.iconSrc ? (
          <img className={styles.appIconImg} src={identity.iconSrc} alt="" />
        ) : (
          <span className={styles.appIconFallback}>{initial}</span>
        )}
      </span>
      <span className={styles.itemMain}>
        <span className={styles.appName}>{identity.displayName}</span>
        <span className={styles.itemTitle}>
          {notification.title}
          {unread ? <span className={styles.srOnly}> Unread notification</span> : null}
        </span>
        <span className={styles.itemBody}>{body}</span>
        <span className={styles.itemMeta}>
          <time
            className={styles.itemTime}
            dateTime={notification.createdAt}
            title={absolute || undefined}
          >
            {relative}
          </time>
        </span>
      </span>
    </>
  );

  return (
    <div className={rowClass} data-density={density}>
      {navigable ? (
        <button
          type="button"
          className={styles.itemPrimaryBtn}
          onClick={onPrimaryClick}
          aria-label={`${identity.displayName}: ${notification.title}`}
        >
          {main}
        </button>
      ) : (
        <div className={styles.itemPrimaryStatic}>{main}</div>
      )}
      {unread ? (
        <button
          type="button"
          className={styles.markReadBtn}
          aria-label="Mark notification as read"
          disabled={markingRead}
          onClick={onCheckClick}
        >
          <ZenformedNotificationsCheckIcon />
        </button>
      ) : (
        <span className={styles.markReadSlot} aria-hidden />
      )}
    </div>
  );
}
