/**
 * Deterministic org ordering for platform entitlement resolution.
 */
export function resolvePlatformOrganizationPreferenceOrder(
  orgs: ReadonlyArray<{ id: string; status: string; created_for_user_id: string | null }>,
  userId: string,
  preferredOrganizationId?: string | null
): string[] {
  const active = orgs.filter((o) => typeof o.status === 'string' && o.status.trim().toLowerCase() === 'active');
  return [...active]
    .sort((a, b) => {
      const aPreferred = a.id === preferredOrganizationId ? 0 : 1;
      const bPreferred = b.id === preferredOrganizationId ? 0 : 1;
      if (aPreferred !== bPreferred) return aPreferred - bPreferred;
      const aPersonal = a.created_for_user_id === userId ? 0 : 1;
      const bPersonal = b.created_for_user_id === userId ? 0 : 1;
      if (aPersonal !== bPersonal) return aPersonal - bPersonal;
      return String(a.id).localeCompare(String(b.id));
    })
    .map((o) => o.id);
}
