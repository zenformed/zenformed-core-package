import type { ZenformedAppRegistryEntry } from './types';

export const DEFAULT_ACCOUNT_APP_ID = 'platform';

export function partitionLauncherApps(
  apps: readonly ZenformedAppRegistryEntry[],
  accountAppId: string = DEFAULT_ACCOUNT_APP_ID
): {
  readonly launcherApps: readonly ZenformedAppRegistryEntry[];
  readonly accountApp: ZenformedAppRegistryEntry | null;
} {
  const accountApp = apps.find((app) => app.id === accountAppId) ?? null;
  const launcherApps = apps.filter((app) => app.id !== accountAppId);
  return { launcherApps, accountApp };
}
