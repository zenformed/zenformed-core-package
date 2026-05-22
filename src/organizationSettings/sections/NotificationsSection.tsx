'use client';

import { useState } from 'react';
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

export function NotificationsSection({ viewModel, labels, classNames }: Props) {
  const [marketingEmail, setMarketingEmail] = useState(
    viewModel.notifications.marketingEmailOptIn
  );
  const [smsOptIn, setSmsOptIn] = useState(viewModel.notifications.smsOptIn);

  return (
    <>
      <ZenformedSettingsGroup title={labels.emailPreferences} classNames={classNames}>
        <label className={classNames.checkboxRow}>
          <input
            type="checkbox"
            className={classNames.checkbox}
            checked={marketingEmail}
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
            onChange={(e) => setSmsOptIn(e.target.checked)}
          />
          <span>
            <span className={classNames.rowValue}>{labels.allowTextMessaging}</span>
            <p className={classNames.hint}>{labels.textMessagingHint}</p>
          </span>
        </label>
      </ZenformedSettingsGroup>
    </>
  );
}
