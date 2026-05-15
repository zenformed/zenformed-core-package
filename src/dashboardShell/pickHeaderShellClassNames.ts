import type { ZenformedDashboardHeaderClassNames } from './types';
import { ZENFORMED_HEADER_SHELL_CSS_KEYS } from './cssModuleContract';
import { warnMissingDashboardShellCssKeys } from './warnMissingDashboardShellCssKeys';

/**
 * Map app `dashboard.module.css` module exports to shared header shell class names.
 */
export function pickHeaderShellClassNames(
  styles: Record<string, string>
): ZenformedDashboardHeaderClassNames {
  warnMissingDashboardShellCssKeys('pickHeaderShellClassNames', styles, ZENFORMED_HEADER_SHELL_CSS_KEYS);
  const out = {} as ZenformedDashboardHeaderClassNames;
  for (const key of ZENFORMED_HEADER_SHELL_CSS_KEYS) {
    out[key] = styles[key] ?? '';
  }
  return out;
}
