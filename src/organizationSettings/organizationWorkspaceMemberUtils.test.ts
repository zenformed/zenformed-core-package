import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  applyReactivatedMemberToSnapshot,
  parseOrganizationWorkspaceMemberDto,
} from './organizationWorkspaceMemberUtils';
import type { OrganizationWorkspaceSnapshot } from './organizationWorkspaceTypes';
import { EMPTY_ORGANIZATION_PERMISSIONS } from './organizationPermissions';

const baseSnapshot = (): OrganizationWorkspaceSnapshot => ({
  membershipContext: {
    hasActiveMembership: true,
    hasNonPersonalOrganizationMembership: true,
    membershipKind: 'organization_bootstrap_owner',
    organizationId: 'org-1',
    currentUserId: 'owner-1',
    role: 'owner',
    permissions: EMPTY_ORGANIZATION_PERMISSIONS,
  },
  members: [],
  invites: [],
  seats: {
    organizationId: 'org-1',
    seatsUsed: 1,
    seatLimit: 5,
    seatsAvailable: 4,
    source: 'entitlement_tier',
    notes: null,
    planName: 'Pro',
    appBreakdown: [],
  },
  appAccess: null,
});

describe('parseOrganizationWorkspaceMemberDto', () => {
  it('parses active member from reactivation payload', () => {
    const member = parseOrganizationWorkspaceMemberDto({
      id: 'mem-1',
      userId: 'user-1',
      displayName: 'Returning User',
      email: 'returning@example.com',
      role: 'member',
      status: 'active',
    });
    assert.ok(member != null);
    assert.equal(member.status, 'active');
  });
});

describe('applyReactivatedMemberToSnapshot', () => {
  it('adds reactivated member and increments seats', () => {
    const member = parseOrganizationWorkspaceMemberDto({
      id: 'mem-1',
      userId: 'user-1',
      displayName: 'Returning User',
      email: 'returning@example.com',
      role: 'member',
      status: 'active',
    });
    assert.ok(member != null);

    const next = applyReactivatedMemberToSnapshot(baseSnapshot(), member);
    assert.equal(next.members?.length, 1);
    assert.equal(next.members?.[0]?.email, 'returning@example.com');
    assert.equal(next.seats?.seatsUsed, 2);
    assert.equal(next.seats?.seatsAvailable, 3);
  });
});
