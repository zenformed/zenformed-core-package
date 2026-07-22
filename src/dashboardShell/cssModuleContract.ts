/**
 * Single source of truth for CSS module keys expected by `@zenformed/core/dashboard-shell` pick helpers.
 * Keep `CSS_MODULE_CONTRACT.md` in sync when changing these arrays.
 */

export const ZENFORMED_SIDEBAR_BRANDING_CSS_KEYS = [
  'sidebarAppBranding',
  'sidebarLogoCircleWrap',
  'sidebarLogoCircle',
  'sidebarLogoImg',
  'sidebarLogoInitial',
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
  'accountMenuSidebarHeader',
  'accountMenuSidebarIdentity',
  'accountMenuSidebarDivider',
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

export const ZENFORMED_SIDEBAR_ROW_CSS_KEYS = [
  'dashboardWithSidebar',
  'sidebarRail',
  'mainColumn',
] as const;

export const ZENFORMED_APP_ICON_NAV_MENU_CSS_KEYS = [
  'appIconNavWrap',
  'appIconNavTrigger',
  'appIconNavMenu',
  'appIconNavMenuItem',
  'appIconNavMenuItemActive',
  'appIconNavMenuItemDisabled',
] as const;

export const ZENFORMED_PAGE_LOADING_CSS_KEYS = ['page', 'loading'] as const;

export const ZENFORMED_APPS_LAUNCHER_CSS_KEYS = [
  'appsLauncherWrap',
  'appsLauncherTrigger',
  'appsLauncherIcon',
  'appsPopover',
  'appsMobileBackdrop',
  'appsPopoverList',
  'appsPopoverAppsPanel',
  'appsPopoverSection',
  'appsPopoverSectionTitle',
  'appsTileGrid',
  'appsTile',
  'appsTileDisabled',
  'appsTileIconWrap',
  'appsTileIcon',
  'appsTileIconFallback',
  'appsTileName',
  'appsTileMeta',
  'appsPopoverRow',
  'appsPopoverRowDisabled',
  'appsPopoverRowCurrent',
  'appsPopoverRowCheck',
  'appsPopoverRowText',
  'appsPopoverRowName',
  'appsPopoverRowDescription',
  'appsPopoverRowMeta',
  'appsPopoverSidebarList',
  'appCardGrid',
  'appCard',
  'appCardDisabled',
  'appCardIcon',
  'appCardIconFallback',
  'appCardBody',
  'appCardTitle',
  'appCardBadges',
  'appCardDescription',
  'appComingSoon',
  'appsLaunchError',
] as const;

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
  appIconNavMenu: {
    keys: ZENFORMED_APP_ICON_NAV_MENU_CSS_KEYS,
    stylesheet: 'App `dashboard.module.css`',
    consumers: ['ZenformedAppIconNavMenu', 'pickAppIconNavMenuClassNames'],
  },
  pageLoading: {
    keys: ZENFORMED_PAGE_LOADING_CSS_KEYS,
    stylesheet: 'App `dashboard.module.css`',
    consumers: ['ZenformedDashboardPageLoading', 'pickDashboardPageLoadingClassNames'],
  },
  appsLauncher: {
    keys: ZENFORMED_APPS_LAUNCHER_CSS_KEYS,
    stylesheet: 'App `platformDashboard.module.css` or equivalent apps launcher stylesheet',
    consumers: [
      'ZenformedAppsLauncher',
      'ZenformedAppList',
      'pickAppsLauncherClassNames',
    ],
  },
} as const;
