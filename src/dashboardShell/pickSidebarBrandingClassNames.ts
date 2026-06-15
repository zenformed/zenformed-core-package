import type { ZenformedSidebarBrandingClassNames } from './types';
import { ZENFORMED_SIDEBAR_BRANDING_CSS_KEYS } from './cssModuleContract';
import { warnMissingDashboardShellCssKeys } from './warnMissingDashboardShellCssKeys';

/**
 * Map app `dashboard.module.css` module exports to shared sidebar branding class names.
 */
export function pickSidebarBrandingClassNames(
  styles: Record<string, string>
): ZenformedSidebarBrandingClassNames {
  warnMissingDashboardShellCssKeys(
    'pickSidebarBrandingClassNames',
    styles,
    ZENFORMED_SIDEBAR_BRANDING_CSS_KEYS
  );
  const out = {} as ZenformedSidebarBrandingClassNames;
  for (const key of ZENFORMED_SIDEBAR_BRANDING_CSS_KEYS) {
    out[key] = styles[key] ?? '';
  }
  // Older app CSS modules omit `sidebarAppBranding`; wrapper is optional in the component.
  if (!out.sidebarAppBranding && out.sidebarLogoCircleWrap) {
    out.sidebarAppBranding = out.sidebarLogoCircleWrap;
  }
  return out;
}
