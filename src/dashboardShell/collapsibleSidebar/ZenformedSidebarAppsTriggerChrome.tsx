'use client';

import type { ReactElement, ReactNode } from 'react';
import styles from './collapsibleSidebar.module.css';
import { ZenformedSidebarAppChevrons } from './ZenformedSidebarSections';

export type ZenformedSidebarAppsTriggerChromeProps = {
  /** App icon image or node (host-resolved). */
  readonly appIcon: ReactNode;
  /** Host-resolved display name from the app registry. */
  readonly appName: string;
  /** Optional plan/tier line under the app name (host-resolved). */
  readonly appTier?: string | null;
};

/**
 * Apps-switcher trigger chrome:
 * collapsed → icon only
 * expanded → [icon] [name / tier stacked] … [chevrons]
 */
export function ZenformedSidebarAppsTriggerChrome({
  appIcon,
  appName,
  appTier,
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
      <ZenformedSidebarAppChevrons />
    </>
  );
}
