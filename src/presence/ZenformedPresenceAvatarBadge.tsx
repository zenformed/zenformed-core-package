'use client';

import type { ReactElement, ReactNode } from 'react';
import { ZenformedPresenceDot } from './ZenformedPresenceDot';
import type { PresenceEffectiveStatus } from './types';
import styles from './presence.module.css';

export type ZenformedPresenceAvatarBadgeProps = {
  readonly status: PresenceEffectiveStatus;
  readonly children: ReactNode;
  readonly className?: string;
  readonly announceDot?: boolean;
};

/** Wraps an avatar node and overlays the presence status dot. */
export function ZenformedPresenceAvatarBadge({
  status,
  children,
  className,
  announceDot = true,
}: ZenformedPresenceAvatarBadgeProps): ReactElement {
  return (
    <span className={[styles.avatarWithDot, className].filter(Boolean).join(' ')}>
      {children}
      <ZenformedPresenceDot
        status={status}
        className={styles.avatarDot}
        announce={announceDot}
      />
    </span>
  );
}
