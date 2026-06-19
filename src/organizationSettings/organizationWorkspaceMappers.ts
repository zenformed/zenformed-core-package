import type {
  OrganizationSettingsAppAccess,
  OrganizationSettingsMember,
  OrganizationSettingsMemberRole,
  OrganizationSettingsPendingInvite,
  OrganizationSettingsPlan,
  OrganizationSettingsViewModel,
} from './types';
import type { OrganizationWorkspaceInviteDto, OrganizationWorkspaceSnapshot } from './organizationWorkspaceTypes';
import { filterActiveWorkspaceMembers } from './organizationWorkspaceMemberUtils';
import { mapEntitlementsRecordToBillingApps } from './billingAppEntitlements';
import { isPlatformEntitlementStatusGrantingAccess } from '../platformAppMirrorResolution';

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

function mapLegacyBillingApps(
  appAccess: OrganizationWorkspaceSnapshot['appAccess']
): OrganizationSettingsAppAccess[] {
  if (appAccess == null) return [];
  const billingApps: OrganizationSettingsAppAccess[] = [];
  if (appAccess.entries.length > 0) {
    for (const entry of appAccess.entries) {
      const active = isPlatformEntitlementStatusGrantingAccess(entry.accessStatus);
      billingApps.push({
        id: `${entry.userId}-${entry.appSlug}`,
        appSlug: entry.appSlug,
        name: `${entry.displayName} · ${entry.appName}`,
        planLabel: entry.planLabel ?? '—',
        statusLabel: active ? 'Active' : entry.accessStatus,
        actionLabel: active ? 'Manage Subscription' : 'Buy',
        isActive: active,
        manageEnabled: active,
      });
    }
    return billingApps;
  }
  for (const app of appAccess.orgApps) {
    billingApps.push({
      id: app.appSlug,
      appSlug: app.appSlug,
      name: app.appName,
      planLabel: app.planLabel ?? '—',
      statusLabel: app.statusLabel,
      actionLabel: app.isActive ? 'Manage Subscription' : 'Buy',
      isActive: app.isActive,
      manageEnabled: app.isActive,
    });
  }
  return billingApps;
}

function mapBillingApps(snapshot: OrganizationWorkspaceSnapshot): OrganizationSettingsAppAccess[] {
  if (snapshot.appEntitlements != null) {
    return mapEntitlementsRecordToBillingApps(snapshot.appEntitlements.entitlements);
  }
  return mapLegacyBillingApps(snapshot.appAccess);
}

export function workspaceSnapshotToViewModelOverrides(
  snapshot: OrganizationWorkspaceSnapshot
): Partial<OrganizationSettingsViewModel> {
  const members: OrganizationSettingsMember[] | undefined =
    snapshot.members != null
      ? filterActiveWorkspaceMembers(snapshot.members).map((m) => ({
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
          emailDeliveryStatus: inv.emailDeliveryStatus ?? null,
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

  const billingApps = mapBillingApps(snapshot);
  const hasBillingSource = snapshot.appEntitlements != null || snapshot.appAccess != null;

  return {
    ...(members != null ? { members } : {}),
    ...(pendingInvites != null ? { pendingInvites } : {}),
    ...(plan != null ? { plan } : {}),
    ...(hasBillingSource ? { billingApps, appAccess: billingApps } : {}),
  };
}
