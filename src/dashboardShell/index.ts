/**
 * @zenformed/core/dashboard-shell — shared Zenformed dashboard frame, header, branding, confirms, settings drawer (client-only).
 *
 * Intentionally app-local (large surface; calls app `/api/auth/*`): **ProfilePhotoModal** shell —
 * shared **default avatar catalog** (`ZENFORMED_DEFAULT_AVATAR_SEEDS`, `zenformedDefaultAvatarSrc`) lives here; SVG bytes stay under each app `public/avatars/` (see `assets/default-avatars/README.md`).
 */

export { getCompanyInitial, companyCircleColor } from './brandingUtils';
export { getUserInitials, userCircleColor } from './accountMenuUtils';
export { pickSidebarBrandingClassNames } from './pickSidebarBrandingClassNames';
export { ZenformedSidebarBranding } from './ZenformedSidebarBranding';
export { ZenformedSidebarBrandingCameraIcon } from './ZenformedSidebarBrandingCameraIcon';
export { useOrganizationLogoUpload } from './useOrganizationLogoUpload';
export { useAccountMenuState } from './useAccountMenuState';
export { pickHeaderShellClassNames } from './pickHeaderShellClassNames';
export { ZenformedDashboardHeader } from './ZenformedDashboardHeader';
export { ZenformedAccountMenu } from './ZenformedAccountMenu';
export {
  ZenformedAccountMenuCameraIcon,
  ZenformedAccountMenuSettingsIcon,
  ZenformedAccountMenuSignOutIcon,
} from './ZenformedAccountMenuIcons';

export { ZenformedConfirmSnackbar } from './ZenformedConfirmSnackbar';
export { pickConfirmSnackbarClassNames } from './pickConfirmSnackbarClassNames';
export { ZenformedSettingsDrawer } from './ZenformedSettingsDrawer';
export { pickSettingsDrawerClassNames } from './pickSettingsDrawerClassNames';
export { ZenformedDashboardAppShell } from './ZenformedDashboardAppShell';
export { ZenformedDashboardSidebarRow } from './ZenformedDashboardSidebarRow';
export {
  pickDashboardAppShellClassNames,
  pickDashboardSidebarRowClassNames,
  pickDashboardLayoutClassNames,
} from './pickDashboardLayoutClassNames';
export { ZenformedDashboardPageLoading } from './ZenformedDashboardPageLoading';
export { pickDashboardPageLoadingClassNames } from './pickDashboardPageLoadingClassNames';

export {
  ZENFORMED_DEFAULT_AVATAR_SEEDS,
  zenformedDefaultAvatarSrc,
  isZenformedDefaultAvatarSeed,
} from './avatars/defaultAvatarCatalog';

export {
  ZENFORMED_SIDEBAR_BRANDING_CSS_KEYS,
  ZENFORMED_HEADER_SHELL_CSS_KEYS,
  ZENFORMED_CONFIRM_SNACKBAR_CSS_KEYS,
  ZENFORMED_SETTINGS_DRAWER_CSS_KEYS,
  ZENFORMED_APP_SHELL_CSS_KEYS,
  ZENFORMED_SIDEBAR_ROW_CSS_KEYS,
  ZENFORMED_PAGE_LOADING_CSS_KEYS,
  ZENFORMED_DASHBOARD_SHELL_CSS_SOURCES,
} from './cssModuleContract';

export type {
  ZenformedSidebarBrandingClassNames,
  ZenformedSidebarBrandingProps,
  UseOrganizationLogoUploadOptions,
  UseOrganizationLogoUploadResult,
  ZenformedDashboardHeaderClassNames,
  ZenformedDashboardHeaderProps,
  ZenformedAccountMenuLabels,
  ZenformedAccountMenuProps,
  ZenformedConfirmSnackbarClassNames,
  ZenformedSettingsDrawerClassNames,
  ZenformedSettingsDrawerSection,
  ZenformedDashboardAppShellClassNames,
  ZenformedDashboardSidebarRowClassNames,
  ZenformedDashboardPageLoadingClassNames,
} from './types';
export type { ZenformedConfirmSnackbarProps } from './ZenformedConfirmSnackbar';
export type { ZenformedSettingsDrawerProps } from './ZenformedSettingsDrawer';
export type { ZenformedDashboardAppShellProps } from './ZenformedDashboardAppShell';
export type { ZenformedDashboardSidebarRowProps } from './ZenformedDashboardSidebarRow';
export type { ZenformedDashboardPageLoadingProps } from './ZenformedDashboardPageLoading';
export type { ZenformedDefaultAvatarSeed, ZenformedDefaultAvatarSrcOptions } from './avatars/defaultAvatarCatalog';
export type { UseAccountMenuStateResult } from './useAccountMenuState';
