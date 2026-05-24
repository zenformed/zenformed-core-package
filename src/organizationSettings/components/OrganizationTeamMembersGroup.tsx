'use client';

import { useEffect, useState } from 'react';
import { OrganizationInlineInviteRow } from './OrganizationInlineInviteRow';
import { ZenformedSettingsGroup } from './ZenformedSettingsGroup';
import { organizationRoleDescription } from '../organizationRoleDescriptions';
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
import type { AssignableOrganizationMemberRole } from '../organizationPermissions';
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

function resolveDisplayName(member: OrganizationSettingsMember): string {
  const fromField = member.displayName?.trim();
  if (fromField) return fromField;
  const legacy = member.name.trim();
  const paren = /^(.+?)\s+\([^)]+\)$/.exec(legacy);
  return paren?.[1]?.trim() || legacy || 'Member';
}

function resolveEmail(member: OrganizationSettingsMember): string | null {
  if (member.email != null && member.email.trim() !== '') return member.email.trim();
  const match = /\(([^)]+@[^)]+)\)/.exec(member.name);
  return match?.[1]?.trim() ?? null;
}

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
  const [pendingRoles, setPendingRoles] = useState<Record<string, OrganizationSettingsMemberRole>>({});

  const canInvite = Boolean(onCreateInvite) && !inviteDisabled && (permissions?.canInviteMembers ?? false);
  const canManageRoles = Boolean(onUpdateMemberRole) && !roleManagementDisabled;
  const inviteRoleOptions = inviteRoleOptionsForPermissions(permissions);
  const memberRoleOptions = memberRoleOptionsForPermissions();

  useEffect(() => {
    setPendingRoles({});
  }, [members]);

  function effectiveRole(member: OrganizationSettingsMember): OrganizationSettingsMemberRole {
    return pendingRoles[member.id] ?? member.role;
  }

  function isRoleDirty(member: OrganizationSettingsMember): boolean {
    return effectiveRole(member) !== member.role;
  }

  function setPendingRole(memberId: string, role: OrganizationSettingsMemberRole): void {
    setPendingRoles((prev) => ({ ...prev, [memberId]: role }));
  }

  function clearPendingRole(memberId: string): void {
    setPendingRoles((prev) => {
      if (!(memberId in prev)) return prev;
      const next = { ...prev };
      delete next[memberId];
      return next;
    });
  }

  async function handleSaveRole(member: OrganizationSettingsMember): Promise<void> {
    const nextRole = effectiveRole(member);
    if (nextRole === member.role || nextRole === 'owner') return;
    const ok = await onUpdateMemberRole?.(member.id, {
      role: nextRole as AssignableOrganizationMemberRole,
    });
    if (ok) clearPendingRole(member.id);
  }

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
            const role = effectiveRole(member);
            const dirty = isRoleDirty(member);
            const saving = updatingMemberRoleId === member.id;
            const roleSelectDisabled =
              !canManageRoles || isOwner || isSelf || saving;
            const displayName = resolveDisplayName(member);
            const email = resolveEmail(member);

            return (
              <li key={member.id} className={classNames.memberRow}>
                <div className={classNames.memberRowMain}>
                  <span className={classNames.memberDisplayName}>{displayName}</span>
                  {email ? <span className={classNames.memberEmail}>{email}</span> : null}
                  <p className={classNames.memberRoleDescription}>
                    {organizationRoleDescription(role)}
                  </p>
                </div>
                <div className={classNames.memberRowControls}>
                  {isOwner ? (
                    <span className={`${classNames.badge} ${classNames.badgeMuted}`}>
                      {ROLE_LABELS.owner}
                    </span>
                  ) : (
                    <select
                      className={`${classNames.select} ${classNames.memberRoleSelect}`}
                      value={role}
                      disabled={roleSelectDisabled}
                      aria-label={`Role for ${displayName}`}
                      onChange={(e) => {
                        const nextRole = e.target.value as OrganizationSettingsMemberRole;
                        if (nextRole === 'owner') return;
                        setPendingRole(member.id, nextRole);
                      }}
                    >
                      {memberRoleOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {ROLE_LABELS[opt]}
                        </option>
                      ))}
                    </select>
                  )}
                  {dirty && canManageRoles && !isOwner && !isSelf ? (
                    <div className={classNames.memberRowActions}>
                      <button
                        type="button"
                        className={`${classNames.btn} ${classNames.btnPrimary} ${classNames.btnSmall}`}
                        disabled={saving}
                        onClick={() => void handleSaveRole(member)}
                      >
                        {saving ? labels.saving : labels.save}
                      </button>
                      <button
                        type="button"
                        className={`${classNames.btn} ${classNames.btnGhost} ${classNames.btnSmall}`}
                        disabled={saving}
                        onClick={() => clearPendingRole(member.id)}
                      >
                        {labels.cancel}
                      </button>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </ZenformedSettingsGroup>
  );
}
