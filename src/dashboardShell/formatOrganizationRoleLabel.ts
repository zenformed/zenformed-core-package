/** Display label for organization membership role in dashboard chrome. */
export function formatOrganizationRoleLabel(role: string | null | undefined): string | null {
  switch (role) {
    case 'owner':
      return 'Owner';
    case 'admin':
      return 'Admin';
    case 'coordinator':
      return 'Coordinator';
    case 'member':
      return 'Member';
    default:
      return null;
  }
}
