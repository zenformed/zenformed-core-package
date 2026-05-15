import type { ZenformedDashboardPageLoadingClassNames } from './types';
import { ZENFORMED_PAGE_LOADING_CSS_KEYS } from './cssModuleContract';
import { warnMissingDashboardShellCssKeys } from './warnMissingDashboardShellCssKeys';

export function pickDashboardPageLoadingClassNames(
  styles: Record<string, string>
): ZenformedDashboardPageLoadingClassNames {
  warnMissingDashboardShellCssKeys(
    'pickDashboardPageLoadingClassNames',
    styles,
    ZENFORMED_PAGE_LOADING_CSS_KEYS
  );
  const out = {} as ZenformedDashboardPageLoadingClassNames;
  for (const key of ZENFORMED_PAGE_LOADING_CSS_KEYS) {
    out[key] = styles[key] ?? '';
  }
  return out;
}
