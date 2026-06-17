import { normalizePlanSlug, resolvePlanCodeOriginal } from './planNormalization';
import type {
  SaaSEntitlementResolutionSource,
  SaaSEntitlementSnapshot,
} from './entitlementSnapshot';

const RESOLUTION_SOURCES = new Set<SaaSEntitlementResolutionSource>([
  'legacy_profiles',
  'platform_tables',
  'offline_snapshot',
  'dual_read_legacy_authoritative',
]);

function readOptionalString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * Parse entitlement JSON from BFF / Core relay / platform mirror responses.
 * Accepts legacy `licenseTier`-only payloads and full app entitlement snapshots.
 */
export function parseSaaSEntitlementSnapshotJson(
  raw: unknown,
  fallbackAppSlug?: string
): SaaSEntitlementSnapshot | null {
  if (raw == null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.subscriptionActive !== 'boolean') return null;

  const src = o.resolutionSource;
  if (typeof src !== 'string' || !RESOLUTION_SOURCES.has(src as SaaSEntitlementResolutionSource)) {
    return null;
  }

  const offline = o.offlineExpiresAt;
  if (offline != null && typeof offline !== 'string') return null;

  const appSlugRaw =
    typeof o.appSlug === 'string' && o.appSlug.trim() !== ''
      ? o.appSlug.trim().toLowerCase()
      : (fallbackAppSlug?.trim().toLowerCase() ?? '');

  const planCodeOriginal =
    typeof o.planCodeOriginal === 'string'
      ? resolvePlanCodeOriginal(o.planCodeOriginal)
      : typeof o.licenseTier === 'string'
        ? resolvePlanCodeOriginal(o.licenseTier)
        : '';

  const planSlugNormalized =
    typeof o.planSlugNormalized === 'string' && o.planSlugNormalized.trim() !== ''
      ? o.planSlugNormalized.trim().toLowerCase()
      : normalizePlanSlug(appSlugRaw, planCodeOriginal);

  const entitlementStatus =
    typeof o.entitlementStatus === 'string' ? o.entitlementStatus : '';

  const effectiveFrom =
    o.effectiveFrom === null ? null : readOptionalString(o.effectiveFrom);
  const effectiveTo =
    o.effectiveTo === null ? null : readOptionalString(o.effectiveTo);

  return {
    appSlug: appSlugRaw,
    subscriptionActive: o.subscriptionActive,
    planCodeOriginal,
    planSlugNormalized,
    entitlementStatus,
    effectiveFrom,
    effectiveTo,
    resolutionSource: src as SaaSEntitlementResolutionSource,
    ...(typeof offline === 'string' ? { offlineExpiresAt: offline } : {}),
    ...(planCodeOriginal !== '' ? { licenseTier: planCodeOriginal } : {}),
  };
}
