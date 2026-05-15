import type { ZenformedConfirmSnackbarClassNames } from './types';
import { ZENFORMED_CONFIRM_SNACKBAR_CSS_KEYS } from './cssModuleContract';
import { warnMissingDashboardShellCssKeys } from './warnMissingDashboardShellCssKeys';

export function pickConfirmSnackbarClassNames(
  styles: Record<string, string>
): ZenformedConfirmSnackbarClassNames {
  warnMissingDashboardShellCssKeys(
    'pickConfirmSnackbarClassNames',
    styles,
    ZENFORMED_CONFIRM_SNACKBAR_CSS_KEYS
  );
  const out = {} as ZenformedConfirmSnackbarClassNames;
  for (const key of ZENFORMED_CONFIRM_SNACKBAR_CSS_KEYS) {
    out[key] = styles[key] ?? '';
  }
  return out;
}
