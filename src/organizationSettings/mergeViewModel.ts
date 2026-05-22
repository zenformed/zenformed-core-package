import { DEFAULT_ORGANIZATION_SETTINGS_VIEW_MODEL } from './defaultViewModel';
import type {
  OrganizationSettingsShellContext,
  OrganizationSettingsViewModel,
  ZenformedUserSettingsDto,
} from './types';

export function userSettingsToViewModelOverrides(
  settings: ZenformedUserSettingsDto
): Partial<OrganizationSettingsViewModel> {
  return {
    account: {
      firstName: settings.firstName ?? '',
      lastName: settings.lastName ?? '',
      email: settings.email ?? '',
    },
    notifications: {
      marketingEmailOptIn: settings.marketingEmailOptIn,
      smsOptIn: settings.smsOptIn,
    },
  };
}

export function mergeOrganizationSettingsViewModel(
  shell?: OrganizationSettingsShellContext | null,
  overrides?: Partial<OrganizationSettingsViewModel> | null
): OrganizationSettingsViewModel {
  const base = DEFAULT_ORGANIZATION_SETTINGS_VIEW_MODEL;

  const companyName =
    shell?.organizationName?.trim() ||
    overrides?.organization?.companyName ||
    base.organization.companyName;

  return {
    organization: {
      ...base.organization,
      ...overrides?.organization,
      companyName,
      logoUrl: shell?.logoUrl ?? overrides?.organization?.logoUrl ?? base.organization.logoUrl,
      industry: shell?.industry?.trim() || overrides?.organization?.industry || base.organization.industry,
      timezone: shell?.timezone?.trim() || overrides?.organization?.timezone || base.organization.timezone,
    },
    plan: { ...base.plan, ...overrides?.plan },
    members: overrides?.members ?? base.members,
    pendingInvites: overrides?.pendingInvites ?? base.pendingInvites,
    appAccess: overrides?.appAccess ?? base.appAccess,
    account: {
      ...base.account,
      ...overrides?.account,
      email: shell?.userEmail?.trim() || overrides?.account?.email || base.account.email,
      firstName: shell?.firstName?.trim() || overrides?.account?.firstName || base.account.firstName,
      lastName: shell?.lastName?.trim() || overrides?.account?.lastName || base.account.lastName,
    },
    notifications: { ...base.notifications, ...overrides?.notifications },
    billingApps: overrides?.billingApps ?? base.billingApps,
  };
}
