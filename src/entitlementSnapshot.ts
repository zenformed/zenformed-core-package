/**
 * Narrow entitlement view for gating and tiered features (suite app context).
 */

export type SaaSEntitlementResolutionSource =
  | 'legacy_profiles'
  | 'platform_tables'
  | 'offline_snapshot'
  | 'dual_read_legacy_authoritative';

export interface SaaSEntitlementSnapshot {
  /** True when subscription is active for app entry (legacy: profiles.subscription_status). */
  subscriptionActive: boolean;
  /** App plan code (platform_app_entitlements.plan_code) or legacy profiles.license_tier when mapped. */
  licenseTier: string;
  resolutionSource: SaaSEntitlementResolutionSource;
  /** Present when values come from a signed offline authorization payload. */
  offlineExpiresAt?: string;
}
