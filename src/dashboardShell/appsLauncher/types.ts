export type ZenformedAppStatus = 'live' | 'coming_soon';

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
};

export type ZenformedAppsLauncherClassNames = {
  appsLauncherWrap: string;
  appsLauncherTrigger: string;
  appsLauncherIcon: string;
  appsPopover: string;
  appsPopoverList: string;
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
  appsPopoverRowName: string;
  appsPopoverRowDescription: string;
  appsPopoverRowMeta: string;
  appCardGrid: string;
  appCard: string;
  appCardDisabled: string;
  appCardIcon: string;
  appCardIconFallback: string;
  appCardTitle: string;
  appCardDescription: string;
  appComingSoon: string;
  appsLaunchError: string;
};

export type ZenformedAppsLauncherLabels = {
  triggerAriaLabel: string;
  popoverAriaLabel: string;
  /** Section heading above the app grid in the launcher popover (e.g. "Apps"). */
  sectionTitle: string;
  comingSoonLabel: string;
};
