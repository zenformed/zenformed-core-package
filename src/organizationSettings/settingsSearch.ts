import type { OrganizationSettingsLabels } from './types';
import type { SettingsCategoryId } from './settingsCategories';

export type SettingsSearchEntry = {
  readonly id: string;
  readonly category: SettingsCategoryId;
  readonly label: string;
  readonly keywords: readonly string[];
};

export function buildSettingsSearchIndex(
  labels: OrganizationSettingsLabels
): readonly SettingsSearchEntry[] {
  return [
    {
      id: 'legal-name',
      category: 'organization',
      label: labels.legalName,
      keywords: ['legal', 'legal name', 'organization name', 'billing', 'tax', 'contract', 'invoice'],
    },
    {
      id: 'display-name',
      category: 'organization',
      label: labels.displayName,
      keywords: ['display', 'display name', 'public', 'navbar', 'label', 'shop'],
    },
    {
      id: 'logo',
      category: 'organization',
      label: labels.logo,
      keywords: ['logo', 'image', 'brand', 'avatar', 'icon'],
    },
    {
      id: 'industry',
      category: 'organization',
      label: labels.industry,
      keywords: ['industry', 'cnc', 'hvac', 'plumbing', 'trade'],
    },
    {
      id: 'timezone',
      category: 'organization',
      label: labels.timezone,
      keywords: ['timezone', 'time zone', 'clock', 'iana'],
    },
    {
      id: 'team-members',
      category: 'organization',
      label: labels.teamMembers,
      keywords: ['team', 'team members', 'members', 'users', 'staff', 'seats'],
    },
    {
      id: 'invites',
      category: 'organization',
      label: labels.pendingInvites,
      keywords: ['invite', 'invites', 'pending', 'invitation', 'email invite'],
    },
    {
      id: 'seats',
      category: 'organization',
      label: labels.seatsUsed,
      keywords: ['seats', 'seat', 'license seats', 'capacity'],
    },
    {
      id: 'profile',
      category: 'account',
      label: labels.profile,
      keywords: ['profile', 'first name', 'last name', 'name', 'account'],
    },
    {
      id: 'email',
      category: 'account',
      label: labels.email,
      keywords: ['email', 'address', 'login'],
    },
    {
      id: 'password',
      category: 'account',
      label: labels.password,
      keywords: ['password', 'pass', 'security', 'credentials'],
    },
    {
      id: 'email-prefs',
      category: 'notifications',
      label: labels.emailPreferences,
      keywords: ['email', 'promotional', 'marketing', 'notifications', 'opt in'],
    },
    {
      id: 'sms',
      category: 'notifications',
      label: labels.textMessaging,
      keywords: ['sms', 'text', 'messaging', 'phone', 'notifications'],
    },
    {
      id: 'plan',
      category: 'appsBilling',
      label: labels.organizationPlan,
      keywords: ['plan', 'subscription', 'organization plan', 'billing plan'],
    },
    {
      id: 'apps',
      category: 'appsBilling',
      label: labels.apps,
      keywords: ['apps', 'app access', 'entitlements', 'products'],
    },
    {
      id: 'billing',
      category: 'appsBilling',
      label: labels.billingActions,
      keywords: ['billing', 'invoice', 'invoices', 'payment', 'subscribe', 'manage billing'],
    },
  ];
}

export function filterSettingsSearch(
  index: readonly SettingsSearchEntry[],
  query: string
): SettingsSearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return index.filter((entry) => {
    if (entry.label.toLowerCase().includes(q)) return true;
    return entry.keywords.some((kw) => kw.includes(q) || q.includes(kw));
  });
}
