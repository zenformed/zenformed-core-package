'use client';

import type { OrganizationSettingsClassNames, OrganizationSettingsLabels, SettingsSaveStatus } from '../types';

type Props = {
  readonly status: SettingsSaveStatus;
  readonly errorMessage?: string | null;
  readonly labels: OrganizationSettingsLabels;
  readonly classNames: OrganizationSettingsClassNames;
  readonly dirty?: boolean;
};

export function SettingsSaveStatusLine({
  status,
  errorMessage,
  labels,
  classNames,
  dirty = false,
}: Props) {
  if (status === 'saving') {
    return <p className={classNames.saveStatus}>{labels.saving}</p>;
  }
  if (status === 'saved') {
    return (
      <p className={`${classNames.saveStatus} ${classNames.saveStatusSuccess}`}>{labels.saved}</p>
    );
  }
  if (status === 'error') {
    return (
      <p className={`${classNames.saveStatus} ${classNames.saveStatusError}`}>
        {errorMessage?.trim() || labels.saveFailed}
      </p>
    );
  }
  if (dirty) {
    return (
      <p className={`${classNames.saveStatus} ${classNames.saveStatusMuted}`}>
        {labels.unsavedChanges}
      </p>
    );
  }
  return null;
}
