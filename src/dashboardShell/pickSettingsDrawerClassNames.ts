import type { ZenformedSettingsDrawerClassNames } from './types';
import { ZENFORMED_SETTINGS_DRAWER_CSS_KEYS } from './cssModuleContract';
import { warnMissingDashboardShellCssKeys } from './warnMissingDashboardShellCssKeys';

export function pickSettingsDrawerClassNames(
  styles: Record<string, string>
): ZenformedSettingsDrawerClassNames {
  warnMissingDashboardShellCssKeys(
    'pickSettingsDrawerClassNames',
    styles,
    ZENFORMED_SETTINGS_DRAWER_CSS_KEYS
  );
  const out = {} as ZenformedSettingsDrawerClassNames;
  for (const key of ZENFORMED_SETTINGS_DRAWER_CSS_KEYS) {
    out[key] = styles[key] ?? '';
  }
  return out;
}
