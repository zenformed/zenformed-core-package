import type { OrganizationSettingsClassNames } from './types';

type CssModule = Record<string, string>;

export function pickOrganizationSettingsClassNames(
  styles: CssModule
): OrganizationSettingsClassNames {
  const required: (keyof OrganizationSettingsClassNames)[] = [
    'panel',
    'accordion',
    'section',
    'sectionOpen',
    'sectionHeader',
    'sectionChevron',
    'sectionBody',
    'group',
    'groupOpen',
    'groupHeader',
    'groupChevron',
    'groupBody',
    'groupTitle',
    'row',
    'rowLabel',
    'rowValue',
    'field',
    'fieldLabel',
    'input',
    'select',
    'textarea',
    'hint',
    'actions',
    'btn',
    'btnPrimary',
    'btnGhost',
    'btnSmall',
    'badge',
    'badgeMuted',
    'badgeSuccess',
    'memberList',
    'memberRow',
    'memberRowMain',
    'memberRowControls',
    'memberDisplayName',
    'memberEmail',
    'memberRoleDescription',
    'memberRowActions',
    'memberName',
    'memberRoleSelect',
    'seatsSummary',
    'logoPreview',
    'logoInitial',
    'checkboxRow',
    'checkbox',
    'divider',
    'placeholderNote',
    'saveStatus',
    'saveStatusSuccess',
    'saveStatusError',
    'saveStatusMuted',
    'timezoneList',
    'timezoneOption',
    'industrySelect',
    'appBillingRow',
    'appBillingName',
    'appBillingPlan',
    'appBillingActiveCheck',
  ];

  const out: Record<string, string> = {};
  for (const key of required) {
    const value = styles[key];
    if (!value) {
      throw new Error(
        `organizationSettings CSS module missing required class "${key}"`
      );
    }
    out[key] = value;
  }
  out.inputNonEditable = styles.inputNonEditable ?? styles.input;
  return out as OrganizationSettingsClassNames;
}
