import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isPlatformAppEntitlementCurrentlyActive,
  isPlatformEntitlementStatusGrantingAccess,
  mapPlatformEntitlementRowToSnapshot,
  resolvePlatformAppEntitlementFromPrefetched,
} from './platformAppMirrorResolution';

test('trial and active entitlement statuses grant access', () => {
  assert.equal(isPlatformEntitlementStatusGrantingAccess('active'), true);
  assert.equal(isPlatformEntitlementStatusGrantingAccess('trial'), true);
  assert.equal(isPlatformEntitlementStatusGrantingAccess('inactive'), false);
  assert.equal(isPlatformEntitlementStatusGrantingAccess('expired'), false);
});

test('mapPlatformEntitlementRowToSnapshot treats trial as subscriptionActive', () => {
  const snapshot = mapPlatformEntitlementRowToSnapshot('buildcore', {
    entitlement_status: 'trial',
    plan_code: 'starter',
    effective_from: '2026-01-01T00:00:00.000Z',
    effective_to: null,
  });

  assert.equal(snapshot.subscriptionActive, true);
  assert.equal(snapshot.entitlementStatus, 'trial');
  assert.equal(snapshot.planSlugNormalized, 'starter');
});

test('effective window still gates active entitlements', () => {
  const future = new Date(Date.now() + 86_400_000).toISOString();
  assert.equal(
    isPlatformAppEntitlementCurrentlyActive({
      entitlement_status: 'active',
      effective_from: future,
      effective_to: null,
    }),
    false
  );
});

test('selected organization cannot inherit another organization entitlement', () => {
  const result = resolvePlatformAppEntitlementFromPrefetched({
    userId: 'user-1',
    preferredOrganizationId: 'org-a',
    appSlug: 'buildcore',
    appId: 'app-1',
    memberRows: [{ organization_id: 'org-a' }, { organization_id: 'org-b' }],
    orgRows: [
      { id: 'org-a', status: 'active', created_for_user_id: 'user-1' },
      { id: 'org-b', status: 'active', created_for_user_id: null },
    ],
    entitlementRows: [
      { id: 'ent-a', organization_id: 'org-a', entitlement_status: 'inactive', plan_code: 'starter' },
      { id: 'ent-b', organization_id: 'org-b', entitlement_status: 'active', plan_code: 'pro' },
    ],
  });

  assert.equal(result.snapshot?.subscriptionActive, false);
  assert.equal(result.resolvedSpine?.organization_id, 'org-a');
});

test('selected organization with no entitlement row does not use another organization row', () => {
  const result = resolvePlatformAppEntitlementFromPrefetched({
    userId: 'user-1',
    preferredOrganizationId: 'org-a',
    appSlug: 'buildcore',
    appId: 'app-1',
    memberRows: [{ organization_id: 'org-a' }, { organization_id: 'org-b' }],
    orgRows: [
      { id: 'org-a', status: 'active', created_for_user_id: 'user-1' },
      { id: 'org-b', status: 'active', created_for_user_id: null },
    ],
    entitlementRows: [
      { id: 'ent-b', organization_id: 'org-b', entitlement_status: 'active', plan_code: 'pro' },
    ],
  });

  assert.equal(result.snapshot, null);
  assert.equal(result.failureDetail, 'no_entitlement_row_for_preferred_org_chain');
});
