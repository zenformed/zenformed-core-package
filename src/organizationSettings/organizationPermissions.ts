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
