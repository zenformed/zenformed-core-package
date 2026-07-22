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

export { mapLegacyProfilesFieldsToSnapshot, mapLegacyProfilesFieldsToDiagnosticSnapshot } from './legacyProfilesEntitlementMapping';

export type {
  NormalizedPlanSlug,
  AppPlanCapabilityKey,
  AppPlanCatalogEntry,
} from './appPlanCatalog';
export {
  PLATFORM_APP_PLAN_CATALOG,
  normalizeAppSlug,
  getAppPlanCatalogEntries,
  findAppPlanCatalogEntry,
  listPurchasablePlansForApp,
  hasAppPlanCapability,
} from './appPlanCatalog';

export { normalizePlanSlug, resolvePlanCodeOriginal } from './planNormalization';

export {
  isAppEntitlementActive,
  hasActiveAppPlan,
  hasAppEntitlementCapability,
  inactiveAppEntitlementSnapshot,
} from './appEntitlementAccess';

export { parseSaaSEntitlementSnapshotJson } from './parseEntitlementSnapshot';

export type {
  EntitlementReaderBrowserSupabaseProvider,
  EntitlementReaderSupabaseConnection,
  EntitlementReaderSupabaseDeps,
} from './entitlementReaderSupabase';
export { createJwtAwareAnonSupabaseClient } from './entitlementReaderSupabase';

export {
  getOrCreateBrowserSupabaseAuthClient,
  type BrowserSupabaseAuthClientConfig,
} from './browserSupabaseAuthClient';

export {
  resolveSaasProfileAuthReaction,
  shouldApplyAuthCallbackSession,
  shouldShowSaasProfileFullPageLoading,
  type ResolveSaasProfileAuthReactionInput,
  type SaasProfileAuthReaction,
  type SessionWithAccessToken,
} from './saasProfileAuthSync';

export {
  classifySupabaseAuthInvalidation,
  getSessionEndMessage,
  saveSessionEndReason,
  markVoluntarySignOut,
  clearSessionEndReason,
  consumeSessionEndReason,
  peekSessionEndReason,
  parseSessionEndReasonParam,
  resolveSessionEndMessageForLogin,
  appendSessionEndToLoginUrl,
  recordSessionInvalidation,
  recordUnexpectedSignedOut,
  ZENFORMED_SESSION_END_STORAGE_KEY,
  ZENFORMED_SESSION_END_QUERY_PARAM,
  type SessionEndReason,
} from './auth/sessionInvalidation';

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
  isPlatformEntitlementStatusGrantingAccess,
  mapPlatformEntitlementRowToSnapshot,
  resolvePlatformAppEntitlementFromPrefetched,
  type PlatformAppMirrorBatchFailureCategory,
  type PlatformAppMirrorResolutionDetail,
} from './platformAppMirrorResolution';
