import type { OrganizationSettingsMemberRole } from './types';

export const ORGANIZATION_ROLE_DESCRIPTIONS: Record<OrganizationSettingsMemberRole, string> = {
  owner: 'Full organization and billing control',
  admin: 'Manage organization settings, members, and operational access',
  coordinator: 'Operational management without billing ownership',
  member: 'Basic app access only',
};

export function organizationRoleDescription(role: OrganizationSettingsMemberRole): string {
  return ORGANIZATION_ROLE_DESCRIPTIONS[role];
}
