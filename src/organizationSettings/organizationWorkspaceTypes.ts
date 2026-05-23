/** Wire + hook snapshot types for organization workspace read APIs. */

import type {
  AssignableOrganizationMemberRole,
  AssignableOrganizationInviteRole,
  OrganizationMemberRole,
  OrganizationPermissions,
} from './organizationPermissions';

export type OrganizationWorkspaceMembershipContextDto = {
  readonly hasActiveMembership: boolean;
  readonly hasNonPersonalOrganizationMembership: boolean;
  readonly membershipKind: 'none' | 'organization_bootstrap_owner' | 'invited_member';
  readonly organizationId: string | null;
  readonly currentUserId: string;
  readonly role: OrganizationMemberRole | null;
  readonly permissions: OrganizationPermissions;
};

export type OrganizationWorkspaceMemberDto = {
  readonly id: string;
  readonly userId: string;
  readonly displayName: string;
  readonly email: string | null;
  readonly role: OrganizationMemberRole;
  readonly status: 'active' | 'invited' | 'removed';
};

export type OrganizationWorkspaceInviteDto = {
  readonly id: string;
  readonly email: string;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly displayName: string;
  readonly status: 'pending' | 'accepted' | 'revoked' | 'expired' | 'canceled';
  readonly role: OrganizationMemberRole;
  readonly invitedBy: string | null;
  readonly expiresAt: string | null;
  readonly createdAt: string;
  readonly sentLabel: string;
};

export type OrganizationInviteCreatePayload = {
  readonly email: string;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly role?: AssignableOrganizationInviteRole;
};

export type OrganizationMemberRoleUpdatePayload = {
  readonly role: AssignableOrganizationMemberRole;
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
  readonly membershipContext: OrganizationWorkspaceMembershipContextDto | null;
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
  readonly permissions?: OrganizationPermissions | null;
  readonly currentUserId?: string | null;
  readonly inviteActionsDisabled?: boolean;
  readonly roleManagementDisabled?: boolean;
  readonly isCreatingInvite?: boolean;
  readonly cancelingInviteId?: string | null;
  readonly updatingMemberRoleId?: string | null;
  readonly inviteMutationError?: string | null;
  readonly roleMutationError?: string | null;
  readonly createdInviteAcceptUrl?: string | null;
  readonly onDismissCreatedInviteLink?: () => void;
  readonly onCreateInvite?: (payload: OrganizationInviteCreatePayload) => Promise<boolean>;
  readonly onCancelInvite?: (inviteId: string) => Promise<boolean>;
  readonly onUpdateMemberRole?: (
    memberId: string,
    payload: OrganizationMemberRoleUpdatePayload
  ) => Promise<boolean>;
};
