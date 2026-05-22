'use client';

import { useEffect, useMemo, useState } from 'react';
import { SettingsSaveStatusLine } from '../components/SettingsSaveStatusLine';
import { ZenformedSettingsField } from '../components/ZenformedSettingsField';
import { ZenformedSettingsGroup } from '../components/ZenformedSettingsGroup';
import type {
  OrganizationSettingsClassNames,
  OrganizationSettingsLabels,
  OrganizationSettingsPersistence,
  OrganizationSettingsViewModel,
} from '../types';

type Props = {
  readonly viewModel: OrganizationSettingsViewModel;
  readonly labels: OrganizationSettingsLabels;
  readonly classNames: OrganizationSettingsClassNames;
  readonly persistence?: OrganizationSettingsPersistence | null;
};

export function AccountSection({ viewModel, labels, classNames, persistence }: Props) {
  const { account } = viewModel;
  const [firstName, setFirstName] = useState(account.firstName);
  const [lastName, setLastName] = useState(account.lastName);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    setFirstName(account.firstName);
    setLastName(account.lastName);
  }, [account.firstName, account.lastName]);

  const profileDirty = useMemo(
    () =>
      firstName.trim() !== (account.firstName ?? '').trim() ||
      lastName.trim() !== (account.lastName ?? '').trim(),
    [account.firstName, account.lastName, firstName, lastName]
  );

  const accountSaveStatus = persistence?.accountSaveStatus ?? 'idle';
  const canSaveAccount = Boolean(persistence?.onSaveAccount) && profileDirty;
  const savingAccount = accountSaveStatus === 'saving';

  return (
    <>
      <ZenformedSettingsGroup title={labels.profile} classNames={classNames}>
        <ZenformedSettingsField
          label={labels.firstName}
          classNames={classNames}
          value={firstName}
          placeholder="—"
          onChange={setFirstName}
          readOnly={savingAccount || persistence?.isLoading}
        />
        <ZenformedSettingsField
          label={labels.lastName}
          classNames={classNames}
          value={lastName}
          placeholder="—"
          onChange={setLastName}
          readOnly={savingAccount || persistence?.isLoading}
        />
        <ZenformedSettingsField
          label={labels.email}
          classNames={classNames}
          value={account.email}
          placeholder="—"
          readOnly
        />
        <SettingsSaveStatusLine
          status={accountSaveStatus}
          errorMessage={persistence?.saveErrorMessage}
          labels={labels}
          classNames={classNames}
          dirty={profileDirty && accountSaveStatus === 'idle'}
        />
        <div className={classNames.actions}>
          <button
            type="button"
            className={`${classNames.btn} ${classNames.btnPrimary}`}
            disabled={!canSaveAccount || savingAccount || persistence?.isLoading}
            onClick={() => {
              void persistence?.onSaveAccount?.({ firstName, lastName });
            }}
          >
            {savingAccount ? labels.saving : labels.save}
          </button>
        </div>
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
