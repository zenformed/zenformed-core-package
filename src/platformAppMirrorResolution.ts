import type { SaaSEntitlementSnapshot } from './entitlementSnapshot';
import { resolvePlatformOrganizationPreferenceOrder } from './platformOrganizationPreference';

/** True when mirrored entitlement_status grants app access (matches legacy subscription active). */
export function isPlatformEntitlementStatusActive(entitlementStatus: string): boolean {
  return typeof entitlementStatus === 'string' && entitlementStatus.trim().toLowerCase() === 'active';
}

/** Mirrors legacy semantics for mirrored rows: active ↔ subscriptionActive; PRO tier strict match. */
export function mapPlatformEntitlementRowToSnapshot(row: {
  entitlement_status: string;
  plan_code: string | null;
}): SaaSEntitlementSnapshot {
  const subscriptionActive = isPlatformEntitlementStatusActive(row.entitlement_status);

  const licenseTier = row.plan_code === 'PRO' ? 'PRO' : 'STANDARD';

  return {
    subscriptionActive,
    licenseTier,
    resolutionSource: 'platform_tables',
  };
}

/**
 * Failure bucket for batch diagnostics (aligned with platform entitlement reader null exits).
 */
export type PlatformAppMirrorBatchFailureCategory =
  | 'missing_app_catalog'
  | 'membership_or_org_gap'
  | 'entitlement_mirror_gap';

export interface PlatformAppMirrorResolutionDetail {
  snapshot: SaaSEntitlementSnapshot | null;
  /** Preferred spine when entitlement rows include `id`. */
  resolvedSpine?: { id: string; organization_id: string } | null;
  failureDetail?:
    | 'app_row_missing'
    | 'members_query_failed_or_empty'
    | 'organizations_query_failed_or_empty'
    | 'no_active_organizations_after_sort'
    | 'entitlements_query_failed_or_empty'
    | 'no_entitlement_row_for_preferred_org_chain';
}

/**
 * Pure resolution: walk org preference order; prefer the first **active** entitlement so invited
 * members inherit org subscription instead of a personal-default org mirror with inactive profile.
 * Falls back to the first entitlement row (inactive/expired/trial) when none are active.
 */
export function resolvePlatformAppEntitlementFromPrefetched(params: {
  userId: string;
  appId: string | null;
  memberRows: { organization_id: string }[] | null;
  orgRows: { id: string; status: string; created_for_user_id: string | null }[] | null;
  entitlementRows:
    | { id?: string; organization_id: string; entitlement_status: string; plan_code: string | null }[]
    | null;
  memberQueryFailed?: boolean;
  orgQueryFailed?: boolean;
  entitlementQueryFailed?: boolean;
}): PlatformAppMirrorResolutionDetail {
  const { userId, appId } = params;

  if (appId == null) {
    return { snapshot: null, failureDetail: 'app_row_missing' };
  }

  if (params.memberQueryFailed) {
    return {
      snapshot: null,
      failureDetail: 'members_query_failed_or_empty',
    };
  }
  if (params.orgQueryFailed) {
    return {
      snapshot: null,
      failureDetail: 'organizations_query_failed_or_empty',
    };
  }
  if (params.entitlementQueryFailed) {
    return {
      snapshot: null,
      failureDetail: 'entitlements_query_failed_or_empty',
    };
  }

  const memberRows = params.memberRows ?? [];
  if (memberRows.length === 0) {
    return { snapshot: null, failureDetail: 'members_query_failed_or_empty' };
  }

  const orgRows = params.orgRows ?? [];
  if (orgRows.length === 0) {
    return { snapshot: null, failureDetail: 'organizations_query_failed_or_empty' };
  }

  const sortedOrgIds = resolvePlatformOrganizationPreferenceOrder(orgRows, userId);
  if (sortedOrgIds.length === 0) {
    return { snapshot: null, failureDetail: 'no_active_organizations_after_sort' };
  }

  const entitlementRows = params.entitlementRows ?? [];
  if (entitlementRows.length === 0) {
    return { snapshot: null, failureDetail: 'entitlements_query_failed_or_empty' };
  }

  const byOrgId = new Map(entitlementRows.map((r) => [r.organization_id, r]));

  function snapshotFromRow(
    row: { id?: string; organization_id: string; entitlement_status: string; plan_code: string | null },
    organizationId: string
  ): PlatformAppMirrorResolutionDetail {
    const sid = row.id != null && String(row.id).trim() !== '' ? String(row.id) : null;
    return {
      snapshot: mapPlatformEntitlementRowToSnapshot(row),
      resolvedSpine: sid != null ? { id: sid, organization_id: organizationId } : null,
    };
  }

  for (const organizationId of sortedOrgIds) {
    const row = byOrgId.get(organizationId);
    if (row != null && isPlatformEntitlementStatusActive(row.entitlement_status)) {
      return snapshotFromRow(row, organizationId);
    }
  }

  for (const organizationId of sortedOrgIds) {
    const row = byOrgId.get(organizationId);
    if (row != null) {
      return snapshotFromRow(row, organizationId);
    }
  }

  return { snapshot: null, failureDetail: 'no_entitlement_row_for_preferred_org_chain' };
}

export function categorizeMirrorFailureForBatch(
  detail: PlatformAppMirrorResolutionDetail
): PlatformAppMirrorBatchFailureCategory {
  if (detail.snapshot != null) {
    throw new Error('categorizeMirrorFailureForBatch: expected unresolved snapshot');
  }
  const d = detail.failureDetail;
  if (d === 'app_row_missing') return 'missing_app_catalog';
  if (
    d === 'members_query_failed_or_empty' ||
    d === 'organizations_query_failed_or_empty' ||
    d === 'no_active_organizations_after_sort'
  ) {
    return 'membership_or_org_gap';
  }
  return 'entitlement_mirror_gap';
}
