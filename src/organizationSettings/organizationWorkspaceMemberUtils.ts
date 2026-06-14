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
