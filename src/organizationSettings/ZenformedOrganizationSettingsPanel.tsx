'use client';

import { ZenformedSettingsAccordionSection } from './components/ZenformedSettingsAccordionSection';
import { DEFAULT_ORGANIZATION_SETTINGS_LABELS } from './defaultLabels';
import { mergeOrganizationSettingsViewModel } from './mergeViewModel';
import orgStyles from './organizationSettings.module.css';
import { pickOrganizationSettingsClassNames } from './pickOrganizationSettingsClassNames';
import { AccountSection } from './sections/AccountSection';
import { AppsBillingSection } from './sections/AppsBillingSection';
import { NotificationsSection } from './sections/NotificationsSection';
import { OrganizationSection } from './sections/OrganizationSection';
import type {
  OrganizationSettingsLabels,
  OrganizationSettingsShellContext,
  OrganizationSettingsViewModel,
} from './types';

const panelClassNames = pickOrganizationSettingsClassNames(orgStyles);

export type ZenformedOrganizationSettingsPanelProps = {
  readonly shellContext?: OrganizationSettingsShellContext | null;
  readonly viewModelOverrides?: Partial<OrganizationSettingsViewModel> | null;
  readonly labels?: Partial<OrganizationSettingsLabels>;
  readonly showMockNote?: boolean;
};

export function ZenformedOrganizationSettingsPanel({
  shellContext,
  viewModelOverrides,
  labels: labelOverrides,
  showMockNote = true,
}: ZenformedOrganizationSettingsPanelProps) {
  const labels = { ...DEFAULT_ORGANIZATION_SETTINGS_LABELS, ...labelOverrides };
  const viewModel = mergeOrganizationSettingsViewModel(shellContext, viewModelOverrides);

  return (
    <div className={panelClassNames.panel}>
      {showMockNote ? (
        <p className={panelClassNames.placeholderNote}>{labels.mockDataNote}</p>
      ) : null}
      <div className={panelClassNames.accordion}>
        <ZenformedSettingsAccordionSection
          title={labels.sectionOrganization}
          defaultOpen
          classNames={panelClassNames}
        >
          <OrganizationSection
            viewModel={viewModel}
            labels={labels}
            classNames={panelClassNames}
          />
        </ZenformedSettingsAccordionSection>

        <ZenformedSettingsAccordionSection
          title={labels.sectionAccount}
          defaultOpen
          classNames={panelClassNames}
        >
          <AccountSection viewModel={viewModel} labels={labels} classNames={panelClassNames} />
        </ZenformedSettingsAccordionSection>

        <ZenformedSettingsAccordionSection
          title={labels.sectionNotifications}
          defaultOpen
          classNames={panelClassNames}
        >
          <NotificationsSection
            viewModel={viewModel}
            labels={labels}
            classNames={panelClassNames}
          />
        </ZenformedSettingsAccordionSection>

        <ZenformedSettingsAccordionSection
          title={labels.sectionAppsBilling}
          defaultOpen
          classNames={panelClassNames}
        >
          <AppsBillingSection
            viewModel={viewModel}
            labels={labels}
            classNames={panelClassNames}
          />
        </ZenformedSettingsAccordionSection>
      </div>
    </div>
  );
}
