import type {
  ZenformedDashboardAppShellClassNames,
  ZenformedDashboardSidebarRowClassNames,
} from './types';
import {
  ZENFORMED_APP_SHELL_CSS_KEYS,
  ZENFORMED_SIDEBAR_ROW_CSS_KEYS,
} from './cssModuleContract';
import { warnMissingDashboardShellCssKeys } from './warnMissingDashboardShellCssKeys';

export function pickDashboardAppShellClassNames(
  styles: Record<string, string>
): ZenformedDashboardAppShellClassNames {
  warnMissingDashboardShellCssKeys(
    'pickDashboardAppShellClassNames',
    styles,
    ZENFORMED_APP_SHELL_CSS_KEYS
  );
  const out = {} as ZenformedDashboardAppShellClassNames;
  for (const key of ZENFORMED_APP_SHELL_CSS_KEYS) {
    out[key] = styles[key] ?? '';
  }
  return out;
}

export function pickDashboardSidebarRowClassNames(
  styles: Record<string, string>
): ZenformedDashboardSidebarRowClassNames {
  warnMissingDashboardShellCssKeys(
    'pickDashboardSidebarRowClassNames',
    styles,
    ZENFORMED_SIDEBAR_ROW_CSS_KEYS
  );
  const out = {} as ZenformedDashboardSidebarRowClassNames;
  for (const key of ZENFORMED_SIDEBAR_ROW_CSS_KEYS) {
    out[key] = styles[key] ?? '';
  }
  return out;
}

/**
 * Same keys as `pickDashboardAppShellClassNames` + `pickDashboardSidebarRowClassNames` but **one** dev warning (avoid duplicate console noise).
 */
export function pickDashboardLayoutClassNames(styles: Record<string, string>): ZenformedDashboardAppShellClassNames &
  ZenformedDashboardSidebarRowClassNames {
  warnMissingDashboardShellCssKeys(
    'pickDashboardLayoutClassNames',
    styles,
    [...ZENFORMED_APP_SHELL_CSS_KEYS, ...ZENFORMED_SIDEBAR_ROW_CSS_KEYS]
  );
  const app = {} as ZenformedDashboardAppShellClassNames;
  for (const key of ZENFORMED_APP_SHELL_CSS_KEYS) {
    app[key] = styles[key] ?? '';
  }
  const row = {} as ZenformedDashboardSidebarRowClassNames;
  for (const key of ZENFORMED_SIDEBAR_ROW_CSS_KEYS) {
    row[key] = styles[key] ?? '';
  }
  return { ...app, ...row };
}
