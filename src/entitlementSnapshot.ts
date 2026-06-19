/**
 * Narrow entitlement view for gating and tiered features (suite app context).
 */

export type SaaSEntitlementResolutionSource =
  | 'legacy_profiles'
  | 'platform_tables'
  | 'offline_snapshot'
  | 'dual_read_legacy_authoritative';

export interface SaaSEntitlementSnapshot {
  /** Suite app slug (e.g. forgecore, buildcore). */
  appSlug: string;
  /** True when subscription is active for app entry. */
  subscriptionActive: boolean;
  /** Raw `platform_app_entitlements.plan_code` (or legacy profile value when inert). */
  planCodeOriginal: string;
  /** Catalog-normalized plan slug for UI/gating (e.g. pro, starter). */
  planSlugNormalized: string;
  /** Mirrored entitlement lifecycle status. */
  entitlementStatus: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  /** Stripe trial end from platform_subscriptions when available. */
  trialEnd?: string | null;
  /** Stripe current period end / next billing date when available. */
  currentPeriodEnd?: string | null;
  resolutionSource: SaaSEntitlementResolutionSource;
  /** Present when values come from a signed offline authorization payload. */
  offlineExpiresAt?: string;
  /**
   * @deprecated Use `planCodeOriginal` / `planSlugNormalized`. Kept for transitional wire compat.
   */
  licenseTier?: string;
}
