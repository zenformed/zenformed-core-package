/**
 * Zenformed platform capability entitlement rows — mirrors `public.platform_*` capability tables.
 * Placeholder keys only in seeds; not final SKU truth.
 */

/** `platform_capability_catalog` */
export interface PlatformCapabilityCatalogRow {
  id: string;
  app_id: string;
  capability_key: string;
  display_name: string | null;
  description: string | null;
  value_type: CapabilityValueType;
  status: CapabilityCatalogStatus;
  catalog_version: string;
  schema_version: string;
  created_at: string;
  updated_at: string;
}

export type CapabilityValueType = 'boolean' | 'number' | 'string' | 'json';

export type CapabilityCatalogStatus = 'active' | 'deprecated';

/** `platform_plan_capability_defaults` */
export interface PlatformPlanCapabilityDefaultRow {
  id: string;
  app_id: string;
  plan_code: string;
  capability_id: string;
  value_boolean: boolean | null;
  value_number: string | number | null;
  value_string: string | null;
  value_json: unknown;
  catalog_version: string;
  created_at: string;
  updated_at: string;
}

/** `platform_entitlement_capability_grants` */
export interface PlatformEntitlementCapabilityGrantRow {
  id: string;
  platform_app_entitlement_id: string;
  capability_id: string;
  grant_source: CapabilityGrantSource;
  value_boolean: boolean | null;
  value_number: string | number | null;
  value_string: string | null;
  value_json: unknown;
  status: CapabilityGrantStatus;
  effective_from: string | null;
  effective_to: string | null;
  created_at: string;
  updated_at: string;
}

export type CapabilityGrantSource =
  | 'plan_backfill'
  | 'addon'
  | 'bundle'
  | 'manual'
  | 'migration';

export type CapabilityGrantStatus = 'active' | 'revoked';

/** `platform_entitlement_capability_overrides` */
export interface PlatformEntitlementCapabilityOverrideRow {
  id: string;
  platform_app_entitlement_id: string;
  capability_id: string;
  override_reason: string | null;
  value_boolean: boolean | null;
  value_number: string | number | null;
  value_string: string | null;
  value_json: unknown;
  status: CapabilityGrantStatus;
  effective_from: string | null;
  effective_to: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Canonical merged capability payload for one org×app entitlement spine.
 * Non-authoritative vs legacy `profiles` until explicit platform cutover.
 */
export interface ResolvedCapabilityPayload {
  schemaVersion: string;
  catalogVersion: string;
  appSlug: string;
  appId: string;
  organizationId: string;
  platformAppEntitlementId: string;
  planCode: string | null;
  capabilities: Record<string, unknown>;
  resolvedAt: string;
}

export interface MergeCapabilityEntitlementResult {
  capabilities: Record<string, unknown>;
  /** Active catalog capability ids that had no value after merge (should be empty when catalog + defaults + grants are consistent). */
  missingActiveCatalogCapabilityIds: string[];
  schemaVersion: string;
  catalogVersion: string;
}

/** Input for server-side capability entitlement resolver (infrastructure). */
export type ResolveCapabilityEntitlementInput =
  | { platformAppEntitlementId: string }
  | { organizationId: string; appId: string }
  | { organizationId: string; appSlug: string };

export interface ResolveCapabilityEntitlementOptions {
  /** When true, upserts `platform_resolved_entitlement_payloads` (cache — non-authoritative). Default false. */
  updateResolvedPayloadCache?: boolean;
}
