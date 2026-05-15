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
  licenseTier: 'STANDARD' | 'PRO';
  resolutionSource: SaaSEntitlementResolutionSource;
  /** Present when values come from a signed offline authorization payload. */
  offlineExpiresAt?: string;
}
