import type { OrganizationSettingsViewModel } from './types';

/** Empty / disconnected defaults — no fake users, seats, or billing rows. */
export const DEFAULT_ORGANIZATION_SETTINGS_VIEW_MODEL: OrganizationSettingsViewModel = {
  organization: {
    companyName: '',
    industry: '',
    timezone: '',
    logoUrl: null,
  },
  plan: {
    planName: '—',
    seatsUsed: 0,
    seatsTotal: 0,
    statusLabel: 'Not connected',
  },
  members: [],
  pendingInvites: [],
  appAccess: [],
  account: {
    firstName: '',
    lastName: '',
    email: '',
  },
  notifications: {
    marketingEmailOptIn: false,
    smsOptIn: false,
  },
  billingApps: [],
};
