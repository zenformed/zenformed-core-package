'use client';

import { DEFAULT_ORGANIZATION_SETTINGS_LABELS } from './defaultLabels';
import { mergeOrganizationSettingsViewModel } from './mergeViewModel';
import orgStyles from './organizationSettings.module.css';
import { pickOrganizationSettingsClassNames } from './pickOrganizationSettingsClassNames';
import { AccountSection } from './sections/AccountSection';
import { AppsBillingSection } from './sections/AppsBillingSection';
import { NotificationsSection } from './sections/NotificationsSection';
import { OrganizationSection } from './sections/OrganizationSection';
import { TeamMembersSection } from './sections/TeamMembersSection';
import type { SettingsCategoryId } from './settingsCategories';
import type {
  OrganizationSettingsLabels,
  OrganizationSettingsPersistence,
  OrganizationSettingsShellContext,
  OrganizationSettingsViewModel,
} from './types';

const panelClassNames = pickOrganizationSettingsClassNames(orgStyles);

export type ZenformedOrganizationSettingsPanelProps = {
  readonly shellContext?: OrganizationSettingsShellContext | null;
  readonly viewModelOverrides?: Partial<OrganizationSettingsViewModel> | null;
  readonly persistence?: OrganizationSettingsPersistence | null;
  readonly labels?: Partial<OrganizationSettingsLabels>;
  readonly showMockNote?: boolean;
  readonly activeCategory: SettingsCategoryId;
  /** Remount password fields when settings opens (pass `open` from overlay). */
  readonly passwordFormKey?: string;
};

export function ZenformedOrganizationSettingsPanel({
  shellContext,
  viewModelOverrides,
  persistence,
  labels: labelOverrides,
  showMockNote = true,
  activeCategory,
  passwordFormKey,
}: ZenformedOrganizationSettingsPanelProps) {
  const labels = { ...DEFAULT_ORGANIZATION_SETTINGS_LABELS, ...labelOverrides };
  const viewModel = mergeOrganizationSettingsViewModel(shellContext, viewModelOverrides);
  const showTopNote = showMockNote && activeCategory === 'organization';

  return (
    <div className={panelClassNames.panel}>
      {persistence?.isLoading ? (
        <p className={panelClassNames.saveStatus}>{labels.loadingSettings}</p>
      ) : null}
      {persistence?.loadError ? (
        <p className={`${panelClassNames.saveStatus} ${panelClassNames.saveStatusError}`}>
          {persistence.loadError}
        </p>
      ) : null}
      {showTopNote ? (
        <p className={panelClassNames.placeholderNote}>{labels.mockDataNote}</p>
      ) : null}

      {activeCategory === 'account' ? (
        <AccountSection
          viewModel={viewModel}
          labels={labels}
          classNames={panelClassNames}
          persistence={persistence}
          passwordFormKey={passwordFormKey}
        />
      ) : null}

      {activeCategory === 'organization' ? (
        <OrganizationSection
          viewModel={viewModel}
          labels={labels}
          classNames={panelClassNames}
          branding={persistence?.branding}
        />
      ) : null}

      {activeCategory === 'teamMembers' ? (
        <TeamMembersSection
          viewModel={viewModel}
          labels={labels}
          classNames={panelClassNames}
          workspace={persistence?.workspace}
        />
      ) : null}

      {activeCategory === 'notifications' ? (
        <NotificationsSection
          viewModel={viewModel}
          labels={labels}
          classNames={panelClassNames}
          persistence={persistence}
        />
      ) : null}

      {activeCategory === 'appsBilling' ? (
        <AppsBillingSection
          viewModel={viewModel}
          labels={labels}
          classNames={panelClassNames}
          workspace={persistence?.workspace}
        />
      ) : null}
    </div>
  );
}
