'use client';

import type { ReactElement } from 'react';
import type {
  BillingPlanBadgeVariant,
  BillingStatusBadgeVariant,
} from '../platformAppBillingCatalog';
import styles from './appEntitlementBadges.module.css';

export type AppEntitlementBadgesProps = {
  readonly planLabel: string;
  readonly planBadgeVariant: BillingPlanBadgeVariant;
  readonly statusLabel: string;
  readonly statusBadgeVariant: BillingStatusBadgeVariant;
  readonly className?: string;
  readonly compact?: boolean;
};

function planBadgeClassName(variant: BillingPlanBadgeVariant): string {
  const base = styles.appBillingBadge;
  switch (variant) {
    case 'starter':
      return `${base} ${styles.appBillingBadgePlanStarter}`;
    case 'growth':
      return `${base} ${styles.appBillingBadgePlanGrowth}`;
    case 'pro':
      return `${base} ${styles.appBillingBadgePlanPro}`;
    default:
      return `${base} ${styles.appBillingBadgePlanDefault}`;
  }
}

function statusBadgeClassName(variant: BillingStatusBadgeVariant): string {
  const base = styles.appBillingBadge;
  switch (variant) {
    case 'trial':
      return `${base} ${styles.appBillingBadgeStatusTrial}`;
    case 'active':
      return `${base} ${styles.appBillingBadgeStatusActive}`;
    default:
      return `${base} ${styles.appBillingBadgeStatusInactive}`;
  }
}

export function AppEntitlementBadges({
  planLabel,
  planBadgeVariant,
  statusLabel,
  statusBadgeVariant,
  className,
  compact = false,
}: AppEntitlementBadgesProps): ReactElement {
  return (
    <div
      className={[
        styles.appBillingBadges,
        compact ? styles.appBillingBadgesCompact : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {planLabel.trim() !== '' ? (
        <span className={planBadgeClassName(planBadgeVariant)}>{planLabel}</span>
      ) : null}
      {statusLabel.trim() !== '' ? (
        <span className={statusBadgeClassName(statusBadgeVariant)}>{statusLabel}</span>
      ) : null}
    </div>
  );
}
