import type { ChangeEvent, ReactNode, RefObject } from 'react';

/** Optional CSS module class map override for shared shell components. */
export type CSSModuleClasses = Record<string, string>;

/** Class names from the app `dashboard.module.css` sidebar branding block. */
export type ZenformedSidebarBrandingClassNames = {
  accountMenuLogoFileInput: string;
  sidebarLogoCircleWrap: string;
  sidebarLogoCircle: string;
  sidebarLogoImg: string;
  sidebarLogoInitial: string;
  sidebarLogoCameraBtn: string;
};

export type ZenformedSidebarBrandingProps = {
  classNames: ZenformedSidebarBrandingClassNames;
  shopName: string;
  defaultShopNameFallback: string;
  logoUrl: string | null;
  brandingLoading: boolean;
  logoUploading: boolean;
  showCameraButton: boolean;
  fileInputRef: RefObject<HTMLInputElement>;
  onLogoFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  companyLogoChangeTitle: string;
  companyLogoChangeAriaLabel: string;
  /** Optional camera icon; defaults to built-in SVG when omitted. */
  cameraIcon?: ReactNode;
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
  user: { email: string };
  avatarUrl: string | null | undefined;
  avatarLoading: boolean;
  shopName: string | null | undefined;
  defaultShopNameFallback: string;
  isAdmin: boolean;
  labels: ZenformedAccountMenuLabels;
  onOpenSettings: () => void;
  onRequestSignOutConfirm: () => void;
  onRequestProfilePhotoModal: () => void;
  settingsIcon?: ReactNode;
  signOutIcon?: ReactNode;
  profilePhotoCameraIcon?: ReactNode;
  accountMenuOpen: boolean;
  setAccountMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  accountMenuRef: RefObject<HTMLDivElement>;
  closeAccountMenu: () => void;
};

export type ZenformedDashboardHeaderProps = {
  classNames: ZenformedDashboardHeaderClassNames;
  user: { email: string } | null;
  avatarUrl: string | null | undefined;
  avatarLoading: boolean;
  shopName: string | null | undefined;
  defaultShopNameFallback: string;
  effectiveLicenseTier: string | null | undefined;
  /** Organization role badge (Owner, Admin, Coordinator, Member). */
  organizationRoleLabel?: string | null;
  isAdmin: boolean;
  labels: ZenformedAccountMenuLabels;
  themeToggle: ReactNode;
  onOpenSettings: () => void;
  onRequestSignOutConfirm: () => void;
  onRequestProfilePhotoModal: () => void;
  /** App-specific toolbar (e.g. ForgeCore search + new work order). */
  centerSlot?: ReactNode;
  /** Override default empty `headerLeft` (ForgeCore uses aria-hidden placeholder). */
  leftSlot?: ReactNode;
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
  mainColumn: string;
};

export type ZenformedDashboardPageLoadingClassNames = {
  page: string;
  loading: string;
};
