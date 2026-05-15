import type {
  CapabilityValueType,
  MergeCapabilityEntitlementResult,
  PlatformCapabilityCatalogRow,
  PlatformEntitlementCapabilityGrantRow,
  PlatformEntitlementCapabilityOverrideRow,
  PlatformPlanCapabilityDefaultRow,
} from './capabilityEntitlementTypes';

/** Typed row fragments carrying value_* columns from defaults / grants / overrides. */
export type CapabilityValueColumns = {
  value_boolean: boolean | null;
  value_number: string | number | null;
  value_string: string | null;
  value_json: unknown;
};

export function pickCapabilityValue(
  valueType: CapabilityValueType,
  row: CapabilityValueColumns
): unknown {
  switch (valueType) {
    case 'boolean':
      return row.value_boolean;
    case 'number':
      if (row.value_number == null) return null;
      return typeof row.value_number === 'number' ? row.value_number : Number(row.value_number);
    case 'string':
      return row.value_string;
    case 'json':
      return row.value_json;
    default:
      return null;
  }
}

export function normalizeEntitlementPlanCode(planCode: string | null | undefined): string {
  const t = typeof planCode === 'string' ? planCode.trim() : '';
  return t !== '' ? t : 'STANDARD';
}

/**
 * Merge order: **plan defaults** (for `effectivePlanCode`) → **grants** → **overrides** (last wins per capability_id).
 * Only **active** catalog rows participate; only **active** grants/overrides apply.
 */
export function mergeCapabilityEntitlementLayers(params: {
  catalogById: Map<string, PlatformCapabilityCatalogRow>;
  activeCatalogIds: readonly string[];
  effectivePlanCode: string;
  planDefaults: readonly PlatformPlanCapabilityDefaultRow[];
  grants: readonly PlatformEntitlementCapabilityGrantRow[];
  overrides: readonly PlatformEntitlementCapabilityOverrideRow[];
}): MergeCapabilityEntitlementResult {
  const {
    catalogById,
    activeCatalogIds,
    effectivePlanCode,
    planDefaults,
    grants,
    overrides,
  } = params;

  type Layer = 'plan_default' | 'grant' | 'override';
  const byCapabilityId = new Map<
    string,
    { capabilityKey: string; value: unknown; layer: Layer }
  >();

  for (const d of planDefaults) {
    if (d.plan_code !== effectivePlanCode) continue;
    const cat = catalogById.get(d.capability_id);
    if (!cat || cat.status !== 'active') continue;
    const value = pickCapabilityValue(cat.value_type, d);
    byCapabilityId.set(d.capability_id, {
      capabilityKey: cat.capability_key,
      value,
      layer: 'plan_default',
    });
  }

  for (const g of grants) {
    if (g.status !== 'active') continue;
    const cat = catalogById.get(g.capability_id);
    if (!cat || cat.status !== 'active') continue;
    const value = pickCapabilityValue(cat.value_type, g);
    byCapabilityId.set(g.capability_id, {
      capabilityKey: cat.capability_key,
      value,
      layer: 'grant',
    });
  }

  for (const o of overrides) {
    if (o.status !== 'active') continue;
    const cat = catalogById.get(o.capability_id);
    if (!cat) continue;
    const value = pickCapabilityValue(cat.value_type, o);
    byCapabilityId.set(o.capability_id, {
      capabilityKey: cat.capability_key,
      value,
      layer: 'override',
    });
  }

  const capabilities: Record<string, unknown> = {};
  for (const [, entry] of byCapabilityId) {
    capabilities[entry.capabilityKey] = entry.value;
  }

  const missingActiveCatalogCapabilityIds: string[] = [];
  for (const capId of activeCatalogIds) {
    if (!byCapabilityId.has(capId)) {
      missingActiveCatalogCapabilityIds.push(capId);
    }
  }

  let schemaVersion = '';
  let catalogVersion = '';
  for (const capId of activeCatalogIds) {
    const cat = catalogById.get(capId);
    if (cat) {
      schemaVersion = cat.schema_version;
      catalogVersion = cat.catalog_version;
      break;
    }
  }

  return {
    capabilities,
    missingActiveCatalogCapabilityIds,
    schemaVersion,
    catalogVersion,
  };
}
