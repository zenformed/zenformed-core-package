'use client';

import { useState } from 'react';
import { ZenformedSettingsField } from '../components/ZenformedSettingsField';
import { ZenformedSettingsGroup } from '../components/ZenformedSettingsGroup';
import type {
  OrganizationSettingsClassNames,
  OrganizationSettingsLabels,
  OrganizationSettingsViewModel,
} from '../types';

type Props = {
  readonly viewModel: OrganizationSettingsViewModel;
  readonly labels: OrganizationSettingsLabels;
  readonly classNames: OrganizationSettingsClassNames;
};

export function AccountSection({ viewModel, labels, classNames }: Props) {
  const { account } = viewModel;
  const [firstName, setFirstName] = useState(account.firstName);
  const [lastName, setLastName] = useState(account.lastName);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <>
      <ZenformedSettingsGroup title={labels.profile} classNames={classNames}>
        <ZenformedSettingsField
          label={labels.firstName}
          classNames={classNames}
          value={firstName}
          placeholder="—"
          onChange={setFirstName}
        />
        <ZenformedSettingsField
          label={labels.lastName}
          classNames={classNames}
          value={lastName}
          placeholder="—"
          onChange={setLastName}
        />
        <ZenformedSettingsField
          label={labels.email}
          classNames={classNames}
          value={account.email}
          placeholder="—"
          readOnly={Boolean(account.email)}
        />
      </ZenformedSettingsGroup>

      <ZenformedSettingsGroup title={labels.password} classNames={classNames}>
        <ZenformedSettingsField
          label={labels.oldPassword}
          classNames={classNames}
          type="password"
          value={oldPassword}
          onChange={setOldPassword}
        />
        <ZenformedSettingsField
          label={labels.newPassword}
          classNames={classNames}
          type="password"
          value={newPassword}
          onChange={setNewPassword}
        />
        <ZenformedSettingsField
          label={labels.confirmPassword}
          classNames={classNames}
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
        <div className={classNames.actions}>
          <button type="button" className={`${classNames.btn} ${classNames.btnPrimary}`} disabled>
            {labels.savePassword}
          </button>
        </div>
      </ZenformedSettingsGroup>
    </>
  );
}
