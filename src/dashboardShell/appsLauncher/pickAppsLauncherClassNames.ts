import type { ZenformedAppsLauncherClassNames } from './types';
import { ZENFORMED_APPS_LAUNCHER_CSS_KEYS } from '../cssModuleContract';
import { warnMissingDashboardShellCssKeys } from '../warnMissingDashboardShellCssKeys';

export function pickAppsLauncherClassNames(
  styles: Record<string, string>
): ZenformedAppsLauncherClassNames {
  warnMissingDashboardShellCssKeys('pickAppsLauncherClassNames', styles, ZENFORMED_APPS_LAUNCHER_CSS_KEYS);
  const out = {} as ZenformedAppsLauncherClassNames;
  for (const key of ZENFORMED_APPS_LAUNCHER_CSS_KEYS) {
    out[key] = styles[key] ?? '';
  }
  return out;
}
