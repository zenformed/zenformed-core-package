import type { SaaSEntitlementSnapshot } from './entitlementSnapshot';

/**
 * Pure mapping from legacy `profiles` entitlement columns.
 * Snapshot consumers (`getLicenseTierFromSnapshot`, etc.) read only `SaaSEntitlementSnapshot` fields produced here.
 * - active ⇔ typeof subscription_status === 'string' && trim(lower) === 'active'
 * - PRO only when license_tier === 'PRO', else STANDARD
 */
export function mapLegacyProfilesFieldsToSnapshot(fields: {
  subscription_status?: unknown;
  license_tier?: unknown;
}): SaaSEntitlementSnapshot {
  const subscriptionActive =
    typeof fields.subscription_status === 'string' &&
    fields.subscription_status.trim().toLowerCase() === 'active';

  const licenseTier = fields.license_tier === 'PRO' ? 'PRO' : 'STANDARD';

  return {
    subscriptionActive,
    licenseTier,
    resolutionSource: 'legacy_profiles',
  };
}
