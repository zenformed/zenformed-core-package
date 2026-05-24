import type { SettingsCategoryId } from './settingsCategories';

export type OrganizationMemberRole = 'owner' | 'admin' | 'coordinator' | 'member';

export type AssignableOrganizationMemberRole = 'admin' | 'coordinator' | 'member';

export type AssignableOrganizationInviteRole = 'admin' | 'coordinator' | 'member';

export type OrganizationPermissions = {
  readonly canViewOrganizationSettings: boolean;
  readonly canEditOrganizationProfile: boolean;
  readonly canViewTeamMembers: boolean;
  readonly canInviteMembers: boolean;
  readonly canCancelInvites: boolean;
  readonly canManageMemberRoles: boolean;
  readonly canRemoveMembers: boolean;
  readonly canViewAppsBilling: boolean;
  readonly canEditAccountEmail: boolean;
};

export const EMPTY_ORGANIZATION_PERMISSIONS: OrganizationPermissions = {
  canViewOrganizationSettings: false,
  canEditOrganizationProfile: false,
  canViewTeamMembers: false,
  canInviteMembers: false,
  canCancelInvites: false,
  canManageMemberRoles: false,
  canRemoveMembers: false,
  canViewAppsBilling: false,
  canEditAccountEmail: false,
};

export function parseOrganizationPermissions(json: unknown): OrganizationPermissions | null {
  if (json == null || typeof json !== 'object') return null;
  const o = json as Record<string, unknown>;
  const keys = [
    'canViewOrganizationSettings',
    'canEditOrganizationProfile',
    'canViewTeamMembers',
    'canInviteMembers',
    'canCancelInvites',
    'canManageMemberRoles',
    'canRemoveMembers',
    'canViewAppsBilling',
    'canEditAccountEmail',
  ] as const;
  for (const key of keys) {
    if (typeof o[key] !== 'boolean') return null;
  }
  return o as OrganizationPermissions;
}

export function filterSettingsCategoriesByPermissions(
  order: readonly SettingsCategoryId[],
  permissions: OrganizationPermissions | null | undefined
): SettingsCategoryId[] {
  const p = permissions ?? EMPTY_ORGANIZATION_PERMISSIONS;
  return order.filter((category) => {
    switch (category) {
      case 'account':
      case 'notifications':
        return true;
      case 'organization':
        return p.canViewOrganizationSettings;
      case 'teamMembers':
        return p.canViewTeamMembers;
      case 'appsBilling':
        return p.canViewAppsBilling;
      default:
        return false;
    }
  });
}

export function inviteRoleOptionsForPermissions(
  permissions: OrganizationPermissions | null | undefined
): readonly AssignableOrganizationInviteRole[] {
  const p = permissions ?? EMPTY_ORGANIZATION_PERMISSIONS;
  if (!p.canInviteMembers) return [];
  if (p.canManageMemberRoles) {
    return ['admin', 'coordinator', 'member'];
  }
  return ['member'];
}

export function memberRoleOptionsForPermissions(): readonly AssignableOrganizationMemberRole[] {
  return ['admin', 'coordinator', 'member'];
}

export function roleCanRemoveMember(
  actorRole: OrganizationMemberRole,
  actorUserId: string,
  targetUserId: string,
  targetCurrentRole: OrganizationMemberRole
): boolean {
  if (targetCurrentRole === 'owner') return false;
  if (actorUserId === targetUserId) return false;

  if (actorRole === 'owner') {
    return (
      targetCurrentRole === 'admin' ||
      targetCurrentRole === 'coordinator' ||
      targetCurrentRole === 'member'
    );
  }

  if (actorRole === 'admin') {
    if (targetCurrentRole === 'admin') return false;
    return targetCurrentRole === 'coordinator' || targetCurrentRole === 'member';
  }

  return false;
}

export function memberCanBeRemoved(
  permissions: OrganizationPermissions | null | undefined,
  actorRole: OrganizationMemberRole | null | undefined,
  actorUserId: string | null | undefined,
  member: { readonly userId?: string; readonly role: OrganizationMemberRole }
): boolean {
  if (!(permissions?.canRemoveMembers ?? false)) return false;
  if (actorRole == null || actorUserId == null) return false;
  if (member.userId == null) return false;
  return roleCanRemoveMember(actorRole, actorUserId, member.userId, member.role);
}
