'use client';

import { useEffect, useMemo, useState, type ReactElement } from 'react';
import {
  pickConfirmSnackbarClassNames,
  ZenformedConfirmSnackbar,
} from '../../dashboardShell';
import { OrganizationInlineInviteRow } from './OrganizationInlineInviteRow';
import { OrganizationInlineMemberEditRow } from './OrganizationInlineMemberEditRow';
import { ZenformedSettingsGroup } from './ZenformedSettingsGroup';
import { organizationRoleDescription } from '../organizationRoleDescriptions';
import orgStyles from '../organizationSettings.module.css';
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
  OrganizationMemberProfileUpdatePayload,
} from '../organizationWorkspaceTypes';
import type {
  AssignableOrganizationMemberRole,
  OrganizationMemberRole,
  OrganizationPermissions,
} from '../organizationPermissions';
import {
  inviteRoleOptionsForPermissions,
  memberCanBeEdited,
  memberCanBeRemoved,
  memberRoleOptionsForPermissions,
} from '../organizationPermissions';

const confirmSnackbarClassNames = pickConfirmSnackbarClassNames(orgStyles);

const ROLE_LABELS: Record<OrganizationSettingsMemberRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  coordinator: 'Coordinator',
  member: 'Member',
};

const ROLE_FILTER_OPTIONS: readonly OrganizationSettingsMemberRole[] = [
  'owner',
  'admin',
  'coordinator',
  'member',
];

type TeamMemberRoleFilter = 'all' | OrganizationSettingsMemberRole;

type Props = {
  readonly members: readonly OrganizationSettingsMember[];
  readonly plan: OrganizationSettingsPlan;
  readonly labels: OrganizationSettingsLabels;
  readonly classNames: OrganizationSettingsClassNames;
  readonly isLoading?: boolean;
  readonly seatsConnected: boolean;
  readonly permissions?: OrganizationPermissions | null;
  readonly currentUserId?: string | null;
  readonly currentUserRole?: OrganizationMemberRole | null;
  readonly inviteDisabled?: boolean;
  readonly roleManagementDisabled?: boolean;
  readonly removeMemberDisabled?: boolean;
  readonly memberProfileEditDisabled?: boolean;
  readonly isCreatingInvite?: boolean;
  readonly updatingMemberRoleId?: string | null;
  readonly updatingMemberProfileId?: string | null;
  readonly removingMemberId?: string | null;
  readonly inviteMutationError?: string | null;
  readonly roleMutationError?: string | null;
  readonly removeMemberMutationError?: string | null;
  readonly memberProfileMutationError?: string | null;
  readonly createdInviteAcceptUrl?: string | null;
  readonly createdInviteEmailDeliveryStatus?: 'sent' | 'failed' | null;
  readonly onDismissCreatedInviteLink?: () => void;
  readonly onCreateInvite?: (payload: OrganizationInviteCreatePayload) => Promise<boolean>;
  readonly onUpdateMemberRole?: (
    memberId: string,
    payload: OrganizationMemberRoleUpdatePayload
  ) => Promise<boolean>;
  readonly onUpdateMemberProfile?: (
    memberId: string,
    payload: OrganizationMemberProfileUpdatePayload
  ) => Promise<boolean>;
  readonly onRemoveMember?: (memberId: string) => Promise<boolean>;
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

function memberMatchesSearch(
  member: OrganizationSettingsMember,
  role: OrganizationSettingsMemberRole,
  query: string
): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const displayName = resolveDisplayName(member).toLowerCase();
  const email = (resolveEmail(member) ?? '').toLowerCase();
  const firstName = (member.firstName ?? '').trim().toLowerCase();
  const lastName = (member.lastName ?? '').trim().toLowerCase();
  const roleLabel = ROLE_LABELS[role].toLowerCase();

  return (
    displayName.includes(normalizedQuery) ||
    email.includes(normalizedQuery) ||
    firstName.includes(normalizedQuery) ||
    lastName.includes(normalizedQuery) ||
    roleLabel.includes(normalizedQuery) ||
    role.includes(normalizedQuery)
  );
}

function TrashIcon({ className }: { className?: string }): ReactElement {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }): ReactElement {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
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
  currentUserRole,
  inviteDisabled = true,
  roleManagementDisabled = true,
  removeMemberDisabled = true,
  memberProfileEditDisabled = true,
  isCreatingInvite = false,
  updatingMemberRoleId = null,
  updatingMemberProfileId = null,
  removingMemberId = null,
  inviteMutationError,
  roleMutationError,
  removeMemberMutationError,
  memberProfileMutationError,
  createdInviteAcceptUrl,
  createdInviteEmailDeliveryStatus,
  onDismissCreatedInviteLink,
  onCreateInvite,
  onUpdateMemberRole,
  onUpdateMemberProfile,
  onRemoveMember,
}: Props) {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [pendingRoles, setPendingRoles] = useState<Record<string, OrganizationSettingsMemberRole>>({});
  const [pendingRemoveMember, setPendingRemoveMember] = useState<OrganizationSettingsMember | null>(
    null
  );
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<TeamMemberRoleFilter>('all');

  const canInvite = Boolean(onCreateInvite) && !inviteDisabled && (permissions?.canInviteMembers ?? false);
  const canManageRoles =
    Boolean(onUpdateMemberRole) &&
    !roleManagementDisabled &&
    (permissions?.canManageMemberRoles ?? false);
  const canRemoveMembers = Boolean(onRemoveMember) && !removeMemberDisabled;
  const canEditMemberProfiles =
    Boolean(onUpdateMemberProfile) && !memberProfileEditDisabled && memberCanBeEdited(permissions);
  const inviteRoleOptions = inviteRoleOptionsForPermissions(permissions);
  const memberRoleOptions = memberRoleOptionsForPermissions();

  const pendingRemoveName = useMemo(
    () => (pendingRemoveMember ? resolveDisplayName(pendingRemoveMember) : ''),
    [pendingRemoveMember]
  );

  useEffect(() => {
    setPendingRoles({});
    setEditingMemberId(null);
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const role = pendingRoles[member.id] ?? member.role;
      if (roleFilter !== 'all' && role !== roleFilter) return false;
      return memberMatchesSearch(member, role, memberSearchQuery);
    });
  }, [members, memberSearchQuery, pendingRoles, roleFilter]);

  const showMemberToolbar = members.length > 0;

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

  async function handleConfirmRemove(): Promise<void> {
    if (pendingRemoveMember == null) return;
    const ok = (await onRemoveMember?.(pendingRemoveMember.id)) ?? false;
    if (ok) setPendingRemoveMember(null);
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
      {showMemberToolbar ? (
        <div className={orgStyles.memberToolbar}>
          <label className={orgStyles.memberSearchField}>
            <span className={orgStyles.visuallyHidden}>{labels.teamMembersSearchPlaceholder}</span>
            <input
              type="search"
              className={orgStyles.memberSearchInput}
              placeholder={labels.teamMembersSearchPlaceholder}
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
              autoComplete="off"
            />
          </label>
          <div className={orgStyles.memberRoleFilters} role="group" aria-label={labels.role}>
            <button
              type="button"
              className={`${orgStyles.memberRoleFilterBtn} ${
                roleFilter === 'all' ? orgStyles.memberRoleFilterBtnActive : ''
              }`}
              aria-pressed={roleFilter === 'all'}
              onClick={() => setRoleFilter('all')}
            >
              {labels.teamMembersFilterAll}
            </button>
            {ROLE_FILTER_OPTIONS.map((role) => (
              <button
                key={role}
                type="button"
                className={`${orgStyles.memberRoleFilterBtn} ${
                  roleFilter === role ? orgStyles.memberRoleFilterBtnActive : ''
                }`}
                aria-pressed={roleFilter === role}
                onClick={() => setRoleFilter(role)}
              >
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>
        </div>
      ) : null}
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
          {createdInviteEmailDeliveryStatus === 'sent' ? (
            <p className={`${classNames.saveStatus} ${classNames.saveStatusSuccess}`}>
              {labels.inviteEmailSent}
            </p>
          ) : createdInviteEmailDeliveryStatus === 'failed' ? (
            <p className={`${classNames.saveStatus} ${classNames.saveStatusError}`}>
              {labels.inviteEmailFailed}
            </p>
          ) : null}
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
      {removeMemberMutationError ? (
        <p className={`${classNames.saveStatus} ${classNames.saveStatusError}`}>
          {removeMemberMutationError}
        </p>
      ) : null}
      {memberProfileMutationError ? (
        <p className={`${classNames.saveStatus} ${classNames.saveStatusError}`}>
          {memberProfileMutationError}
        </p>
      ) : null}
      {members.length === 0 ? (
        <p className={classNames.hint}>{labels.noTeamMembersYet}</p>
      ) : filteredMembers.length === 0 ? (
        <p className={classNames.hint}>{labels.teamMembersNoSearchResults}</p>
      ) : (
        <ul className={classNames.memberList}>
          {filteredMembers.map((member) => {
            const isOwner = member.role === 'owner';
            const isSelf = currentUserId != null && member.userId === currentUserId;
            const role = effectiveRole(member);
            const dirty = isRoleDirty(member);
            const saving = updatingMemberRoleId === member.id;
            const savingProfile = updatingMemberProfileId === member.id;
            const removing = removingMemberId === member.id;
            const isEditing = editingMemberId === member.id;
            const roleSelectDisabled =
              !canManageRoles || isOwner || isSelf || saving || removing || savingProfile || isEditing;
            const displayName = resolveDisplayName(member);
            const email = resolveEmail(member);
            const showRemove =
              canRemoveMembers &&
              memberCanBeRemoved(permissions, currentUserRole, currentUserId, member);
            const showEdit = canEditMemberProfiles;

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
                  <div className={classNames.memberRowControlPrimary}>
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
                    {showEdit ? (
                      <button
                        type="button"
                        className={classNames.memberEditBtn}
                        disabled={removing || saving || savingProfile || isEditing}
                        aria-label={`${labels.editMemberAriaLabel}: ${displayName}`}
                        onClick={() => {
                          setEditingMemberId(member.id);
                          setPendingRemoveMember(null);
                        }}
                      >
                        <EditIcon className={classNames.memberEditBtnIcon} />
                      </button>
                    ) : null}
                    {showRemove ? (
                      <button
                        type="button"
                        className={classNames.memberRemoveBtn}
                        disabled={removing || saving || savingProfile || isEditing}
                        aria-label={`${labels.removeMemberAriaLabel}: ${displayName}`}
                        onClick={() => {
                          setPendingRemoveMember(member);
                          setEditingMemberId(null);
                        }}
                      >
                        <TrashIcon className={classNames.memberRemoveBtnIcon} />
                      </button>
                    ) : null}
                  </div>
                  {dirty && canManageRoles && !isOwner && !isSelf ? (
                    <div className={classNames.memberRowActions}>
                      <button
                        type="button"
                        className={`${classNames.btn} ${classNames.btnPrimary} ${classNames.btnSmall}`}
                        disabled={saving || removing || savingProfile || isEditing}
                        onClick={() => void handleSaveRole(member)}
                      >
                        {saving ? labels.saving : labels.save}
                      </button>
                      <button
                        type="button"
                        className={`${classNames.btn} ${classNames.btnGhost} ${classNames.btnSmall}`}
                        disabled={saving || removing || savingProfile || isEditing}
                        onClick={() => clearPendingRole(member.id)}
                      >
                        {labels.cancel}
                      </button>
                    </div>
                  ) : null}
                </div>
                {isEditing ? (
                  <OrganizationInlineMemberEditRow
                    member={member}
                    labels={labels}
                    classNames={classNames}
                    isSubmitting={savingProfile}
                    errorMessage={memberProfileMutationError}
                    onCancel={() => setEditingMemberId(null)}
                    onSubmit={async (payload) => {
                      const ok = (await onUpdateMemberProfile?.(member.id, payload)) ?? false;
                      if (ok) setEditingMemberId(null);
                      return ok;
                    }}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      <ZenformedConfirmSnackbar
        classNames={confirmSnackbarClassNames}
        isOpen={pendingRemoveMember != null}
        title={`Remove ${pendingRemoveName} from this organization?`}
        confirmLabel={labels.removeMember}
        cancelLabel={labels.cancel}
        variant="danger"
        onClose={() => setPendingRemoveMember(null)}
        onConfirm={() => void handleConfirmRemove()}
      />
    </ZenformedSettingsGroup>
  );
}
