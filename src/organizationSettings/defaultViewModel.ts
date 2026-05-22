import type { OrganizationSettingsViewModel } from './types';

export const DEFAULT_ORGANIZATION_SETTINGS_VIEW_MODEL: OrganizationSettingsViewModel = {
  organization: {
    companyName: 'Zenformed Demo Co.',
    industry: 'Construction',
    timezone: 'America/New_York',
    logoUrl: null,
  },
  plan: {
    planName: 'Growth',
    seatsUsed: 6,
    seatsTotal: 10,
    statusLabel: 'Active',
  },
  members: [
    { id: '1', name: 'John Wilcock', role: 'admin' },
    { id: '2', name: 'Doug Wallace', role: 'member' },
    { id: '3', name: 'James Carter', role: 'lead' },
  ],
  pendingInvites: [{ id: 'inv-1', email: 'mike@email.com', sentLabel: 'Sent May 21' }],
  appAccess: [
    {
      id: 'buildcore',
      name: 'BuildCore',
      planLabel: 'Growth',
      statusLabel: 'Active',
      actionLabel: 'Upgrade',
      isActive: true,
    },
    {
      id: 'forgecore',
      name: 'ForgeCore',
      planLabel: 'Growth',
      statusLabel: 'Active',
      actionLabel: 'Upgrade',
      isActive: true,
    },
    {
      id: 'servicecore',
      name: 'ServiceCore',
      planLabel: '—',
      statusLabel: 'Available',
      actionLabel: 'Buy',
      isActive: false,
    },
  ],
  account: {
    firstName: '',
    lastName: '',
    email: '',
  },
  notifications: {
    marketingEmailOptIn: true,
    smsOptIn: false,
  },
  billingApps: [
    {
      id: 'buildcore',
      name: 'BuildCore',
      planLabel: 'Growth',
      statusLabel: 'Active',
      actionLabel: 'Manage',
      isActive: true,
    },
    {
      id: 'forgecore',
      name: 'ForgeCore',
      planLabel: 'Growth',
      statusLabel: 'Active',
      actionLabel: 'Manage',
      isActive: true,
    },
    {
      id: 'servicecore',
      name: 'ServiceCore',
      planLabel: '—',
      statusLabel: 'Not active',
      actionLabel: 'Buy',
      isActive: false,
    },
  ],
};
