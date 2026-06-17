import type { ISaaSEntitlementReader, LoadEntitlementsForAppInput } from './entitlementReaderPort';
import type { SaaSEntitlementSnapshot } from './entitlementSnapshot';
import { mapLegacyProfilesFieldsToDiagnosticSnapshot } from './legacyProfilesEntitlementMapping';
import {
  createJwtAwareAnonSupabaseClient,
  type EntitlementReaderSupabaseDeps,
} from './entitlementReaderSupabase';

/**
 * Entitlement reader: JWT-scoped **`profiles.subscription_status`** + **`license_tier`**, mapped via
 * {@link mapLegacyProfilesFieldsToSnapshot} (parity / diagnostics; same snapshot shape as Core profile fallback).
 *
 * **`appSlug`:** accepted for API symmetry with {@link PlatformTableEntitlementReader}; reads are unchanged per slug
 * until per-app billing splits profile rows.
 */
export class ProfilesColumnEntitlementReader implements ISaaSEntitlementReader {
  constructor(private readonly supabaseDeps: EntitlementReaderSupabaseDeps) {}

  async loadEntitlementsForApp(input: LoadEntitlementsForAppInput): Promise<SaaSEntitlementSnapshot | null> {
    void input.appSlug;
    try {
      const supabase = createJwtAwareAnonSupabaseClient(this.supabaseDeps, input.accessToken);

      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status, license_tier')
        .eq('id', input.userId)
        .maybeSingle();

      if (error || data == null) {
        return null;
      }

      return mapLegacyProfilesFieldsToDiagnosticSnapshot(data, input.appSlug);
    } catch {
      return null;
    }
  }
}
