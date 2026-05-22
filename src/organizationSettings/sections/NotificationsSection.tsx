'use client';

import { useEffect, useMemo, useState } from 'react';
import { SettingsSaveStatusLine } from '../components/SettingsSaveStatusLine';
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

export function NotificationsSection({
  viewModel,
  labels,
  classNames,
  persistence,
}: Props) {
  const [marketingEmail, setMarketingEmail] = useState(
    viewModel.notifications.marketingEmailOptIn
  );
  const [smsOptIn, setSmsOptIn] = useState(viewModel.notifications.smsOptIn);

  useEffect(() => {
    setMarketingEmail(viewModel.notifications.marketingEmailOptIn);
    setSmsOptIn(viewModel.notifications.smsOptIn);
  }, [viewModel.notifications.marketingEmailOptIn, viewModel.notifications.smsOptIn]);

  const prefsDirty = useMemo(
    () =>
      marketingEmail !== viewModel.notifications.marketingEmailOptIn ||
      smsOptIn !== viewModel.notifications.smsOptIn,
    [
      marketingEmail,
      smsOptIn,
      viewModel.notifications.marketingEmailOptIn,
      viewModel.notifications.smsOptIn,
    ]
  );

  const notificationsSaveStatus = persistence?.notificationsSaveStatus ?? 'idle';
  const savingNotifications = notificationsSaveStatus === 'saving';
  const canSaveNotifications = Boolean(persistence?.onSaveNotifications) && prefsDirty;

  return (
    <>
      <ZenformedSettingsGroup title={labels.emailPreferences} classNames={classNames}>
        <label className={classNames.checkboxRow}>
          <input
            type="checkbox"
            className={classNames.checkbox}
            checked={marketingEmail}
            disabled={savingNotifications || persistence?.isLoading}
            onChange={(e) => setMarketingEmail(e.target.checked)}
          />
          <span>
            <span className={classNames.rowValue}>{labels.promotionalEmails}</span>
            <p className={classNames.hint}>{labels.promotionalEmailsHint}</p>
          </span>
        </label>
      </ZenformedSettingsGroup>

      <ZenformedSettingsGroup title={labels.textMessaging} classNames={classNames}>
        <label className={classNames.checkboxRow}>
          <input
            type="checkbox"
            className={classNames.checkbox}
            checked={smsOptIn}
            disabled={savingNotifications || persistence?.isLoading}
            onChange={(e) => setSmsOptIn(e.target.checked)}
          />
          <span>
            <span className={classNames.rowValue}>{labels.allowTextMessaging}</span>
            <p className={classNames.hint}>{labels.textMessagingHint}</p>
          </span>
        </label>
      </ZenformedSettingsGroup>

      <SettingsSaveStatusLine
        status={notificationsSaveStatus}
        errorMessage={persistence?.saveErrorMessage}
        labels={labels}
        classNames={classNames}
        dirty={prefsDirty && notificationsSaveStatus === 'idle'}
      />
      <div className={classNames.actions}>
        <button
          type="button"
          className={`${classNames.btn} ${classNames.btnPrimary}`}
          disabled={!canSaveNotifications || savingNotifications || persistence?.isLoading}
          onClick={() => {
            void persistence?.onSaveNotifications?.({
              marketingEmailOptIn: marketingEmail,
              smsOptIn,
            });
          }}
        >
          {savingNotifications ? labels.saving : labels.save}
        </button>
      </div>
    </>
  );
}
