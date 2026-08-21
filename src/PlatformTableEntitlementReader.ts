import type { ISaaSEntitlementReader, LoadEntitlementsForAppInput } from './entitlementReaderPort';
import type { SaaSEntitlementSnapshot } from './entitlementSnapshot';
import { createJwtAwareAnonSupabaseClient, type EntitlementReaderSupabaseDeps } from './entitlementReaderSupabase';
import {
  queryPlatformAppMirrorResolutionDetail,
  type PlatformAppMirrorResolutionQueryFn,
} from './queryPlatformAppMirrorResolutionDetail';

function preferredOrganizationIdFromAccessToken(accessToken: string | null | undefined): string | null {
  if (!accessToken) return null;
  try {
    const payload = accessToken.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const claims = JSON.parse(atob(padded)) as { app_metadata?: { tenant_id?: unknown } };
    const tenantId = claims.app_metadata?.tenant_id;
    return typeof tenantId === 'string' && tenantId.trim() !== '' ? tenantId.trim() : null;
  } catch {
    return null;
  }
}

/**
 * Non-authoritative entitlement reader over mirrored platform tables (`platform_*`).
 *
 * PURPOSE:
 * - Parity / dual-read vs {@link ProfilesColumnEntitlementReader} (profiles columns) or ZenformedCore HTTP.
 * - NOT wired into product gates by default; runtime gates use Core relay + optional profile-mapper fallback.
 *
 * ASSUMPTIONS / LIMITATIONS:
 * - Tables may still have RLS enabled with no policies (deny-by-default). Browser reads often return
 *   empty until explicit SELECT policies exist — callers should tolerate `null`.
 * - App row must exist in `platform_apps` for the requested **`appSlug`**, seeded per product.
 * - Multiple active memberships: deterministic resolution via `queryPlatformAppMirrorResolutionDetail`
 *   / `resolvePlatformAppEntitlementFromPrefetched` (personal-default org first, then UUID sort).
 */
export class PlatformTableEntitlementReader implements ISaaSEntitlementReader {
  constructor(
    private readonly supabaseDeps: EntitlementReaderSupabaseDeps,
    private readonly queryMirrorResolution: PlatformAppMirrorResolutionQueryFn = queryPlatformAppMirrorResolutionDetail
  ) {}

  async loadEntitlementsForApp(input: LoadEntitlementsForAppInput): Promise<SaaSEntitlementSnapshot | null> {
    try {
      const supabase = createJwtAwareAnonSupabaseClient(this.supabaseDeps, input.accessToken);

      const detail = await this.queryMirrorResolution(supabase, {
        userId: input.userId,
        appSlug: input.appSlug,
        preferredOrganizationId: preferredOrganizationIdFromAccessToken(input.accessToken),
      });
      return detail.snapshot;
    } catch {
      return null;
    }
  }
}
