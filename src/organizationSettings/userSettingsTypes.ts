import type { OrganizationSettingsBrandingPersistence } from './types';
import type { OrganizationPermissions } from './organizationPermissions';
import type { OrganizationSettingsWorkspacePersistence } from './organizationWorkspaceTypes';

/** Wire shape for ZenformedCore `GET|PATCH /users/me/settings`. */
export type ZenformedUserSettingsDto = {
  readonly email: string | null;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly marketingEmailOptIn: boolean;
  readonly smsOptIn: boolean;
};

export type ZenformedUserSettingsPatch = {
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly email?: string | null;
  readonly marketingEmailOptIn?: boolean;
  readonly smsOptIn?: boolean;
};

export type SettingsSaveStatus = 'idle' | 'loading' | 'saving' | 'saved' | 'error';

export type OrganizationSettingsPersistence = {
  readonly permissions?: OrganizationPermissions | null;
  readonly isLoading?: boolean;
  readonly loadError?: string | null;
  readonly hasLiveData?: boolean;
  readonly accountSaveStatus?: SettingsSaveStatus;
  readonly notificationsSaveStatus?: SettingsSaveStatus;
  readonly saveErrorMessage?: string | null;
  readonly onSaveAccount?: (payload: {
    firstName: string;
    lastName: string;
    email?: string;
  }) => Promise<boolean>;
  readonly onSaveNotifications?: (payload: {
    marketingEmailOptIn: boolean;
    smsOptIn: boolean;
  }) => Promise<boolean>;
  readonly branding?: OrganizationSettingsBrandingPersistence;
  readonly workspace?: OrganizationSettingsWorkspacePersistence;
  /** App-hosted route for password reset (e.g. `/forgot-password`). */
  readonly forgotPasswordHref?: string | null;
};
