'use client';

import type { ReactElement, ReactNode } from 'react';
import styles from './collapsibleSidebar.module.css';
import { ZenformedSidebarAppChevrons } from './ZenformedSidebarSections';

function CheckIcon(): ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
      <path d="M5.6 10.4 2.3 7.1l1.05-1.05L5.6 8.3l5.05-5.05L11.7 4.3 5.6 10.4Z" />
    </svg>
  );
}

export type ZenformedSidebarAppsTriggerChromeProps = {
  /** App icon image or node (host-resolved). */
  readonly appIcon: ReactNode;
  /** Host-resolved display name from the app registry. */
  readonly appName: string;
  /** Optional plan/tier line under the app name (host-resolved). */
  readonly appTier?: string | null;
  /** When the switcher overlay is open, show a check instead of chevrons. */
  readonly open?: boolean;
};

/**
 * Apps-switcher trigger chrome:
 * collapsed → icon only
 * expanded → [icon] [name / tier stacked] … [chevrons | check when open]
 */
export function ZenformedSidebarAppsTriggerChrome({
  appIcon,
  appName,
  appTier,
  open = false,
}: ZenformedSidebarAppsTriggerChromeProps): ReactElement {
  const name = appName.trim();
  const tier = appTier?.trim() || null;
  return (
    <>
      <span className={styles.appTriggerIcon}>{appIcon}</span>
      {name ? (
        <span className={styles.appTriggerText}>
          <span className={styles.appTriggerName} title={name}>
            {name}
          </span>
          {tier ? (
            <span className={styles.appTriggerTier} title={tier}>
              {tier}
            </span>
          ) : null}
        </span>
      ) : null}
      {open ? (
        <span className={`${styles.appChevrons} ${styles.appTriggerCheck}`} aria-hidden>
          <CheckIcon />
        </span>
      ) : (
        <ZenformedSidebarAppChevrons />
      )}
    </>
  );
}
