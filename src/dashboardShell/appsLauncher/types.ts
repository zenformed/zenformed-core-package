export type ZenformedAppStatus = 'live' | 'coming_soon';

export type ZenformedAppEntitlementBadges = {
  readonly planLabel: string;
  readonly planBadgeVariant: 'starter' | 'growth' | 'pro' | 'standard' | 'single' | 'default';
  readonly statusLabel: string;
  readonly statusBadgeVariant: 'trial' | 'active' | 'inactive';
};

export type ZenformedAppRegistryEntry = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** Bundled or absolute URL for launcher tile icon (overrides catalog when set). */
  readonly icon?: string;
  /** Explicit icon URL override (highest priority). */
  readonly iconSrc?: string;
  /** When set, opens via one-time launch handoff instead of a direct href. */
  readonly launchTarget?: string;
  readonly href?: string;
  readonly status: ZenformedAppStatus;
  /** Plan + status pills shown under the app name (dashboard My Apps). */
  readonly entitlementBadges?: ZenformedAppEntitlementBadges;
};

export type ZenformedAppsLauncherClassNames = {
  appsLauncherWrap: string;
  appsLauncherTrigger: string;
  appsLauncherIcon: string;
  appsPopover: string;
  /** Full-screen dim/blur behind the mobile apps modal. */
  appsMobileBackdrop: string;
  appsPopoverList: string;
  appsPopoverAppsPanel: string;
  appsPopoverSection: string;
  appsPopoverSectionTitle: string;
  appsTileGrid: string;
  appsTile: string;
  appsTileDisabled: string;
  appsTileIconWrap: string;
  appsTileIcon: string;
  appsTileIconFallback: string;
  appsTileName: string;
  appsTileMeta: string;
  appsPopoverRow: string;
  appsPopoverRowDisabled: string;
  appsPopoverRowCurrent: string;
  appsPopoverRowCheck: string;
  appsPopoverRowText: string;
  appsPopoverRowName: string;
  appsPopoverRowDescription: string;
  appsPopoverRowMeta: string;
  appsPopoverSidebarList: string;
  appCardGrid: string;
  appCard: string;
  appCardDisabled: string;
  appCardIcon: string;
  appCardIconFallback: string;
  appCardBody: string;
  appCardTitle: string;
  appCardBadges: string;
  appCardDescription: string;
  appComingSoon: string;
  appsLaunchError: string;
};

export type ZenformedAppsLauncherLabels = {
  triggerAriaLabel: string;
  popoverAriaLabel: string;
  /** Heading for the application tiles section. */
  appsSectionTitle: string;
  /** Heading for the account / platform home section (popover only). */
  accountSectionTitle?: string;
  /** @deprecated Use `appsSectionTitle`. */
  sectionTitle?: string;
  /** Label for the platform home tile (defaults to the account registry entry name). */
  accountHomeLabel?: string;
  /** @deprecated Coming soon is not shown in the launcher. */
  comingSoonLabel?: string;
};

export type ZenformedAppsLauncherLayoutOptions = {
  /** Registry id moved to the Account section (default `platform`). */
  readonly accountAppId?: string;
  /** When false, the Account section is hidden (e.g. on Zenformed Core). */
  readonly showAccountSection?: boolean;
  /** Overrides the account tile label (e.g. "Zenformed Home"). */
  readonly accountHomeLabel?: string;
  /**
   * Popover inner layout.
   * `sidebarList` = horizontal rows: icon + name / tier (collapsible sidebar).
   */
  readonly popoverLayout?: 'tiles' | 'sidebarList';
  /** Marks the current app row (checkmark / aria-current) in `sidebarList` layout. */
  readonly currentAppId?: string | null;
};
