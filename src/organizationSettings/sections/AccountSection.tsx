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
  const [email, setEmail] = useState(account.email);

  useEffect(() => {
    setFirstName(account.firstName);
    setLastName(account.lastName);
    setEmail(account.email);
  }, [account.firstName, account.lastName, account.email]);

  const canEditEmail = persistence?.permissions?.canEditAccountEmail ?? false;

  const profileDirty = useMemo(
    () =>
      firstName.trim() !== (account.firstName ?? '').trim() ||
      lastName.trim() !== (account.lastName ?? '').trim() ||
      (canEditEmail && email.trim() !== (account.email ?? '').trim()),
    [account.email, account.firstName, account.lastName, canEditEmail, email, firstName, lastName]
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
          value={email}
          placeholder="—"
          autoComplete="email"
          readOnly={!canEditEmail || savingAccount || persistence?.isLoading}
          nonEditable={!canEditEmail}
          onChange={canEditEmail ? setEmail : undefined}
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
              void persistence?.onSaveAccount?.({
                firstName,
                lastName,
                ...(canEditEmail ? { email } : {}),
              });
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
