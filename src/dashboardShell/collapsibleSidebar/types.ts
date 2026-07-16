import type { ReactNode } from 'react';
import type { ZenformedDashboardNotificationsConfig } from '../notifications/types';
import type {
  ZenformedAccountMenuLabels,
  ZenformedDashboardHeaderClassNames,
  ZenformedDashboardHeaderUser,
} from '../types';

export const ZENFORMED_SIDEBAR_COLLAPSED_WIDTH_REM = 3.75;
export const ZENFORMED_SIDEBAR_EXPANDED_WIDTH_REM = 15;
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

export type ZenformedSidebarNavSection = {
  readonly kind: 'nav';
  readonly id: string;
  readonly label?: string;
  readonly items: readonly ZenformedSidebarNavItem[];
};

export type ZenformedSidebarCustomSection = {
  readonly kind: 'custom';
  readonly id: string;
  readonly label?: string;
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
  readonly avatarUrl?: string | null;
  readonly avatarLoading?: boolean;
  readonly organizationRoleLabel?: string | null;
  readonly labels: ZenformedAccountMenuLabels;
  readonly classNames: ZenformedDashboardHeaderClassNames;
  readonly onOpenSettings: () => void;
  readonly onRequestSignOutConfirm: () => void;
  readonly onRequestProfilePhotoModal: () => void;
  readonly profilePhotoChangeEnabled?: boolean;
  readonly settingsIcon?: ReactNode;
  readonly signOutIcon?: ReactNode;
  readonly profilePhotoCameraIcon?: ReactNode;
};

export type ZenformedCollapsibleSidebarShellProps = {
  /** Current app icon image URL (preferred). */
  readonly appIconSrc?: string | null;
  readonly appName: string;
  /**
   * Host-composed apps launcher (reuse `ZenformedAppsLauncher`).
   * Prefer passing a launcher whose trigger uses `renderTrigger` for the sidebar chrome.
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
