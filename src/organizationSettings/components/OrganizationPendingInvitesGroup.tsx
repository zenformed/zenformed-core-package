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
  readonly cancelingInviteId?: string | null;
  readonly onCancelInvite?: (inviteId: string) => Promise<boolean>;
};

export function OrganizationPendingInvitesGroup({
  invites,
  labels,
  classNames,
  actionsDisabled = true,
  cancelingInviteId,
  onCancelInvite,
}: Props) {
  const canCancel = Boolean(onCancelInvite) && !actionsDisabled;

  return (
    <ZenformedSettingsGroup title={labels.pendingInvites} classNames={classNames}>
      {invites.length === 0 ? (
        <p className={classNames.hint}>{labels.noPendingInvitesYet}</p>
      ) : (
        invites.map((invite) => (
          <div key={invite.id} className={classNames.row}>
            <div>
              <div className={classNames.rowValue}>{invite.name}</div>
              <div className={classNames.rowValue}>{invite.email}</div>
              <div className={classNames.hint}>
                {invite.statusLabel}
                {invite.expiresLabel ? ` · ${invite.expiresLabel}` : ''}
                {` · ${invite.sentLabel}`}
              </div>
            </div>
            <div className={classNames.actions}>
              <button
                type="button"
                className={`${classNames.btn} ${classNames.btnSmall}`}
                disabled
                title={labels.resendComingSoon}
              >
                {labels.resend}
              </button>
              <button
                type="button"
                className={`${classNames.btn} ${classNames.btnSmall} ${classNames.btnGhost}`}
                disabled={!canCancel || cancelingInviteId === invite.id}
                onClick={() => {
                  void onCancelInvite?.(invite.id);
                }}
              >
                {cancelingInviteId === invite.id ? labels.saving : labels.cancelInvite}
              </button>
            </div>
          </div>
        ))
      )}
    </ZenformedSettingsGroup>
  );
}
