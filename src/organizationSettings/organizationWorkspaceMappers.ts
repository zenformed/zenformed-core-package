import type {
  OrganizationSettingsAppAccess,
  OrganizationSettingsMember,
  OrganizationSettingsMemberRole,
  OrganizationSettingsPendingInvite,
  OrganizationSettingsPlan,
  OrganizationSettingsViewModel,
} from './types';
import type { OrganizationWorkspaceInviteDto, OrganizationWorkspaceSnapshot } from './organizationWorkspaceTypes';

function inviteStatusLabel(status: OrganizationWorkspaceInviteDto['status']): string {
  if (status === 'pending') return 'Pending';
  if (status === 'expired') return 'Expired';
  if (status === 'canceled') return 'Canceled';
  if (status === 'revoked') return 'Revoked';
  return status;
}

function formatExpiresLabel(expiresAt: string | null): string | null {
  if (expiresAt == null) return null;
  const exp = new Date(expiresAt);
  if (Number.isNaN(exp.getTime())) return null;
  return `Expires ${exp.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
}
function mapMemberRole(role: OrganizationSettingsMemberRole): OrganizationSettingsMemberRole {
  return role;
}

function mapBillingApps(
  appAccess: OrganizationWorkspaceSnapshot['appAccess']
): OrganizationSettingsAppAccess[] {
  if (appAccess == null) return [];
  const billingApps: OrganizationSettingsAppAccess[] = [];
  if (appAccess.entries.length > 0) {
    for (const entry of appAccess.entries) {
      const active = entry.accessStatus === 'active';
      billingApps.push({
        id: `${entry.userId}-${entry.appSlug}`,
        name: `${entry.displayName} · ${entry.appName}`,
        planLabel: entry.planLabel ?? '—',
        statusLabel: active ? 'Active' : entry.accessStatus,
        actionLabel: active ? 'Manage' : 'Buy',
        isActive: active,
      });
    }
    return billingApps;
  }
  for (const app of appAccess.orgApps) {
    billingApps.push({
      id: app.appSlug,
      name: app.appName,
      planLabel: app.planLabel ?? '—',
      statusLabel: app.statusLabel,
      actionLabel: app.isActive ? 'Manage' : 'Buy',
      isActive: app.isActive,
    });
  }
  return billingApps;
}

export function workspaceSnapshotToViewModelOverrides(
  snapshot: OrganizationWorkspaceSnapshot
): Partial<OrganizationSettingsViewModel> {
  const members: OrganizationSettingsMember[] | undefined =
    snapshot.members != null
      ? snapshot.members.map((m) => ({
          id: m.id,
          userId: m.userId,
          name: m.displayName,
          displayName: m.displayName,
          firstName: m.firstName,
          lastName: m.lastName,
          email: m.email,
          role: mapMemberRole(m.role),
        }))
      : undefined;

  const pendingInvites: OrganizationSettingsPendingInvite[] | undefined =
    snapshot.invites != null
      ? snapshot.invites.map((inv) => ({
          id: inv.id,
          email: inv.email,
          name: inv.displayName,
          statusLabel: inviteStatusLabel(inv.status),
          sentLabel: inv.sentLabel,
          expiresLabel: formatExpiresLabel(inv.expiresAt),
        }))
      : undefined;

  let plan: OrganizationSettingsPlan | undefined;
  if (snapshot.seats != null) {
    const planName = snapshot.seats.planName?.trim() || 'Organization';
    plan = {
      planName,
      seatsUsed: snapshot.seats.seatsUsed,
      seatsTotal: snapshot.seats.seatLimit,
      statusLabel:
        snapshot.seats.source === 'entitlement_tier' ? 'Connected' : 'Default tier',
    };
  }

  const billingApps = mapBillingApps(snapshot.appAccess);

  return {
    ...(members != null ? { members } : {}),
    ...(pendingInvites != null ? { pendingInvites } : {}),
    ...(plan != null ? { plan } : {}),
    ...(billingApps.length > 0 ? { billingApps, appAccess: billingApps } : {}),
  };
}
