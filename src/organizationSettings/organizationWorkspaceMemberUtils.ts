import type {
  OrganizationWorkspaceMemberDto,
  OrganizationWorkspaceSnapshot,
} from './organizationWorkspaceTypes';

/** Team member list should only show active memberships; invites stay on the invites slice. */
export function filterActiveWorkspaceMembers(
  members: readonly OrganizationWorkspaceMemberDto[]
): OrganizationWorkspaceMemberDto[] {
  return members.filter((member) => member.status === 'active');
}

export function parseOrganizationWorkspaceMemberDto(
  value: unknown
): OrganizationWorkspaceMemberDto | null {
  if (value == null || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== 'string' || typeof row.userId !== 'string') return null;
  if (typeof row.displayName !== 'string') return null;
  if (row.firstName != null && typeof row.firstName !== 'string') return null;
  if (row.lastName != null && typeof row.lastName !== 'string') return null;
  if (row.email != null && typeof row.email !== 'string') return null;
  if (
    row.role !== 'owner' &&
    row.role !== 'admin' &&
    row.role !== 'coordinator' &&
    row.role !== 'member'
  ) {
    return null;
  }
  if (row.status !== 'active' && row.status !== 'invited' && row.status !== 'removed') return null;
  return {
    id: row.id,
    userId: row.userId,
    displayName: row.displayName,
    firstName: typeof row.firstName === 'string' ? row.firstName : null,
    lastName: typeof row.lastName === 'string' ? row.lastName : null,
    email: typeof row.email === 'string' ? row.email : null,
    role: row.role,
    status: row.status,
  };
}

export function applyReactivatedMemberToSnapshot(
  snapshot: OrganizationWorkspaceSnapshot,
  member: OrganizationWorkspaceMemberDto
): OrganizationWorkspaceSnapshot {
  const existing = snapshot.members ?? [];
  const without = existing.filter((m) => m.id !== member.id && m.userId !== member.userId);
  const nextMembers = filterActiveWorkspaceMembers([...without, member]);

  let seats = snapshot.seats;
  if (seats != null && member.status === 'active') {
    const hadActive = existing.some(
      (m) => (m.id === member.id || m.userId === member.userId) && m.status === 'active'
    );
    if (!hadActive) {
      const seatsUsed = seats.seatsUsed + 1;
      seats = {
        ...seats,
        seatsUsed,
        seatsAvailable: Math.max(0, seats.seatLimit - seatsUsed),
      };
    }
  }

  return { ...snapshot, members: nextMembers, seats };
}

export function applyRemovedMemberToSnapshot(
  snapshot: OrganizationWorkspaceSnapshot,
  memberId: string
): OrganizationWorkspaceSnapshot {
  if (snapshot.members == null) return snapshot;

  const nextMembers = snapshot.members.filter((member) => member.id !== memberId);
  if (nextMembers.length === snapshot.members.length) return snapshot;

  let seats = snapshot.seats;
  if (seats != null) {
    const seatsUsed = Math.max(0, seats.seatsUsed - 1);
    seats = {
      ...seats,
      seatsUsed,
      seatsAvailable: Math.max(0, seats.seatLimit - seatsUsed),
    };
  }

  return { ...snapshot, members: nextMembers, seats };
}
