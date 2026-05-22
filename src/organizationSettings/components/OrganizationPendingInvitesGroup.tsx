'use client';

import { ZenformedSettingsGroup } from './ZenformedSettingsGroup';
import type {
  OrganizationSettingsClassNames,
  OrganizationSettingsLabels,
  OrganizationSettingsPendingInvite,
} from '../types';

type Props = {
  readonly invites: readonly OrganizationSettingsPendingInvite[];
  readonly labels: OrganizationSettingsLabels;
  readonly classNames: OrganizationSettingsClassNames;
  readonly actionsDisabled?: boolean;
};

export function OrganizationPendingInvitesGroup({
  invites,
  labels,
  classNames,
  actionsDisabled = true,
}: Props) {
  return (
    <ZenformedSettingsGroup title={labels.pendingInvites} classNames={classNames}>
      {invites.length === 0 ? (
        <p className={classNames.hint}>{labels.noPendingInvitesYet}</p>
      ) : (
        invites.map((invite) => (
          <div key={invite.id} className={classNames.row}>
            <div>
              <div className={classNames.rowValue}>{invite.email}</div>
              <div className={classNames.hint}>{invite.sentLabel}</div>
            </div>
            <div className={classNames.actions}>
              <button
                type="button"
                className={`${classNames.btn} ${classNames.btnSmall}`}
                disabled={actionsDisabled}
              >
                {labels.resend}
              </button>
              <button
                type="button"
                className={`${classNames.btn} ${classNames.btnSmall} ${classNames.btnGhost}`}
                disabled={actionsDisabled}
              >
                {labels.cancel}
              </button>
            </div>
          </div>
        ))
      )}
    </ZenformedSettingsGroup>
  );
}
