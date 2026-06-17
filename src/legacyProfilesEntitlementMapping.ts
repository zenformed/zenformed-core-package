import type { SaaSEntitlementSnapshot } from './entitlementSnapshot';
import { normalizePlanSlug } from './planNormalization';

/**
 * Inert legacy mapper — profile columns are no longer authoritative for app tier gating.
 * Returns an inactive snapshot; kept for compatibility with callers that still invoke it.
 */
export function mapLegacyProfilesFieldsToSnapshot(
  _fields: {
    subscription_status?: unknown;
    license_tier?: unknown;
  },
  appSlug = ''
): SaaSEntitlementSnapshot {
  return {
    appSlug: appSlug.trim().toLowerCase(),
    subscriptionActive: false,
    planCodeOriginal: '',
    planSlugNormalized: '',
    entitlementStatus: '',
    effectiveFrom: null,
    effectiveTo: null,
    resolutionSource: 'legacy_profiles',
  };
}

/**
 * Diagnostic-only mapper for parity tools comparing profiles columns vs platform entitlements.
 * Not used for product access or feature gating.
 */
export function mapLegacyProfilesFieldsToDiagnosticSnapshot(
  fields: {
    subscription_status?: unknown;
    license_tier?: unknown;
  },
  appSlug: string
): SaaSEntitlementSnapshot {
  const subscriptionActive =
    typeof fields.subscription_status === 'string' &&
    fields.subscription_status.trim().toLowerCase() === 'active';

  const planCodeOriginal =
    fields.license_tier === 'PRO' ? 'PRO' : fields.license_tier === 'STANDARD' ? 'STANDARD' : '';
  const normalizedAppSlug = appSlug.trim().toLowerCase();

  return {
    appSlug: normalizedAppSlug,
    subscriptionActive,
    planCodeOriginal,
    planSlugNormalized: normalizePlanSlug(normalizedAppSlug, planCodeOriginal),
    entitlementStatus: subscriptionActive ? 'active' : 'inactive',
    effectiveFrom: null,
    effectiveTo: null,
    resolutionSource: 'legacy_profiles',
    ...(planCodeOriginal !== '' ? { licenseTier: planCodeOriginal } : {}),
  };
}
