/**
 * Single source of truth for CSS module keys expected by `@zenformed/core/dashboard-shell` pick helpers.
 * Keep `CSS_MODULE_CONTRACT.md` in sync when changing these arrays.
 */

export const ZENFORMED_SIDEBAR_BRANDING_CSS_KEYS = [
  'accountMenuLogoFileInput',
  'sidebarLogoCircleWrap',
  'sidebarLogoCircle',
  'sidebarLogoImg',
  'sidebarLogoInitial',
  'sidebarLogoCameraBtn',
] as const;

export const ZENFORMED_HEADER_SHELL_CSS_KEYS = [
  'header',
  'headerLeft',
  'headerRight',
  'headerRightUserBlock',
  'headerUserEmail',
  'badgeRow',
  'tierBadge',
  'tierBadgePro',
  'tierBadgeStandard',
  'adminBadge',
  'accountMenuWrap',
  'accountMenuTrigger',
  'accountMenuTriggerImg',
  'accountMenuTriggerAvatar',
  'accountMenuDropdown',
  'accountMenuEmail',
  'accountMenuPhotoWrap',
  'accountMenuPhotoCircle',
  'accountMenuPhotoImg',
  'accountMenuAvatar',
  'accountMenuPhotoCameraBtn',
  'accountMenuShopName',
  'accountMenuBtn',
  'accountMenuBtnIcon',
] as const;

export const ZENFORMED_CONFIRM_SNACKBAR_CSS_KEYS = [
  'snackbar',
  'snackbarInner',
  'snackbarIcon',
  'icon',
  'iconDanger',
  'snackbarText',
  'snackbarTitle',
  'snackbarMessage',
  'snackbarActions',
  'cancelBtn',
  'confirmBtn',
  'confirmBtnDanger',
] as const;

export const ZENFORMED_SETTINGS_DRAWER_CSS_KEYS = [
  'settingsOverlay',
  'settingsDrawer',
  'settingsHeader',
  'settingsTitle',
  'settingsClose',
  'settingsTabs',
  'settingsTab',
  'settingsTabActive',
  'settingsContent',
] as const;

export const ZENFORMED_APP_SHELL_CSS_KEYS = ['appLayout'] as const;

export const ZENFORMED_SIDEBAR_ROW_CSS_KEYS = ['dashboardWithSidebar', 'mainColumn'] as const;

export const ZENFORMED_PAGE_LOADING_CSS_KEYS = ['page', 'loading'] as const;

/** Human-readable bundle labels for dev warnings + docs. */
export const ZENFORMED_DASHBOARD_SHELL_CSS_SOURCES = {
  sidebarBranding: {
    keys: ZENFORMED_SIDEBAR_BRANDING_CSS_KEYS,
    stylesheet: 'App `app/(dashboard)/dashboard/dashboard.module.css` (or equivalent)',
    consumers: ['ZenformedSidebarBranding', 'pickSidebarBrandingClassNames'],
  },
  headerShell: {
    keys: ZENFORMED_HEADER_SHELL_CSS_KEYS,
    stylesheet: 'App `dashboard.module.css`',
    consumers: ['ZenformedDashboardHeader', 'ZenformedAccountMenu', 'pickHeaderShellClassNames'],
  },
  confirmSnackbar: {
    keys: ZENFORMED_CONFIRM_SNACKBAR_CSS_KEYS,
    stylesheet: 'App `ConfirmModal.module.css` (same keys as legacy ConfirmModal)',
    consumers: ['ZenformedConfirmSnackbar', 'pickConfirmSnackbarClassNames'],
  },
  settingsDrawer: {
    keys: ZENFORMED_SETTINGS_DRAWER_CSS_KEYS,
    stylesheet: 'App `dashboard.module.css`',
    consumers: ['ZenformedSettingsDrawer', 'pickSettingsDrawerClassNames'],
  },
  appShell: {
    keys: ZENFORMED_APP_SHELL_CSS_KEYS,
    stylesheet: 'App `dashboard.module.css`',
    consumers: ['ZenformedDashboardAppShell', 'pickDashboardAppShellClassNames', 'pickDashboardLayoutClassNames'],
  },
  sidebarRow: {
    keys: ZENFORMED_SIDEBAR_ROW_CSS_KEYS,
    stylesheet: 'App `dashboard.module.css`',
    consumers: ['ZenformedDashboardSidebarRow', 'pickDashboardSidebarRowClassNames', 'pickDashboardLayoutClassNames'],
  },
  pageLoading: {
    keys: ZENFORMED_PAGE_LOADING_CSS_KEYS,
    stylesheet: 'App `dashboard.module.css`',
    consumers: ['ZenformedDashboardPageLoading', 'pickDashboardPageLoadingClassNames'],
  },
} as const;
