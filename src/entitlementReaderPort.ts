import type { SaaSEntitlementSnapshot } from './entitlementSnapshot';

/**
 * Suite app context for entitlement reads (mirrors `platform_apps.slug` / `platform_app_entitlements.app_id`).
 */
export interface LoadEntitlementsForAppInput {
  userId: string;
  /** `platform_apps.slug` for the entitled product (e.g. `forgecore`). */
  appSlug: string;
  /** Supabase JWT when using PostgREST as that user (e.g. Bearer from session). */
  accessToken?: string | null;
}

/**
 * Loads entitlement snapshot for the authenticated user for a given suite app.
 * Implementations may use legacy profiles, platform tables, or offline snapshots.
 */
export interface ISaaSEntitlementReader {
  loadEntitlementsForApp(input: LoadEntitlementsForAppInput): Promise<SaaSEntitlementSnapshot | null>;
}
