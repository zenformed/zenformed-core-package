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
};
