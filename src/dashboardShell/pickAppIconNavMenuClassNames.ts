import type { ZenformedAppIconNavMenuClassNames } from './types';
import { ZENFORMED_APP_ICON_NAV_MENU_CSS_KEYS } from './cssModuleContract';
import { warnMissingDashboardShellCssKeys } from './warnMissingDashboardShellCssKeys';

export function pickAppIconNavMenuClassNames(
  styles: Record<string, string>
): ZenformedAppIconNavMenuClassNames {
  warnMissingDashboardShellCssKeys(
    'pickAppIconNavMenuClassNames',
    styles,
    ZENFORMED_APP_ICON_NAV_MENU_CSS_KEYS
  );
  const out = {} as ZenformedAppIconNavMenuClassNames;
  for (const key of ZENFORMED_APP_ICON_NAV_MENU_CSS_KEYS) {
    out[key] = styles[key] ?? '';
  }
  return out;
}
