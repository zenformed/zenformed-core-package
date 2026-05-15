/**
 * Server-side capability entitlement resolver — loads platform catalog / plan defaults /
 * grants / overrides and merges via {@link mergeCapabilityEntitlementLayers}.
 *
 * Does **not** imply product runtime authority; callers choose the Supabase client (RLS vs privileged server client).
 * Cache upserts run only when {@link ResolveCapabilityEntitlementOptions.updateResolvedPayloadCache} is `true`.
 */

import { createHash } from 'node:crypto';
import type { CapabilityEntitlementResolverDataClient } from './capabilityEntitlementResolverInjection';
import type {
  PlatformCapabilityCatalogRow,
  PlatformEntitlementCapabilityGrantRow,
  PlatformEntitlementCapabilityOverrideRow,
  PlatformPlanCapabilityDefaultRow,
  ResolvedCapabilityPayload,
  ResolveCapabilityEntitlementInput,
  ResolveCapabilityEntitlementOptions,
} from './capabilityEntitlementTypes';
import { mergeCapabilityEntitlementLayers, normalizeEntitlementPlanCode } from './mergeCapabilityEntitlementLayers';

interface SpineRow {
  id: string;
  organization_id: string;
  app_id: string;
  plan_code: string | null;
  capabilities_revision: string | null;
}

interface AppRow {
  id: string;
  slug: string;
}

/** Stable SHA-256 over sorted capability keys (matches `platform_resolved_entitlement_payloads.payload_hash`). */
export function capabilitiesPayloadFingerprint(capabilities: Record<string, unknown>): string {
  const keys = Object.keys(capabilities).sort();
  const sorted = Object.fromEntries(keys.map((k) => [k, capabilities[k]]));
  return createHash('sha256').update(JSON.stringify(sorted)).digest('hex');
}

async function resolveSpineAndApp(
  supabase: CapabilityEntitlementResolverDataClient,
  input: ResolveCapabilityEntitlementInput
): Promise<{ spine: SpineRow; app: AppRow }> {
  if ('platformAppEntitlementId' in input) {
    const { data: spine, error: sErr } = await supabase
      .from('platform_app_entitlements')
      .select('id, organization_id, app_id, plan_code, capabilities_revision')
      .eq('id', input.platformAppEntitlementId)
      .maybeSingle();

    if (sErr || spine == null) {
      throw new Error(
        `platform_app_entitlements row not found for id=${input.platformAppEntitlementId}: ${sErr?.message ?? ''}`
      );
    }

    const { data: app, error: aErr } = await supabase
      .from('platform_apps')
      .select('id, slug')
      .eq('id', spine.app_id)
      .maybeSingle();

    if (aErr || app == null) {
      throw new Error(`platform_apps row not found for app_id=${spine.app_id}: ${aErr?.message ?? ''}`);
    }

    return { spine: spine as SpineRow, app: app as AppRow };
  }

  if ('appSlug' in input) {
    const { data: app, error: aErr } = await supabase
      .from('platform_apps')
      .select('id, slug')
      .eq('slug', input.appSlug)
      .maybeSingle();

    if (aErr || app == null) {
      throw new Error(`platform_apps row not found for slug=${input.appSlug}: ${aErr?.message ?? ''}`);
    }

    const { data: spine, error: sErr } = await supabase
      .from('platform_app_entitlements')
      .select('id, organization_id, app_id, plan_code, capabilities_revision')
      .eq('organization_id', input.organizationId)
      .eq('app_id', app.id)
      .maybeSingle();

    if (sErr || spine == null) {
      throw new Error(
        `platform_app_entitlements not found for organization_id=${input.organizationId} app_slug=${input.appSlug}: ${sErr?.message ?? ''}`
      );
    }

    return { spine: spine as SpineRow, app: app as AppRow };
  }

  const { data: spine, error: sErr } = await supabase
    .from('platform_app_entitlements')
    .select('id, organization_id, app_id, plan_code, capabilities_revision')
    .eq('organization_id', input.organizationId)
    .eq('app_id', input.appId)
    .maybeSingle();

  if (sErr || spine == null) {
    throw new Error(
      `platform_app_entitlements not found for organization_id=${input.organizationId} app_id=${input.appId}: ${sErr?.message ?? ''}`
    );
  }

  const { data: app, error: aErr } = await supabase
    .from('platform_apps')
    .select('id, slug')
    .eq('id', spine.app_id)
    .maybeSingle();

  if (aErr || app == null) {
    throw new Error(`platform_apps row not found for app_id=${spine.app_id}: ${aErr?.message ?? ''}`);
  }

  return { spine: spine as SpineRow, app: app as AppRow };
}

/**
 * Resolve merged capability payload for one org×app entitlement spine.
 *
 * @param supabase — privileged server client for batch reads (typically **ZenformedCore** workers), or **user JWT** client when RLS allows reads.
 */
export async function resolveCapabilityEntitlementPayload(
  supabase: CapabilityEntitlementResolverDataClient,
  input: ResolveCapabilityEntitlementInput,
  options?: ResolveCapabilityEntitlementOptions
): Promise<{
  payload: ResolvedCapabilityPayload;
  missingActiveCatalogCapabilityIds: string[];
  cacheUpdated: boolean;
}> {
  const updateResolvedPayloadCache = options?.updateResolvedPayloadCache === true;

  const { spine, app } = await resolveSpineAndApp(supabase, input);

  const { data: catalogRows, error: cErr } = await supabase
    .from('platform_capability_catalog')
    .select('*')
    .eq('app_id', spine.app_id)
    .eq('status', 'active');

  if (cErr) {
    throw new Error(`platform_capability_catalog: ${cErr.message}`);
  }

  const catalogById = new Map<string, PlatformCapabilityCatalogRow>();
  const activeCatalogIds: string[] = [];
  for (const row of catalogRows ?? []) {
    const r = row as PlatformCapabilityCatalogRow;
    catalogById.set(r.id, r);
    activeCatalogIds.push(r.id);
  }

  const { data: planDefaultRows, error: pdErr } = await supabase
    .from('platform_plan_capability_defaults')
    .select('*')
    .eq('app_id', spine.app_id);

  if (pdErr) {
    throw new Error(`platform_plan_capability_defaults: ${pdErr.message}`);
  }

  const { data: grantRows, error: gErr } = await supabase
    .from('platform_entitlement_capability_grants')
    .select('*')
    .eq('platform_app_entitlement_id', spine.id);

  if (gErr) {
    throw new Error(`platform_entitlement_capability_grants: ${gErr.message}`);
  }

  const { data: overrideRows, error: oErr } = await supabase
    .from('platform_entitlement_capability_overrides')
    .select('*')
    .eq('platform_app_entitlement_id', spine.id);

  if (oErr) {
    throw new Error(`platform_entitlement_capability_overrides: ${oErr.message}`);
  }

  const effectivePlanCode = normalizeEntitlementPlanCode(spine.plan_code);

  const merged = mergeCapabilityEntitlementLayers({
    catalogById,
    activeCatalogIds,
    effectivePlanCode,
    planDefaults: (planDefaultRows ?? []) as PlatformPlanCapabilityDefaultRow[],
    grants: (grantRows ?? []) as PlatformEntitlementCapabilityGrantRow[],
    overrides: (overrideRows ?? []) as PlatformEntitlementCapabilityOverrideRow[],
  });

  const resolvedAt = new Date().toISOString();

  const payload: ResolvedCapabilityPayload = {
    schemaVersion: merged.schemaVersion,
    catalogVersion: merged.catalogVersion,
    appSlug: app.slug,
    appId: app.id,
    organizationId: spine.organization_id,
    platformAppEntitlementId: spine.id,
    planCode: spine.plan_code,
    capabilities: merged.capabilities,
    resolvedAt,
  };

  let cacheUpdated = false;

  if (updateResolvedPayloadCache) {
    const fingerprint = capabilitiesPayloadFingerprint(merged.capabilities);
    const cacheBody = {
      ...payload,
      missingActiveCatalogCapabilityIds: merged.missingActiveCatalogCapabilityIds,
      capabilitiesRevision: spine.capabilities_revision ?? null,
    };

    const { error: cacheErr } = await supabase.from('platform_resolved_entitlement_payloads').upsert(
      {
        platform_app_entitlement_id: spine.id,
        schema_version: payload.schemaVersion,
        catalog_version: payload.catalogVersion,
        payload_json: cacheBody as unknown as Record<string, unknown>,
        payload_hash: fingerprint,
        computed_at: resolvedAt,
        updated_at: resolvedAt,
      },
      { onConflict: 'platform_app_entitlement_id' }
    );

    if (cacheErr) {
      throw new Error(`platform_resolved_entitlement_payloads upsert: ${cacheErr.message}`);
    }

    cacheUpdated = true;
  }

  return {
    payload,
    missingActiveCatalogCapabilityIds: merged.missingActiveCatalogCapabilityIds,
    cacheUpdated,
  };
}
