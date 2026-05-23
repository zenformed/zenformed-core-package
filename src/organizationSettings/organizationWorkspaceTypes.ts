/** Wire + hook snapshot types for organization workspace read APIs. */

export type OrganizationWorkspaceMemberDto = {
  readonly id: string;
  readonly userId: string;
  readonly displayName: string;
  readonly email: string | null;
  readonly role: 'owner' | 'admin' | 'member';
  readonly status: 'active' | 'invited' | 'removed';
};

export type OrganizationWorkspaceInviteDto = {
  readonly id: string;
  readonly email: string;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly displayName: string;
  readonly status: 'pending' | 'accepted' | 'revoked' | 'expired' | 'canceled';
  readonly role: 'owner' | 'admin' | 'member';
  readonly invitedBy: string | null;
  readonly expiresAt: string | null;
  readonly createdAt: string;
  readonly sentLabel: string;
};

export type OrganizationInviteCreatePayload = {
  readonly email: string;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly role?: 'admin' | 'member';
};

export type OrganizationWorkspaceSeatsDto = {
  readonly organizationId: string;
  readonly seatsUsed: number;
  readonly seatLimit: number;
  readonly seatsAvailable: number;
  readonly source: string;
  readonly notes: string | null;
  readonly planName: string | null;
  readonly appBreakdown: readonly {
    readonly appSlug: string;
    readonly appName: string;
    readonly planCode: string | null;
    readonly entitlementStatus: string;
  }[];
};

export type OrganizationWorkspaceAppAccessEntryDto = {
  readonly userId: string;
  readonly displayName: string;
  readonly email: string | null;
  readonly appSlug: string;
  readonly appName: string;
  readonly accessStatus: string;
  readonly role: string;
  readonly planLabel: string | null;
};

export type OrganizationWorkspaceAppAccessDto = {
  readonly organizationId: string;
  readonly entries: readonly OrganizationWorkspaceAppAccessEntryDto[];
  readonly orgApps: readonly {
    readonly appSlug: string;
    readonly appName: string;
    readonly planLabel: string | null;
    readonly statusLabel: string;
    readonly isActive: boolean;
  }[];
};

export type OrganizationWorkspaceSnapshot = {
  readonly members: readonly OrganizationWorkspaceMemberDto[] | null;
  readonly invites: readonly OrganizationWorkspaceInviteDto[] | null;
  readonly seats: OrganizationWorkspaceSeatsDto | null;
  readonly appAccess: OrganizationWorkspaceAppAccessDto | null;
};

export type OrganizationSettingsWorkspacePersistence = {
  readonly isLoading?: boolean;
  readonly loadError?: string | null;
  readonly hasLiveData?: boolean;
  readonly snapshot?: OrganizationWorkspaceSnapshot | null;
  readonly inviteActionsDisabled?: boolean;
  readonly isCreatingInvite?: boolean;
  readonly cancelingInviteId?: string | null;
  readonly inviteMutationError?: string | null;
  readonly createdInviteAcceptUrl?: string | null;
  readonly onDismissCreatedInviteLink?: () => void;
  readonly onCreateInvite?: (payload: OrganizationInviteCreatePayload) => Promise<boolean>;
  readonly onCancelInvite?: (inviteId: string) => Promise<boolean>;
};
