'use client';

import { useState } from 'react';
import { OrganizationInlineInviteRow } from './OrganizationInlineInviteRow';
import { ZenformedSettingsGroup } from './ZenformedSettingsGroup';
import type {
  OrganizationSettingsClassNames,
  OrganizationSettingsLabels,
  OrganizationSettingsMember,
  OrganizationSettingsMemberRole,
  OrganizationSettingsPlan,
} from '../types';
import type {
  OrganizationInviteCreatePayload,
  OrganizationMemberRoleUpdatePayload,
} from '../organizationWorkspaceTypes';
import type { OrganizationPermissions } from '../organizationPermissions';
import {
  inviteRoleOptionsForPermissions,
  memberRoleOptionsForPermissions,
} from '../organizationPermissions';

const ROLE_LABELS: Record<OrganizationSettingsMemberRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  coordinator: 'Coordinator',
  member: 'Member',
};

type Props = {
  readonly members: readonly OrganizationSettingsMember[];
  readonly plan: OrganizationSettingsPlan;
  readonly labels: OrganizationSettingsLabels;
  readonly classNames: OrganizationSettingsClassNames;
  readonly isLoading?: boolean;
  readonly seatsConnected: boolean;
  readonly permissions?: OrganizationPermissions | null;
  readonly currentUserId?: string | null;
  readonly inviteDisabled?: boolean;
  readonly roleManagementDisabled?: boolean;
  readonly isCreatingInvite?: boolean;
  readonly updatingMemberRoleId?: string | null;
  readonly inviteMutationError?: string | null;
  readonly roleMutationError?: string | null;
  readonly createdInviteAcceptUrl?: string | null;
  readonly onDismissCreatedInviteLink?: () => void;
  readonly onCreateInvite?: (payload: OrganizationInviteCreatePayload) => Promise<boolean>;
  readonly onUpdateMemberRole?: (
    memberId: string,
    payload: OrganizationMemberRoleUpdatePayload
  ) => Promise<boolean>;
};

export function OrganizationTeamMembersGroup({
  members,
  plan,
  labels,
  classNames,
  isLoading,
  seatsConnected,
  permissions,
  currentUserId,
  inviteDisabled = true,
  roleManagementDisabled = true,
  isCreatingInvite = false,
  updatingMemberRoleId = null,
  inviteMutationError,
  roleMutationError,
  createdInviteAcceptUrl,
  onDismissCreatedInviteLink,
  onCreateInvite,
  onUpdateMemberRole,
}: Props) {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const canInvite = Boolean(onCreateInvite) && !inviteDisabled && (permissions?.canInviteMembers ?? false);
  const canManageRoles = Boolean(onUpdateMemberRole) && !roleManagementDisabled;
  const inviteRoleOptions = inviteRoleOptionsForPermissions(permissions);
  const memberRoleOptions = memberRoleOptionsForPermissions();

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
      {canInvite ? (
        <div className={classNames.actions}>
          <button
            type="button"
            className={`${classNames.btn} ${classNames.btnPrimary}`}
            disabled={isLoading || showInviteForm}
            onClick={() => setShowInviteForm(true)}
          >
            {labels.inviteMember}
          </button>
        </div>
      ) : null}
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
          roleOptions={inviteRoleOptions}
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
      {roleMutationError ? (
        <p className={`${classNames.saveStatus} ${classNames.saveStatusError}`}>{roleMutationError}</p>
      ) : null}
      {members.length === 0 ? (
        <p className={classNames.hint}>{labels.noTeamMembersYet}</p>
      ) : (
        <ul className={classNames.memberList}>
          {members.map((member) => {
            const isOwner = member.role === 'owner';
            const isSelf = currentUserId != null && member.userId === currentUserId;
            const roleSelectDisabled =
              !canManageRoles || isOwner || isSelf || updatingMemberRoleId === member.id;
            return (
              <li key={member.id} className={classNames.memberRow}>
                <span className={classNames.memberName}>{member.name}</span>
                <select
                  className={`${classNames.select} ${classNames.memberRoleSelect}`}
                  value={member.role}
                  disabled={roleSelectDisabled}
                  aria-label={`Role for ${member.name}`}
                  onChange={(e) => {
                    const nextRole = e.target.value as OrganizationSettingsMemberRole;
                    if (nextRole === member.role) return;
                    if (nextRole === 'owner') return;
                    void onUpdateMemberRole?.(member.id, { role: nextRole });
                  }}
                >
                  {isOwner ? (
                    <option value="owner">{ROLE_LABELS.owner}</option>
                  ) : (
                    memberRoleOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {ROLE_LABELS[opt]}
                      </option>
                    ))
                  )}
                </select>
              </li>
            );
          })}
        </ul>
      )}
    </ZenformedSettingsGroup>
  );
}
