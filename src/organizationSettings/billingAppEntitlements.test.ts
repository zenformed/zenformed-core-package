import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildBillingPlanLabel,
  formatPlanDisplayName,
  mapEntitlementSnapshotToBillingApp,
  mapEntitlementsRecordToBillingApps,
  resolveAppEntitlementBadges,
} from './billingAppEntitlements';

test('mapEntitlementSnapshotToBillingApp exposes cancellation scheduled state', () => {
  const billingApp = mapEntitlementSnapshotToBillingApp({
    appSlug: 'buildcore',
    subscriptionActive: true,
    planCodeOriginal: 'starter',
    planSlugNormalized: 'starter',
    entitlementStatus: 'trial',
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    effectiveTo: '2026-06-20T00:00:00.000Z',
    trialEnd: '2026-06-20T00:00:00.000Z',
    currentPeriodEnd: '2026-06-20T00:00:00.000Z',
    cancelAtPeriodEnd: true,
    accessUntil: '2026-06-20T00:00:00.000Z',
    canCancel: false,
    resolutionSource: 'platform_tables',
  });
  assert.ok(billingApp);
  assert.equal(billingApp.cancelAtPeriodEnd, true);
  assert.equal(billingApp.cancelEnabled, false);
  assert.equal(billingApp.reactivateEnabled, true);
  assert.equal(billingApp.cancellationScheduledLabel, 'Cancellation scheduled');
});

test('mapEntitlementSnapshotToBillingApp exposes scheduled downgrade state', () => {
  const billingApp = mapEntitlementSnapshotToBillingApp({
    appSlug: 'buildcore',
    subscriptionActive: true,
    planCodeOriginal: 'pro',
    planSlugNormalized: 'pro',
    entitlementStatus: 'active',
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    effectiveTo: '2026-07-01T00:00:00.000Z',
    currentPeriodEnd: '2026-07-01T00:00:00.000Z',
    pendingPlanSlug: 'growth',
    pendingPlanSlugNormalized: 'growth',
    pendingPlanEffectiveAt: '2026-07-01T00:00:00.000Z',
    resolutionSource: 'platform_tables',
  });
  assert.ok(billingApp);
  assert.equal(billingApp.removeScheduledDowngradeEnabled, true);
  assert.equal(billingApp.cancelEnabled, false);
  assert.equal(billingApp.scheduledDowngradeLabel, 'Downgrade to Growth scheduled for 06/30/2026');
});

test('resolveAppEntitlementBadges returns separate plan and trial pills', () => {
  const badges = resolveAppEntitlementBadges('buildcore', 'starter', 'trial');
  assert.equal(badges.planLabel, 'Starter');
  assert.equal(badges.planBadgeVariant, 'starter');
  assert.equal(badges.statusLabel, 'Trial');
  assert.equal(badges.statusBadgeVariant, 'trial');
});

test('formatPlanDisplayName uses catalog labels', () => {
  assert.equal(formatPlanDisplayName('buildcore', 'starter'), 'Starter');
  assert.equal(formatPlanDisplayName('buildcore', 'growth'), 'Growth');
  assert.equal(formatPlanDisplayName('buildcore', 'pro'), 'Pro');
});

test('buildBillingPlanLabel appends Trial for trial status', () => {
  assert.equal(buildBillingPlanLabel('buildcore', 'starter', 'trial'), 'Starter Trial');
  assert.equal(buildBillingPlanLabel('buildcore', 'starter', 'active'), 'Starter');
});

test('mapEntitlementSnapshotToBillingApp renders trial billing fields', () => {
  const billingApp = mapEntitlementSnapshotToBillingApp(
    {
      appSlug: 'buildcore',
      subscriptionActive: true,
      planCodeOriginal: 'starter',
      planSlugNormalized: 'starter',
      entitlementStatus: 'trial',
      effectiveFrom: '2026-06-01T00:00:00.000Z',
      effectiveTo: null,
      resolutionSource: 'platform_tables',
      trialEnd: '2026-07-01T00:00:00.000Z',
      currentPeriodEnd: '2026-07-01T00:00:00.000Z',
    },
    new Date('2026-06-18T00:00:00.000Z')
  );

  assert.ok(billingApp != null);
  assert.equal(billingApp.name, 'BuildCore');
  assert.equal(billingApp.planLabel, 'Starter Trial');
  assert.equal(billingApp.planBadgeVariant, 'starter');
  assert.equal(billingApp.statusBadgeVariant, 'trial');
  assert.equal(billingApp.actionLabel, 'Manage Subscription');
  assert.equal(billingApp.manageEnabled, true);
  assert.equal(billingApp.trialEndsLabel, '06/30/2026');
  assert.equal(billingApp.daysRemaining, 13);
  assert.equal(billingApp.nextBillingDateLabel, '06/30/2026');
});

test('mapEntitlementsRecordToBillingApps accepts nested entitlement envelopes', () => {
  const billingApps = mapEntitlementsRecordToBillingApps({
    buildcore: {
      appSlug: 'buildcore',
      entitlement: {
        appSlug: 'buildcore',
        subscriptionActive: true,
        planCodeOriginal: 'starter',
        planSlugNormalized: 'starter',
        entitlementStatus: 'trial',
        effectiveFrom: null,
        effectiveTo: null,
        resolutionSource: 'platform_tables',
        trialEnd: '2026-07-01T00:00:00.000Z',
        currentPeriodEnd: '2026-07-01T00:00:00.000Z',
      },
    },
  });

  assert.equal(billingApps.length, 1);
  assert.equal(billingApps[0]?.appSlug, 'buildcore');
});

test('mapEntitlementSnapshotToBillingApp allows trial status without subscriptionActive flag', () => {
  const billingApp = mapEntitlementSnapshotToBillingApp({
    appSlug: 'buildcore',
    subscriptionActive: false,
    planCodeOriginal: 'starter',
    planSlugNormalized: 'starter',
    entitlementStatus: 'trial',
    effectiveFrom: null,
    effectiveTo: null,
    resolutionSource: 'platform_tables',
  });

  assert.ok(billingApp != null);
  assert.equal(billingApp.planLabel, 'Starter Trial');
});

test('mapEntitlementsRecordToBillingApps skips inactive entitlements', () => {
  const billingApps = mapEntitlementsRecordToBillingApps({
    buildcore: {
      appSlug: 'buildcore',
      subscriptionActive: true,
      planCodeOriginal: 'starter',
      planSlugNormalized: 'starter',
      entitlementStatus: 'trial',
      effectiveFrom: null,
      effectiveTo: null,
      resolutionSource: 'platform_tables',
      trialEnd: '2026-07-01T00:00:00.000Z',
      currentPeriodEnd: '2026-07-01T00:00:00.000Z',
    },
    forgecore: {
      appSlug: 'forgecore',
      subscriptionActive: false,
      planCodeOriginal: '',
      planSlugNormalized: '',
      entitlementStatus: 'inactive',
      effectiveFrom: null,
      effectiveTo: null,
      resolutionSource: 'platform_tables',
    },
  });

  assert.equal(billingApps.length, 1);
  assert.equal(billingApps[0]?.appSlug, 'buildcore');
});
