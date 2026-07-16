import type { ReactNode } from 'react';
import type { ZenformedDashboardNotificationsConfig } from '../notifications/types';
import type {
  ZenformedAccountMenuLabels,
  ZenformedDashboardHeaderClassNames,
  ZenformedDashboardHeaderUser,
} from '../types';

/** Shared layout tokens for the collapsible sidebar rail. */
export const ZENFORMED_SIDEBAR_COLLAPSED_WIDTH_REM = 3.75;
export const ZENFORMED_SIDEBAR_EXPANDED_WIDTH_REM = 17.5;
export const ZENFORMED_SIDEBAR_ICON_COLUMN_REM = 2.5;
export const ZENFORMED_SIDEBAR_ROW_HEIGHT_REM = 2.5;
export const ZENFORMED_SIDEBAR_SECTION_LABEL_HEIGHT_REM = 1;
/** Collapsed labels longer than this are hidden when `collapsedLabel` is omitted. */
export const ZENFORMED_SIDEBAR_COLLAPSED_LABEL_SAFE_MAX_CHARS = 5;
export const ZENFORMED_SIDEBAR_HOVER_OPEN_DELAY_MS = 120;
export const ZENFORMED_SIDEBAR_HOVER_CLOSE_DELAY_MS = 220;

export type ZenformedSidebarNavItem = {
  readonly id: string;
  readonly label: string;
  /** Tooltip / title when collapsed. Defaults to label. */
  readonly title?: string;
  readonly icon: ReactNode;
  readonly active?: boolean;
  readonly disabled?: boolean;
  readonly onSelect: () => void;
};

type ZenformedSidebarSectionLabelFields = {
  readonly label?: string;
  /**
   * Compact label for the collapsed rail (e.g. `"ORG"`).
   * Not auto-derived by slicing — hosts should supply intentional short forms.
   */
  readonly collapsedLabel?: string;
};

export type ZenformedSidebarNavSection = ZenformedSidebarSectionLabelFields & {
  readonly kind: 'nav';
  readonly id: string;
  readonly items: readonly ZenformedSidebarNavItem[];
};

export type ZenformedSidebarCustomSection = ZenformedSidebarSectionLabelFields & {
  readonly kind: 'custom';
  readonly id: string;
  readonly collapsible?: boolean;
  readonly defaultOpen?: boolean;
  readonly content: ReactNode;
};

export type ZenformedSidebarSection = ZenformedSidebarNavSection | ZenformedSidebarCustomSection;

export type ZenformedSidebarSettingsConfig = {
  readonly label: string;
  readonly icon: ReactNode;
  readonly onSelect: () => void;
  readonly title?: string;
};

export type ZenformedSidebarAccountConfig = {
  readonly user: ZenformedDashboardHeaderUser;
  readonly userDisplayName: string;
  /** Secondary line under the display name when the rail is expanded (typically email). */
  readonly userEmail?: string | null;
  readonly avatarUrl?: string | null;
  readonly avatarLoading?: boolean;
  readonly organizationRoleLabel?: string | null;
  readonly labels: ZenformedAccountMenuLabels;
  readonly classNames: ZenformedDashboardHeaderClassNames;
  readonly onOpenSettings: () => void;
  readonly onRequestSignOutConfirm: () => void;
  readonly onRequestProfilePhotoModal: () => void;
  readonly profilePhotoChangeEnabled?: boolean;
  /** Sidebar default: false (Settings is a separate OTHER row). */
  readonly showSettingsButton?: boolean;
  readonly settingsIcon?: ReactNode;
  readonly signOutIcon?: ReactNode;
  readonly profilePhotoCameraIcon?: ReactNode;
};

export type ZenformedCollapsibleSidebarShellProps = {
  /** Current app icon image URL (preferred). */
  readonly appIconSrc?: string | null;
  /** Host-resolved app display name (from app registry). Never hardcoded in the package. */
  readonly appName: string;
  /**
   * Host-composed apps launcher (reuse `ZenformedAppsLauncher`).
   * Prefer `ZenformedSidebarAppsTriggerChrome` inside `renderTrigger` for icon + name + chevrons.
   */
  readonly appsSwitcher: ReactNode;
  readonly organizationName?: string | null;
  readonly sections?: readonly ZenformedSidebarSection[];
  readonly notifications?: ZenformedDashboardNotificationsConfig | null;
  /** Host theme control (reuse existing ThemeToggle). */
  readonly themeControl: ReactNode;
  readonly themeLabel?: string;
  readonly settings?: ZenformedSidebarSettingsConfig | null;
  readonly account?: ZenformedSidebarAccountConfig | null;
  /** Main document (pages). Must not remount when the rail expands. */
  readonly children: ReactNode;
  readonly notificationsLabel?: string;
  readonly otherSectionLabel?: string;
  /** Compact OTHER label for the collapsed rail (e.g. `"OTHER"`). */
  readonly otherSectionCollapsedLabel?: string;
  readonly mobileMenuAriaLabel?: string;
  readonly sidebarAriaLabel?: string;
  /**
   * Host can hold the rail expanded (e.g. while the apps launcher dropdown is open).
   * Pass `ZenformedAppsLauncher` `onOpenChange` into local state and set this.
   */
  readonly holdExpanded?: boolean;
};

/**
 * Pure layout rule: collapsed gutter stays reserved; expanded rail overlays.
 */
export function shouldReserveCollapsedSidebarWidth(): boolean {
  return true;
}

/**
 * Pure layout rule: hover expand must not resize the main content column.
 */
export function shouldOverlayExpandedSidebar(): boolean {
  return true;
}

/**
 * Resolves which section label text to show.
 * Expanded / mobile drawer → full `label`.
 * Collapsed → `collapsedLabel`, else full label only if short enough, else null (hide).
 */
export function resolveSidebarSectionLabelText(input: {
  readonly label?: string | null;
  readonly collapsedLabel?: string | null;
  readonly expanded: boolean;
}): string | null {
  const full = input.label?.trim() || null;
  if (!full) return null;
  if (input.expanded) return full;
  const compact = input.collapsedLabel?.trim() || null;
  if (compact) return compact;
  if (full.length <= ZENFORMED_SIDEBAR_COLLAPSED_LABEL_SAFE_MAX_CHARS) return full;
  return null;
}

/**
 * App name is only painted in the expanded (or mobile-open) rail.
 */
export function shouldShowSidebarAppName(expanded: boolean): boolean {
  return expanded;
}

/** Mobile drawer width contract: ~90vw with a sensible max. */
export const ZENFORMED_MOBILE_DRAWER_WIDTH_CSS = 'min(90vw, 24rem)';

export function resolveMobileDrawerWidthCss(): string {
  return ZENFORMED_MOBILE_DRAWER_WIDTH_CSS;
}

/** Mobile uses the Facebook-style drawer; desktop keeps the hover rail. */
export function shouldUseMobileDrawerPresentation(isMobile: boolean): boolean {
  return isMobile;
}

/** On mobile, notifications navigate to the page instead of a dropdown. */
export function shouldOpenNotificationsAsPage(isMobile: boolean): boolean {
  return isMobile;
}

/** On mobile, the apps switcher expands inline inside the drawer. */
export function shouldUseInlineAppsSwitcher(isMobile: boolean): boolean {
  return isMobile;
}

/** Mobile user bar must not open the desktop account popover. */
export function shouldOpenAccountPopoverOnUserBar(isMobile: boolean): boolean {
  return !isMobile;
}
