'use client';

import { useState } from 'react';
import { OrganizationInlineInviteRow } from './OrganizationInlineInviteRow';
import { ZenformedSettingsGroup } from './ZenformedSettingsGroup';
import type {
  OrganizationSettingsClassNames,
  OrganizationSettingsLabels,
  OrganizationSettingsMember,
  OrganizationSettingsPlan,
} from '../types';
import type { OrganizationInviteCreatePayload } from '../organizationWorkspaceTypes';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'lead', label: 'Lead' },
] as const;

type Props = {
  readonly members: readonly OrganizationSettingsMember[];
  readonly plan: OrganizationSettingsPlan;
  readonly labels: OrganizationSettingsLabels;
  readonly classNames: OrganizationSettingsClassNames;
  readonly isLoading?: boolean;
  readonly seatsConnected: boolean;
  readonly inviteDisabled?: boolean;
  readonly isCreatingInvite?: boolean;
  readonly inviteMutationError?: string | null;
  readonly createdInviteAcceptUrl?: string | null;
  readonly onDismissCreatedInviteLink?: () => void;
  readonly onCreateInvite?: (payload: OrganizationInviteCreatePayload) => Promise<boolean>;
};

export function OrganizationTeamMembersGroup({
  members,
  plan,
  labels,
  classNames,
  isLoading,
  seatsConnected,
  inviteDisabled = true,
  isCreatingInvite = false,
  inviteMutationError,
  createdInviteAcceptUrl,
  onDismissCreatedInviteLink,
  onCreateInvite,
}: Props) {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const canInvite = Boolean(onCreateInvite) && !inviteDisabled;

  async function handleCopyInviteLink(): Promise<void> {
    if (createdInviteAcceptUrl == null) return;
    try {
      await navigator.clipboard.writeText(createdInviteAcceptUrl);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  }

  return (
    <ZenformedSettingsGroup title={labels.teamMembers} classNames={classNames}>
      {seatsConnected ? (
        <p className={classNames.seatsSummary}>
          {labels.seatsUsed}: {plan.seatsUsed} / {plan.seatsTotal}
        </p>
      ) : (
        <p className={classNames.hint}>{labels.seatsNotConnected}</p>
      )}
      <div className={classNames.actions}>
        <button
          type="button"
          className={`${classNames.btn} ${classNames.btnPrimary}`}
          disabled={!canInvite || isLoading || showInviteForm}
          onClick={() => setShowInviteForm(true)}
        >
          {labels.inviteMember}
        </button>
      </div>
      {createdInviteAcceptUrl ? (
        <div className={classNames.row}>
          <p className={classNames.hint}>{labels.inviteLinkCopyHint}</p>
          <div className={classNames.actions}>
            <button
              type="button"
              className={`${classNames.btn} ${classNames.btnPrimary}`}
              onClick={() => void handleCopyInviteLink()}
            >
              {copyStatus === 'copied' ? labels.inviteLinkCopied : labels.copyInviteLink}
            </button>
            <button
              type="button"
              className={classNames.btn}
              onClick={() => {
                setCopyStatus('idle');
                onDismissCreatedInviteLink?.();
              }}
            >
              {labels.dismissInviteLink}
            </button>
          </div>
          {copyStatus === 'failed' ? (
            <p className={classNames.saveStatus}>{labels.saveFailed}</p>
          ) : null}
        </div>
      ) : null}
      {showInviteForm && canInvite ? (
        <OrganizationInlineInviteRow
          labels={labels}
          classNames={classNames}
          isSubmitting={isCreatingInvite}
          errorMessage={inviteMutationError}
          onCancel={() => setShowInviteForm(false)}
          onSubmit={async (payload) => {
            const ok = await onCreateInvite?.(payload);
            if (ok) setShowInviteForm(false);
            return ok ?? false;
          }}
        />
      ) : null}
      {members.length === 0 ? (
        <p className={classNames.hint}>{labels.noTeamMembersYet}</p>
      ) : (
        <ul className={classNames.memberList}>
          {members.map((member) => (
            <li key={member.id} className={classNames.memberRow}>
              <span className={classNames.memberName}>{member.name}</span>
              <select
                className={`${classNames.select} ${classNames.memberRoleSelect}`}
                defaultValue={member.role}
                disabled
                aria-label={`Role for ${member.name}`}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      )}
    </ZenformedSettingsGroup>
  );
}
