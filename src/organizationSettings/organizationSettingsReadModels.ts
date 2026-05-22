/**
 * Read-model shapes for the next Organization Settings backend milestone.
 * Not wired to UI yet — use for Core/BFF contracts and `@zenformed/core` types.
 */

export type OrganizationMemberReadModel = {
  readonly id: string;
  readonly userId: string;
  readonly displayName: string;
  readonly email: string | null;
  readonly role: 'admin' | 'member' | 'lead';
};

export type OrganizationSeatUsageReadModel = {
  readonly seatsUsed: number;
  readonly seatsTotal: number;
  readonly seatsAvailable: number;
};

export type OrganizationAppAccessReadModel = {
  readonly appSlug: string;
  readonly appName: string;
  readonly planLabel: string;
  readonly status: 'active' | 'available' | 'inactive';
  readonly action: 'manage' | 'upgrade' | 'buy';
};

export type OrganizationPendingInviteReadModel = {
  readonly id: string;
  readonly email: string;
  readonly sentAt: string;
  readonly status: 'pending' | 'expired';
};

/** Aggregated organization settings slice (future `GET /users/me/organization/settings` or similar). */
export type OrganizationWorkspaceSettingsReadModel = {
  readonly members: readonly OrganizationMemberReadModel[];
  readonly seatUsage: OrganizationSeatUsageReadModel;
  readonly appAccess: readonly OrganizationAppAccessReadModel[];
  readonly pendingInvites: readonly OrganizationPendingInviteReadModel[];
};
