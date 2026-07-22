'use client';

import type { ReactElement } from 'react';
import {
  PRESENCE_EFFECTIVE_STATUS_LABELS,
  type PresenceEffectiveStatus,
} from './types';
import styles from './presence.module.css';

export type ZenformedPresenceDotProps = {
  readonly status: PresenceEffectiveStatus;
  readonly className?: string;
  readonly title?: string;
  /** When false, omit accessible label (parent provides it). Default true. */
  readonly announce?: boolean;
};

export function ZenformedPresenceDot({
  status,
  className,
  title,
  announce = true,
}: ZenformedPresenceDotProps): ReactElement {
  const label = title ?? PRESENCE_EFFECTIVE_STATUS_LABELS[status];
  const statusClass =
    status === 'online'
      ? styles.dotOnline
      : status === 'away'
        ? styles.dotAway
        : status === 'busy'
          ? styles.dotBusy
          : styles.dotOffline;

  return (
    <span
      className={[styles.dot, statusClass, className].filter(Boolean).join(' ')}
      title={label}
      aria-label={announce ? label : undefined}
      aria-hidden={announce ? undefined : true}
    />
  );
}
