import { findAppPlanCatalogEntry } from '../appPlanCatalog';
import type { SaaSEntitlementSnapshot } from '../entitlementSnapshot';
import { isPlatformEntitlementStatusGrantingAccess } from '../platformAppMirrorResolution';
import { parseSaaSEntitlementSnapshotJson } from '../parseEntitlementSnapshot';
import type { OrganizationSettingsAppAccess } from './types';
import {
  formatPlatformAppDisplayName,
  resolvePlanBadgeVariant,
  resolveStatusBadgeVariant,
} from './platformAppBillingCatalog';
export function formatPlanDisplayName(appSlug: string, planSlug: string): string {
  const normalizedPlan = planSlug.trim().toLowerCase();
  const catalog = findAppPlanCatalogEntry(appSlug, normalizedPlan);
  if (catalog != null) return catalog.displayName;
  if (normalizedPlan === '') return '—';
  return normalizedPlan.charAt(0).toUpperCase() + normalizedPlan.slice(1);
}

export function formatBillingDate(iso: string | null | undefined): string | null {
  if (iso == null || iso.trim() === '') return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

export function daysRemainingUntil(iso: string | null | undefined, now = new Date()): number | null {
  if (iso == null || iso.trim() === '') return null;
  const end = new Date(iso);
  if (Number.isNaN(end.getTime())) return null;
  const ms = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

export function buildBillingPlanLabel(
  appSlug: string,
  planSlug: string,
  entitlementStatus: string
): string {
  const planName = formatPlanDisplayName(appSlug, planSlug);
  if (entitlementStatus.trim().toLowerCase() === 'trial') {
    return `${planName} Trial`;
  }
  return planName;
}

export function mapEntitlementSnapshotToBillingApp(
  snapshot: SaaSEntitlementSnapshot,
  now = new Date()
): OrganizationSettingsAppAccess | null {
  if (!isPlatformEntitlementStatusGrantingAccess(snapshot.entitlementStatus)) {
    return null;
  }

  const appSlug = snapshot.appSlug.trim().toLowerCase();
  const planSlug =
    snapshot.planSlugNormalized.trim() !== ''
      ? snapshot.planSlugNormalized.trim().toLowerCase()
      : snapshot.planCodeOriginal.trim().toLowerCase();
  const status = snapshot.entitlementStatus.trim().toLowerCase();
  const isTrial = status === 'trial';
  const trialEndIso = snapshot.trialEnd ?? (isTrial ? snapshot.effectiveTo : null);
  const nextBillingIso = snapshot.currentPeriodEnd ?? snapshot.effectiveTo;
  const trialEndsLabel = formatBillingDate(trialEndIso);
  const nextBillingDateLabel = formatBillingDate(nextBillingIso);
  const daysRemaining = isTrial ? daysRemainingUntil(trialEndIso, now) : null;

  return {
    id: appSlug,
    appSlug,
    name: formatPlatformAppDisplayName(appSlug),
    planSlug,
    planLabel: buildBillingPlanLabel(appSlug, planSlug, snapshot.entitlementStatus),
    planBadgeVariant: resolvePlanBadgeVariant(planSlug),
    statusLabel: isTrial ? 'Trial' : 'Active',
    statusBadgeVariant: resolveStatusBadgeVariant(snapshot.entitlementStatus),
    actionLabel: 'Manage Subscription',
    isActive: true,
    entitlementStatus: snapshot.entitlementStatus,
    trialEndsLabel,
    daysRemaining,
    nextBillingDateLabel,
    manageEnabled: true,
  };
}

function normalizeEntitlementEntry(raw: unknown): unknown {
  if (raw == null || typeof raw !== 'object') return raw;
  const o = raw as Record<string, unknown>;
  if (o.entitlement != null && typeof o.entitlement === 'object') {
    return o.entitlement;
  }
  return raw;
}

export function mapEntitlementsRecordToBillingApps(
  entitlements: Readonly<Record<string, unknown>>,
  now = new Date()
): OrganizationSettingsAppAccess[] {
  const billingApps: OrganizationSettingsAppAccess[] = [];
  for (const [appKey, rawValue] of Object.entries(entitlements)) {
    const raw = normalizeEntitlementEntry(rawValue);
    const snapshot = parseSaaSEntitlementSnapshotJson(raw, appKey);
    if (snapshot == null) continue;
    const billingApp = mapEntitlementSnapshotToBillingApp(snapshot, now);
    if (billingApp != null) {
      billingApps.push(billingApp);
    }
  }
  billingApps.sort((a, b) => a.name.localeCompare(b.name));
  return billingApps;
}
