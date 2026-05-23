'use client';

import { useEffect, useMemo, useState } from 'react';
import { AccountPasswordGroup } from '../components/AccountPasswordGroup';
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
  readonly passwordFormKey?: string;
};

export function AccountSection({
  viewModel,
  labels,
  classNames,
  persistence,
  passwordFormKey,
}: Props) {
  const { account } = viewModel;
  const [firstName, setFirstName] = useState(account.firstName);
  const [lastName, setLastName] = useState(account.lastName);

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
  const canEditEmail = persistence?.permissions?.canEditAccountEmail ?? false;

  return (
    <>
      <ZenformedSettingsGroup title={labels.profile} classNames={classNames}>
        <ZenformedSettingsField
          label={labels.firstName}
          classNames={classNames}
          value={firstName}
          placeholder="—"
          autoComplete="given-name"
          onChange={setFirstName}
          readOnly={savingAccount || persistence?.isLoading}
        />
        <ZenformedSettingsField
          label={labels.lastName}
          classNames={classNames}
          value={lastName}
          placeholder="—"
          autoComplete="family-name"
          onChange={setLastName}
          readOnly={savingAccount || persistence?.isLoading}
        />
        <ZenformedSettingsField
          label={labels.email}
          classNames={classNames}
          value={account.email}
          placeholder="—"
          autoComplete="email"
          readOnly
          nonEditable={!canEditEmail}
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

      <AccountPasswordGroup
        labels={labels}
        classNames={classNames}
        formKey={passwordFormKey}
      />
    </>
  );
}
