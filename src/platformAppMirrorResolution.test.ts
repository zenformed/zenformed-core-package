import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isPlatformAppEntitlementCurrentlyActive,
  isPlatformEntitlementStatusGrantingAccess,
  mapPlatformEntitlementRowToSnapshot,
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
