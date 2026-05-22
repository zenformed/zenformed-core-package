export type OrganizationSettingsMemberRole = 'admin' | 'member' | 'lead';

export type OrganizationSettingsMember = {
  readonly id: string;
  readonly name: string;
  readonly role: OrganizationSettingsMemberRole;
};

export type OrganizationSettingsPendingInvite = {
  readonly id: string;
  readonly email: string;
  readonly sentLabel: string;
};

export type OrganizationSettingsAppAccess = {
  readonly id: string;
  readonly name: string;
  readonly planLabel: string;
  readonly statusLabel: string;
  readonly actionLabel: string;
  readonly isActive: boolean;
};

export type OrganizationSettingsPlan = {
  readonly planName: string;
  readonly seatsUsed: number;
  readonly seatsTotal: number;
  readonly statusLabel: string;
};

export type OrganizationSettingsProfile = {
  readonly companyName: string;
  readonly industry: string;
  readonly timezone: string;
  readonly logoUrl: string | null;
};

export type OrganizationSettingsAccountProfile = {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
};

export type OrganizationSettingsNotificationPrefs = {
  readonly marketingEmailOptIn: boolean;
  readonly smsOptIn: boolean;
};

export type OrganizationSettingsViewModel = {
  readonly organization: OrganizationSettingsProfile;
  readonly plan: OrganizationSettingsPlan;
  readonly members: readonly OrganizationSettingsMember[];
  readonly pendingInvites: readonly OrganizationSettingsPendingInvite[];
  readonly appAccess: readonly OrganizationSettingsAppAccess[];
  readonly account: OrganizationSettingsAccountProfile;
  readonly notifications: OrganizationSettingsNotificationPrefs;
  readonly billingApps: readonly OrganizationSettingsAppAccess[];
};

/** Live data from app shell (auth, branding) merged over mock defaults. */
export type OrganizationSettingsShellContext = {
  readonly userEmail?: string | null;
  readonly organizationName?: string | null;
  readonly logoUrl?: string | null;
  readonly industry?: string | null;
  readonly timezone?: string | null;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
};

export type OrganizationSettingsClassNames = {
  readonly panel: string;
  readonly accordion: string;
  readonly section: string;
  readonly sectionOpen: string;
  readonly sectionHeader: string;
  readonly sectionChevron: string;
  readonly sectionBody: string;
  readonly group: string;
  readonly groupOpen: string;
  readonly groupHeader: string;
  readonly groupChevron: string;
  readonly groupBody: string;
  readonly groupTitle: string;
  readonly row: string;
  readonly rowLabel: string;
  readonly rowValue: string;
  readonly field: string;
  readonly fieldLabel: string;
  readonly input: string;
  readonly select: string;
  readonly textarea: string;
  readonly hint: string;
  readonly actions: string;
  readonly btn: string;
  readonly btnPrimary: string;
  readonly btnGhost: string;
  readonly btnSmall: string;
  readonly badge: string;
  readonly badgeMuted: string;
  readonly badgeSuccess: string;
  readonly memberList: string;
  readonly memberRow: string;
  readonly memberName: string;
  readonly memberRoleSelect: string;
  readonly seatsSummary: string;
  readonly logoPreview: string;
  readonly logoInitial: string;
  readonly checkboxRow: string;
  readonly checkbox: string;
  readonly divider: string;
  readonly placeholderNote: string;
  readonly saveStatus: string;
  readonly saveStatusSuccess: string;
  readonly saveStatusError: string;
  readonly saveStatusMuted: string;
};

export type OrganizationSettingsDrawerClassNames = {
  readonly settingsOverlay: string;
  readonly settingsDrawer: string;
  readonly settingsDrawerWide: string;
  readonly settingsHeader: string;
  readonly settingsTitle: string;
  readonly settingsClose: string;
  readonly settingsContent: string;
};

export type OrganizationSettingsLabels = {
  readonly drawerTitle: string;
  readonly closeAriaLabel: string;
  readonly sectionOrganization: string;
  readonly sectionAccount: string;
  readonly sectionNotifications: string;
  readonly sectionAppsBilling: string;
  readonly orgProfile: string;
  readonly companyName: string;
  readonly logo: string;
  readonly industry: string;
  readonly timezone: string;
  readonly teamMembers: string;
  readonly seatsUsed: string;
  readonly inviteMember: string;
  readonly pendingInvites: string;
  readonly resend: string;
  readonly cancel: string;
  readonly appAccess: string;
  readonly profile: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly password: string;
  readonly oldPassword: string;
  readonly newPassword: string;
  readonly confirmPassword: string;
  readonly savePassword: string;
  readonly emailPreferences: string;
  readonly promotionalEmails: string;
  readonly promotionalEmailsHint: string;
  readonly textMessaging: string;
  readonly allowTextMessaging: string;
  readonly textMessagingHint: string;
  readonly organizationPlan: string;
  readonly apps: string;
  readonly billingActions: string;
  readonly manageBilling: string;
  readonly viewInvoices: string;
  readonly manage: string;
  readonly buy: string;
  readonly upgrade: string;
  readonly mockDataNote: string;
  readonly save: string;
  readonly saving: string;
  readonly saved: string;
  readonly saveFailed: string;
  readonly unsavedChanges: string;
  readonly loadingSettings: string;
};

export type { OrganizationSettingsPersistence, SettingsSaveStatus, ZenformedUserSettingsDto } from './userSettingsTypes';
