import type { ChangeEvent, RefObject } from 'react';
import type { SettingsSaveStatus } from './userSettingsTypes';

export type OrganizationSettingsMemberRole = 'owner' | 'admin' | 'coordinator' | 'member';

export type OrganizationSettingsMember = {
  readonly id: string;
  /** Display name (legacy `name` kept for compatibility). */
  readonly name: string;
  readonly displayName?: string;
  readonly email?: string | null;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly userId?: string;
  readonly role: OrganizationSettingsMemberRole;
};

export type OrganizationSettingsPendingInvite = {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly statusLabel: string;
  readonly sentLabel: string;
  readonly expiresLabel: string | null;
  readonly emailDeliveryStatus?: 'sent' | 'failed' | null;
};

export type OrganizationSettingsAppAccess = {
  readonly id: string;
  readonly appSlug?: string;
  readonly name: string;
  readonly planSlug?: string;
  readonly planLabel: string;
  readonly planBadgeVariant?: 'starter' | 'growth' | 'pro' | 'standard' | 'single' | 'default';
  readonly statusLabel: string;
  readonly statusBadgeVariant?: 'trial' | 'active' | 'inactive';
  readonly actionLabel: string;
  readonly isActive: boolean;
  readonly entitlementStatus?: string;
  readonly trialEndsLabel?: string | null;
  readonly daysRemaining?: number | null;
  readonly nextBillingDateLabel?: string | null;
  readonly manageEnabled?: boolean;
};

export type OrganizationSettingsPlan = {
  readonly planName: string;
  readonly seatsUsed: number;
  readonly seatsTotal: number;
  readonly statusLabel: string;
};

export type OrganizationSettingsProfile = {
  readonly legalName: string;
  readonly displayName: string;
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
  readonly inputNonEditable?: string;
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
  readonly memberRowMain: string;
  readonly memberRowControls: string;
  readonly memberDisplayName: string;
  readonly memberEmail: string;
  readonly memberRoleDescription: string;
  readonly memberRowActions: string;
  readonly memberRowControlPrimary: string;
  readonly memberRemoveBtn: string;
  readonly memberRemoveBtnIcon: string;
  readonly memberEditBtn: string;
  readonly memberEditBtnIcon: string;
  readonly memberEditPanel: string;
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
  readonly timezoneList: string;
  readonly timezoneOption: string;
  readonly industrySelect: string;
  readonly appBillingRow: string;
  readonly appBillingName: string;
  readonly appBillingPlan: string;
  readonly appBillingActiveCheck: string;
  readonly appBillingCard: string;
  readonly appBillingCardHeader: string;
  readonly appBillingLogo: string;
  readonly appBillingLogoFallback: string;
  readonly appBillingTitleBlock: string;
  readonly appBillingBadges: string;
  readonly appBillingBadge: string;
  readonly appBillingBadgePlanStarter: string;
  readonly appBillingBadgePlanGrowth: string;
  readonly appBillingBadgePlanPro: string;
  readonly appBillingBadgePlanDefault: string;
  readonly appBillingBadgeStatusTrial: string;
  readonly appBillingBadgeStatusActive: string;
  readonly appBillingBadgeStatusInactive: string;
  readonly appBillingDetails: string;
  readonly appBillingDetailRow: string;
  readonly appBillingActions: string;
  readonly appBillingFooter: string;
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
  readonly settingsSearchPlaceholder: string;
  readonly settingsSearchNoResults: string;
  readonly sectionOrganization: string;
  readonly sectionTeamMembers: string;
  readonly sectionAccount: string;
  readonly sectionNotifications: string;
  readonly sectionAppsBilling: string;
  readonly orgProfile: string;
  readonly legalName: string;
  readonly legalNameHint: string;
  readonly displayName: string;
  readonly displayNameHint: string;
  readonly logo: string;
  readonly industry: string;
  readonly timezone: string;
  readonly teamMembers: string;
  readonly seatsUsed: string;
  readonly inviteMember: string;
  readonly pendingInvites: string;
  readonly resend: string;
  readonly cancel: string;
  readonly removeMember: string;
  readonly removeMemberAriaLabel: string;
  readonly editMember: string;
  readonly editMemberAriaLabel: string;
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
  readonly manageSubscription: string;
  readonly trialEnds: string;
  readonly daysRemaining: string;
  readonly nextBillingDate: string;
  readonly appActiveAriaLabel: string;
  readonly buy: string;
  readonly upgrade: string;
  readonly mockDataNote: string;
  readonly save: string;
  readonly saving: string;
  readonly saved: string;
  readonly saveFailed: string;
  readonly unsavedChanges: string;
  readonly loadingSettings: string;
  readonly organizationPlaceholderNote: string;
  readonly billingPlaceholderNote: string;
  readonly passwordChangeComingSoon: string;
  readonly resetPassword: string;
  readonly noTeamMembersYet: string;
  readonly teamMembersSearchPlaceholder: string;
  readonly teamMembersFilterAll: string;
  readonly teamMembersNoSearchResults: string;
  readonly noPendingInvitesYet: string;
  readonly noAppAccessYet: string;
  readonly seatsNotConnected: string;
  readonly planNotConnected: string;
  readonly uploadLogo: string;
  readonly uploadingLogo: string;
  readonly saveOrganizationProfile: string;
  readonly industryCnc: string;
  readonly industryHvac: string;
  readonly industryPlumbing: string;
  readonly industryNone: string;
  readonly timezoneSearchPlaceholder: string;
  readonly inviteComingSoon: string;
  readonly inviteEmailSent: string;
  readonly inviteEmailFailed: string;
  readonly memberReactivatedSuccess: string;
  readonly sendInvite: string;
  readonly cancelInvite: string;
  readonly copyInviteLink: string;
  readonly inviteLinkCopied: string;
  readonly inviteLinkCopyHint: string;
  readonly dismissInviteLink: string;
  readonly resendComingSoon: string;
  readonly role: string;
};

export type OrganizationBrandingProfileDto = {
  readonly legalName: string;
  readonly displayName: string;
  readonly publicDisplayName: string;
  readonly canEditOrganizationProfile: boolean;
  readonly hasLogo: boolean;
  readonly industry: string | null;
  readonly timezone: string | null;
  readonly logoUrl?: string | null;
};

export type OrganizationSettingsBrandingPersistence = {
  readonly isLoading?: boolean;
  readonly loadError?: string | null;
  readonly hasLiveData?: boolean;
  readonly canEditOrganizationProfile?: boolean;
  readonly profileSaveStatus?: SettingsSaveStatus;
  readonly saveErrorMessage?: string | null;
  readonly logoUploading?: boolean;
  readonly onSaveOrganizationProfile?: (payload: {
    legalName: string;
    displayName: string;
    industry: string | null;
    timezone: string | null;
  }) => Promise<boolean>;
  readonly onUploadLogoClick?: () => void;
  readonly logoInputRef?: RefObject<HTMLInputElement>;
  readonly onLogoFileChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

export type { OrganizationSettingsPersistence, SettingsSaveStatus, ZenformedUserSettingsDto } from './userSettingsTypes';
