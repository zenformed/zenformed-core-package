import type { OrganizationSettingsDrawerClassNames } from './types';

type CssModule = Record<string, string>;

export function pickOrganizationSettingsDrawerClassNames(
  styles: CssModule
): OrganizationSettingsDrawerClassNames {
  const required: (keyof OrganizationSettingsDrawerClassNames)[] = [
    'settingsOverlay',
    'settingsDrawer',
    'settingsDrawerWide',
    'settingsHeader',
    'settingsTitle',
    'settingsClose',
    'settingsContent',
  ];

  const out: Record<string, string> = {};
  for (const key of required) {
    const value = styles[key];
    if (!value) {
      throw new Error(
        `dashboard CSS module missing organization settings drawer class "${key}"`
      );
    }
    out[key] = value;
  }
  return out as OrganizationSettingsDrawerClassNames;
}
