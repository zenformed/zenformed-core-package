/**
 * @zenformed/core/dashboard-shell — shared Zenformed dashboard frame, header, branding, confirms, settings drawer, profile photo modal (client-only).
 *
 * Shared **default avatar catalog** (`ZENFORMED_DEFAULT_AVATAR_SEEDS`, `zenformedDefaultAvatarSrc`) lives here; SVG bytes stay under each app `public/avatars/` (see `assets/default-avatars/README.md`).
 */

export { formatOrganizationRoleLabel } from './formatOrganizationRoleLabel';
export { getCompanyInitial, companyCircleColor } from './brandingUtils';
export {
  getUserInitials,
  resolveInitialsFromLabel,
  resolveAccountMenuUser,
  readNameFieldsFromUserMetadata,
  userCircleColor,
  resolveAccountMenuDisplayName,
} from './accountMenuUtils';
export type { AccountMenuUserIdentity } from './accountMenuUtils';
export { useZenformedShellUserDisplay } from './useZenformedShellUserDisplay';
export type { UseZenformedShellUserDisplayOptions } from './useZenformedShellUserDisplay';
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

export { ZenformedCollapsibleSidebarShell } from './collapsibleSidebar/ZenformedCollapsibleSidebarShell';
export { ZenformedSidebarAppChevrons } from './collapsibleSidebar/ZenformedSidebarSections';
export { ZenformedSidebarAppsTriggerChrome } from './collapsibleSidebar/ZenformedSidebarAppsTriggerChrome';
export { ZenformedSidebarActionRow } from './collapsibleSidebar/ZenformedSidebarActionRow';
export { useZenformedSidebarExpandState } from './collapsibleSidebar/useZenformedSidebarExpandState';
export {
  resolveSidebarSectionLabelText,
  shouldOverlayExpandedSidebar,
  shouldReserveCollapsedSidebarWidth,
  shouldShowSidebarAppName,
  ZENFORMED_SIDEBAR_COLLAPSED_LABEL_SAFE_MAX_CHARS,
  ZENFORMED_SIDEBAR_COLLAPSED_WIDTH_REM,
  ZENFORMED_SIDEBAR_EXPANDED_WIDTH_REM,
  ZENFORMED_SIDEBAR_HOVER_CLOSE_DELAY_MS,
  ZENFORMED_SIDEBAR_HOVER_OPEN_DELAY_MS,
  ZENFORMED_SIDEBAR_ICON_COLUMN_REM,
  ZENFORMED_SIDEBAR_ROW_HEIGHT_REM,
  ZENFORMED_SIDEBAR_SECTION_LABEL_HEIGHT_REM,
} from './collapsibleSidebar/types';
export type {
  ZenformedCollapsibleSidebarShellProps,
  ZenformedSidebarAccountConfig,
  ZenformedSidebarCustomSection,
  ZenformedSidebarNavItem,
  ZenformedSidebarNavSection,
  ZenformedSidebarSection,
  ZenformedSidebarSettingsConfig,
} from './collapsibleSidebar/types';
export type { ZenformedSidebarActionRowProps } from './collapsibleSidebar/ZenformedSidebarActionRow';
export type { ZenformedSidebarAppsTriggerChromeProps } from './collapsibleSidebar/ZenformedSidebarAppsTriggerChrome';

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

export { useZenformedMobileShellLayout, ZENFORMED_MOBILE_SHELL_BREAKPOINT_PX } from './useZenformedMobileShellLayout';
export { useZenformedUserAvatar } from './useZenformedUserAvatar';
export type {
  UseZenformedUserAvatarOptions,
  UseZenformedUserAvatarResult,
  ZenformedUserAvatarIdentity,
  ZenformedUserAvatarMeResponse,
} from './useZenformedUserAvatar';
export { ZenformedAppIconNavMenu } from './ZenformedAppIconNavMenu';
export { pickAppIconNavMenuClassNames } from './pickAppIconNavMenuClassNames';

export { ZenformedAppsLauncher } from './appsLauncher/ZenformedAppsLauncher';
export { ZenformedAppList } from './appsLauncher/ZenformedAppList';
export { useZenformedAppLaunch } from './appsLauncher/useZenformedAppLaunch';
export { pickAppsLauncherClassNames } from './appsLauncher/pickAppsLauncherClassNames';
export type {
  ZenformedAppRegistryEntry,
  ZenformedAppEntitlementBadges,
  ZenformedAppStatus,
  ZenformedAppsLauncherClassNames,
  ZenformedAppsLauncherLabels,
  ZenformedAppsLauncherLayoutOptions,
} from './appsLauncher/types';
export type { ZenformedAppsLauncherProps } from './appsLauncher/ZenformedAppsLauncher';
export type { ZenformedAppListProps } from './appsLauncher/ZenformedAppList';
export type {
  UseZenformedAppLaunchOptions,
  UseZenformedAppLaunchResult,
} from './appsLauncher/useZenformedAppLaunch';
export {
  ZENFORMED_ECOSYSTEM_APP_ICON_IDS,
  isZenformedEcosystemAppIconId,
  resolveZenformedAppIconSrc,
  zenformedAppIconPublicSrc,
  zenformedAppIconSrc,
} from './appsLauncher/zenformedAppIconCatalog';
export type {
  ZenformedEcosystemAppIconId,
  ZenformedAppIconPublicSrcOptions,
} from './appsLauncher/zenformedAppIconCatalog';

export { createZenformedNotificationsApi } from './notifications/createZenformedNotificationsApi';
export type { CreateZenformedNotificationsApiOptions } from './notifications/createZenformedNotificationsApi';
export { ZenformedNotificationsMenu } from './notifications/ZenformedNotificationsMenu';
export type { ZenformedNotificationsMenuProps } from './notifications/ZenformedNotificationsMenu';
export { ZenformedNotificationsPage } from './notifications/ZenformedNotificationsPage';
export type { ZenformedNotificationsPageProps } from './notifications/ZenformedNotificationsPage';
export { ZenformedNotificationItem } from './notifications/ZenformedNotificationItem';
export type { ZenformedNotificationItemProps } from './notifications/ZenformedNotificationItem';
export { useZenformedNotificationsController } from './notifications/useZenformedNotificationsController';
export type {
  UseZenformedNotificationsControllerOptions,
  UseZenformedNotificationsControllerResult,
} from './notifications/useZenformedNotificationsController';
export {
  shouldFetchUnreadOnControllerMount,
  shouldRunUnreadPollTick,
  shouldRefreshUnreadOnVisibilityState,
  shouldFetchLatestOnDropdownOpen,
  UNREAD_POLL_API_IDENTITY_NOTE,
} from './notifications/unreadCountPollLifecycle';
export { ZenformedNotificationsApiError } from './notifications/notificationErrors';
export {
  formatUnreadBadgeLabel,
  formatNotificationsTriggerAriaLabel,
  clampUnreadCount,
  decrementUnreadCount,
} from './notifications/notificationStateHelpers';
export {
  resolveNotificationAppIdentity,
  resolveNotificationAppDisplayName,
  stripRedundantAppNameBodyPrefix,
} from './notifications/resolveNotificationAppIdentity';
export type { ZenformedNotificationAppIdentity } from './notifications/resolveNotificationAppIdentity';
export {
  formatNotificationRelativeTime,
  formatNotificationAbsoluteDateTime,
} from './notifications/formatNotificationRelativeTime';
export { isSafeNotificationDestinationUrl } from './notifications/destinationUrlSafety';
export {
  ZENFORMED_NOTIFICATION_FIXTURES,
  ZENFORMED_NOTIFICATION_FIXTURE_LIST,
} from './notifications/fixtures';
export type {
  ZenformedNotification,
  ZenformedNotificationsApi,
  ZenformedNotificationsPageResult,
  ZenformedNotificationsUnreadResult,
  ZenformedDashboardNotificationsConfig,
} from './notifications/types';

export {
  ZENFORMED_DEFAULT_AVATAR_SEEDS,
  zenformedDefaultAvatarSrc,
  isZenformedDefaultAvatarSeed,
} from './avatars/defaultAvatarCatalog';

export {
  ZenformedProfilePhotoModal,
  ProfilePhotoModal,
} from './profilePhotoModal/ZenformedProfilePhotoModal';
export type {
  ZenformedProfilePhotoModalProps,
  ProfilePhotoModalProps,
} from './profilePhotoModal/ZenformedProfilePhotoModal';
export { createCroppedImage } from './profilePhotoModal/createCroppedImage';
export type { Area as ProfilePhotoCropArea } from './profilePhotoModal/createCroppedImage';

export {
  ZENFORMED_SIDEBAR_BRANDING_CSS_KEYS,
  ZENFORMED_HEADER_SHELL_CSS_KEYS,
  ZENFORMED_CONFIRM_SNACKBAR_CSS_KEYS,
  ZENFORMED_SETTINGS_DRAWER_CSS_KEYS,
  ZENFORMED_APP_SHELL_CSS_KEYS,
  ZENFORMED_SIDEBAR_ROW_CSS_KEYS,
  ZENFORMED_PAGE_LOADING_CSS_KEYS,
  ZENFORMED_APPS_LAUNCHER_CSS_KEYS,
  ZENFORMED_DASHBOARD_SHELL_CSS_SOURCES,
} from './cssModuleContract';

export type {
  ZenformedSidebarBrandingClassNames,
  ZenformedSidebarBrandingProps,
  UseOrganizationLogoUploadOptions,
  UseOrganizationLogoUploadResult,
  ZenformedDashboardHeaderClassNames,
  ZenformedDashboardHeaderProps,
  ZenformedDashboardHeaderUser,
  ZenformedAccountMenuLabels,
  ZenformedAccountMenuProps,
  ZenformedConfirmSnackbarClassNames,
  ZenformedSettingsDrawerClassNames,
  ZenformedSettingsDrawerSection,
  ZenformedDashboardAppShellClassNames,
  ZenformedDashboardSidebarRowClassNames,
  ZenformedDashboardPageLoadingClassNames,
  ZenformedAppIconNavMenuClassNames,
  ZenformedAppIconNavMenuItem,
  ZenformedAppIconNavMenuProps,
} from './types';
export type { ZenformedConfirmSnackbarProps } from './ZenformedConfirmSnackbar';
export type { ZenformedSettingsDrawerProps } from './ZenformedSettingsDrawer';
export type { ZenformedDashboardAppShellProps } from './ZenformedDashboardAppShell';
export type { ZenformedDashboardSidebarRowProps } from './ZenformedDashboardSidebarRow';
export type { ZenformedDashboardPageLoadingProps } from './ZenformedDashboardPageLoading';
export type { ZenformedDefaultAvatarSeed, ZenformedDefaultAvatarSrcOptions } from './avatars/defaultAvatarCatalog';
export type { UseAccountMenuStateResult } from './useAccountMenuState';
