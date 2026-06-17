import { hasAppPlanCapability, type AppPlanCapabilityKey } from './appPlanCatalog';
import type { SaaSEntitlementSnapshot } from './entitlementSnapshot';

export function isAppEntitlementActive(
  snapshot: SaaSEntitlementSnapshot | null | undefined
): boolean {
  return snapshot?.subscriptionActive === true;
}

export function hasActiveAppPlan(
  snapshot: SaaSEntitlementSnapshot | null | undefined,
  planSlug: string
): boolean {
  if (!isAppEntitlementActive(snapshot)) return false;
  return snapshot!.planSlugNormalized === planSlug.trim().toLowerCase();
}

export function hasAppEntitlementCapability(
  snapshot: SaaSEntitlementSnapshot | null | undefined,
  capability: AppPlanCapabilityKey
): boolean {
  if (!isAppEntitlementActive(snapshot)) return false;
  return hasAppPlanCapability(snapshot!.appSlug, snapshot!.planSlugNormalized, capability);
}

export function inactiveAppEntitlementSnapshot(appSlug: string): SaaSEntitlementSnapshot {
  const slug = appSlug.trim().toLowerCase();
  return {
    appSlug: slug,
    subscriptionActive: false,
    planCodeOriginal: '',
    planSlugNormalized: '',
    entitlementStatus: '',
    effectiveFrom: null,
    effectiveTo: null,
    resolutionSource: 'platform_tables',
  };
}
