/**
 * @zenformed/core — browser-safe platform entitlement/capability surface (no `node:crypto`).
 * Supabase-backed readers + mirror query use `@supabase/supabase-js` only.
 *
 * Server-only: **`@zenformed/core/server`** — `resolveCapabilityEntitlementPayload`, `capabilitiesPayloadFingerprint`.
 *
 * Client shell: **`@zenformed/core/dashboard-shell`** — shared sidebar organization branding UI.
 */

export type {
  SaaSEntitlementResolutionSource,
  SaaSEntitlementSnapshot,
} from './entitlementSnapshot';
export type { ISaaSEntitlementReader, LoadEntitlementsForAppInput } from './entitlementReaderPort';

export { mapLegacyProfilesFieldsToSnapshot } from './legacyProfilesEntitlementMapping';

export type {
  EntitlementReaderBrowserSupabaseProvider,
  EntitlementReaderSupabaseConnection,
  EntitlementReaderSupabaseDeps,
} from './entitlementReaderSupabase';
export { createJwtAwareAnonSupabaseClient } from './entitlementReaderSupabase';

export {
  queryPlatformAppMirrorResolutionDetail,
  type PlatformAppMirrorQueryResult,
  type PlatformAppMirrorResolutionDetailInput,
  type PlatformAppMirrorResolutionQueryFn,
} from './queryPlatformAppMirrorResolutionDetail';

export { ProfilesColumnEntitlementReader } from './ProfilesColumnEntitlementReader';
export { PlatformTableEntitlementReader } from './PlatformTableEntitlementReader';

export type {
  CapabilityCatalogStatus,
  CapabilityGrantSource,
  CapabilityGrantStatus,
  CapabilityValueType,
  MergeCapabilityEntitlementResult,
  PlatformCapabilityCatalogRow,
  PlatformEntitlementCapabilityGrantRow,
  PlatformEntitlementCapabilityOverrideRow,
  PlatformPlanCapabilityDefaultRow,
  ResolveCapabilityEntitlementInput,
  ResolveCapabilityEntitlementOptions,
  ResolvedCapabilityPayload,
} from './capabilityEntitlementTypes';

export {
  mergeCapabilityEntitlementLayers,
  normalizeEntitlementPlanCode,
  pickCapabilityValue,
  type CapabilityValueColumns,
} from './mergeCapabilityEntitlementLayers';

export { resolvePlatformOrganizationPreferenceOrder } from './platformOrganizationPreference';

export {
  categorizeMirrorFailureForBatch,
  mapPlatformEntitlementRowToSnapshot,
  resolvePlatformAppEntitlementFromPrefetched,
  type PlatformAppMirrorBatchFailureCategory,
  type PlatformAppMirrorResolutionDetail,
} from './platformAppMirrorResolution';
