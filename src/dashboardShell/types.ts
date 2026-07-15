import type { ChangeEvent, ReactNode, RefObject } from 'react';
import type { ZenformedDashboardNotificationsConfig } from './notifications/types';

/** Optional CSS module class map override for shared shell components. */
export type CSSModuleClasses = Record<string, string>;

/** Class names from the app `dashboard.module.css` sidebar app branding block. */
export type ZenformedSidebarBrandingClassNames = {
  sidebarAppBranding: string;
  sidebarLogoCircleWrap: string;
  sidebarLogoCircle: string;
  sidebarLogoImg: string;
  sidebarLogoInitial: string;
};

export type ZenformedSidebarBrandingProps = {
  classNames: ZenformedSidebarBrandingClassNames;
  /** App display name — alt/title and icon fallback; not rendered as sidebar text. */
  appName?: string;
  /** App icon URL — use `zenformedAppIconSrc` or a custom asset. */
  appIconSrc?: string | null;
  /** Image alt text; defaults to resolved display name. */
  appAltText?: string;
  /** @deprecated Pre–app-icon sidebar API; used when `appName` is omitted during rollout. */
  shopName?: string;
  /** @deprecated Pre–app-icon sidebar API; fallback display name. */
  defaultShopNameFallback?: string;
  /** @deprecated Pre–app-icon sidebar API; shown only when `appIconSrc` is omitted. */
  logoUrl?: string | null;
  /** @deprecated Pre–app-icon sidebar API; loading placeholder for legacy org logo. */
  brandingLoading?: boolean;
};

export type UseOrganizationLogoUploadOptions = {
  brandingApiUrl: string;
  getAccessToken: () => string | null;
  refetchBranding: () => Promise<void>;
  logoSaveFailedFallback: string;
  onUploadError?: (message: string) => void;
};

export type UseOrganizationLogoUploadResult = {
  logoUploading: boolean;
  headerLogoFileInputRef: RefObject<HTMLInputElement>;
  handleLogoFileChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
};

/** Class names from the app `dashboard.module.css` header + account menu block. */
export type ZenformedDashboardHeaderClassNames = {
  header: string;
  headerLeft: string;
  headerRight: string;
  headerRightUserBlock: string;
  headerUserEmail: string;
  badgeRow: string;
  tierBadge: string;
  tierBadgePro: string;
  tierBadgeStandard: string;
  adminBadge: string;
  accountMenuWrap: string;
  accountMenuTrigger: string;
  accountMenuTriggerImg: string;
  accountMenuTriggerAvatar: string;
  accountMenuDropdown: string;
  accountMenuEmail: string;
  accountMenuPhotoWrap: string;
  accountMenuPhotoCircle: string;
  accountMenuPhotoImg: string;
  accountMenuAvatar: string;
  accountMenuPhotoCameraBtn: string;
  accountMenuShopName: string;
  accountMenuBtn: string;
  accountMenuBtnIcon: string;
};

export type ZenformedAccountMenuLabels = {
  menuTriggerAriaLabel: string;
  planAriaLabelPrefix: string;
  /** @deprecated Use `organizationRoleLabel` on header props; kept for account menu compat. */
  adminBadgeLabel: string;
  roleAriaLabelPrefix?: string;
  profilePhotoChangeTitle: string;
  profilePhotoChangeAriaLabel: string;
  settingsButtonLabel: string;
  signOutButtonLabel: string;
};

export type ZenformedAccountMenuProps = {
  classNames: ZenformedDashboardHeaderClassNames;
  user: ZenformedDashboardHeaderUser;
  userDisplayName: string;
  avatarUrl: string | null | undefined;
  avatarLoading: boolean;
  /** @deprecated Ignored in account menu UI; legacy profiles.license_tier must not render as a plan badge. */
  effectiveLicenseTier?: string | null;
  organizationRoleLabel?: string | null;
  labels: ZenformedAccountMenuLabels;
  onOpenSettings: () => void;
  onRequestSignOutConfirm: () => void;
  onRequestProfilePhotoModal: () => void;
  /** When false, account menu shows initials only and hides change-photo control. Default false. */
  profilePhotoChangeEnabled?: boolean;
  settingsIcon?: ReactNode;
  signOutIcon?: ReactNode;
  profilePhotoCameraIcon?: ReactNode;
  accountMenuOpen: boolean;
  setAccountMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  accountMenuRef: RefObject<HTMLDivElement>;
  closeAccountMenu: () => void;
};

export type ZenformedDashboardHeaderUser = {
  email: string;
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

export type ZenformedDashboardHeaderProps = {
  classNames: ZenformedDashboardHeaderClassNames;
  user: ZenformedDashboardHeaderUser | null;
  avatarUrl: string | null | undefined;
  avatarLoading: boolean;
  /** @deprecated Ignored in account menu UI; legacy profiles.license_tier must not render as a plan badge. */
  effectiveLicenseTier?: string | null;
  /** Organization role badge (Owner, Admin, Coordinator, Member). */
  organizationRoleLabel?: string | null;
  labels: ZenformedAccountMenuLabels;
  themeToggle: ReactNode;
  onOpenSettings: () => void;
  onRequestSignOutConfirm: () => void;
  onRequestProfilePhotoModal: () => void;
  /** When false, account menu shows initials only and hides change-photo control. Default false. */
  profilePhotoChangeEnabled?: boolean;
  /** When set with `getAccessToken` and `sessionUserId`, loads first/last name for the menu label. */
  settingsApiUrl?: string;
  getAccessToken?: () => string | null;
  sessionUserId?: string | null;
  /** App-specific toolbar (e.g. ForgeCore search + new work order). */
  centerSlot?: ReactNode;
  /** Override default empty `headerLeft` (ForgeCore uses aria-hidden placeholder). */
  leftSlot?: ReactNode;
  /**
   * Opt-in platform notifications envelope (before account avatar).
   * Omit to leave the header unchanged for existing consumers.
   */
  notifications?: ZenformedDashboardNotificationsConfig | null;
  settingsIcon?: ReactNode;
  signOutIcon?: ReactNode;
  profilePhotoCameraIcon?: ReactNode;
};

export type ZenformedConfirmSnackbarClassNames = {
  snackbar: string;
  snackbarInner: string;
  snackbarIcon: string;
  icon: string;
  iconDanger: string;
  snackbarText: string;
  snackbarTitle: string;
  snackbarMessage: string;
  snackbarActions: string;
  cancelBtn: string;
  confirmBtn: string;
  confirmBtnDanger: string;
};

export type ZenformedSettingsDrawerClassNames = {
  settingsOverlay: string;
  settingsDrawer: string;
  settingsHeader: string;
  settingsTitle: string;
  settingsClose: string;
  settingsTabs: string;
  settingsTab: string;
  settingsTabActive: string;
  settingsContent: string;
};

export type ZenformedSettingsDrawerSection = {
  id: string;
  label: string;
  requiresLicenseTier?: string;
};

export type ZenformedDashboardAppShellClassNames = {
  appLayout: string;
};

export type ZenformedDashboardSidebarRowClassNames = {
  dashboardWithSidebar: string;
  sidebarRail: string;
  mainColumn: string;
};

export type ZenformedAppIconNavMenuClassNames = {
  appIconNavWrap: string;
  appIconNavTrigger: string;
  appIconNavMenu: string;
  appIconNavMenuItem: string;
  appIconNavMenuItemActive: string;
  appIconNavMenuItemDisabled: string;
};

export type ZenformedAppIconNavMenuItem = {
  readonly id: string;
  readonly label: string;
  readonly active?: boolean;
  readonly disabled?: boolean;
  readonly onSelect: () => void;
};

export type ZenformedAppIconNavMenuProps = {
  readonly brandingClassNames: ZenformedSidebarBrandingClassNames;
  readonly menuClassNames: ZenformedAppIconNavMenuClassNames;
  readonly appName: string;
  readonly appIconSrc?: string | null;
  readonly appAltText?: string;
  readonly menuAriaLabel: string;
  readonly triggerAriaLabel: string;
  readonly items: readonly ZenformedAppIconNavMenuItem[];
};

export type ZenformedDashboardPageLoadingClassNames = {
  page: string;
  loading: string;
};
