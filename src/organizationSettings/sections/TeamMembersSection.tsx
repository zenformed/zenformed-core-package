'use client';

import { OrganizationPendingInvitesGroup } from '../components/OrganizationPendingInvitesGroup';
import { OrganizationTeamMembersGroup } from '../components/OrganizationTeamMembersGroup';
import type {
  OrganizationSettingsClassNames,
  OrganizationSettingsLabels,
  OrganizationSettingsViewModel,
} from '../types';
import type { OrganizationSettingsWorkspacePersistence } from '../organizationWorkspaceTypes';

type Props = {
  readonly viewModel: OrganizationSettingsViewModel;
  readonly labels: OrganizationSettingsLabels;
  readonly classNames: OrganizationSettingsClassNames;
  readonly workspace?: OrganizationSettingsWorkspacePersistence | null;
};

export function TeamMembersSection({ viewModel, labels, classNames, workspace }: Props) {
  const { plan, members, pendingInvites } = viewModel;
  const seatsConnected = plan.seatsTotal > 0;
  const workspaceLoading = workspace?.isLoading ?? false;
  const workspaceLive = workspace?.hasLiveData ?? false;

  return (
    <>
      {workspaceLoading && !workspaceLive ? (
        <p className={classNames.saveStatus}>{labels.loadingSettings}</p>
      ) : null}
      {workspace?.loadError && !workspaceLive ? (
        <p className={`${classNames.saveStatus} ${classNames.saveStatusMuted}`}>
          {workspace.loadError}
        </p>
      ) : null}

      <OrganizationTeamMembersGroup
        members={members}
        plan={plan}
        labels={labels}
        classNames={classNames}
        isLoading={workspaceLoading}
        seatsConnected={seatsConnected}
        permissions={workspace?.permissions}
        currentUserId={workspace?.currentUserId}
        currentUserRole={workspace?.currentUserRole}
        inviteDisabled={workspace?.inviteActionsDisabled ?? true}
        roleManagementDisabled={workspace?.roleManagementDisabled ?? true}
        removeMemberDisabled={workspace?.removeMemberDisabled ?? true}
        memberProfileEditDisabled={workspace?.memberProfileEditDisabled ?? true}
        isCreatingInvite={workspace?.isCreatingInvite}
        updatingMemberRoleId={workspace?.updatingMemberRoleId}
        updatingMemberProfileId={workspace?.updatingMemberProfileId}
        removingMemberId={workspace?.removingMemberId}
        inviteMutationError={workspace?.inviteMutationError}
        roleMutationError={workspace?.roleMutationError}
        removeMemberMutationError={workspace?.removeMemberMutationError}
        memberProfileMutationError={workspace?.memberProfileMutationError}
        createdInviteAcceptUrl={workspace?.createdInviteAcceptUrl}
        createdInviteEmailDeliveryStatus={workspace?.createdInviteEmailDeliveryStatus}
        onDismissCreatedInviteLink={workspace?.onDismissCreatedInviteLink}
        onCreateInvite={workspace?.onCreateInvite}
        onUpdateMemberRole={workspace?.onUpdateMemberRole}
        onUpdateMemberProfile={workspace?.onUpdateMemberProfile}
        onRemoveMember={workspace?.onRemoveMember}
      />

      <OrganizationPendingInvitesGroup
        invites={pendingInvites}
        labels={labels}
        classNames={classNames}
        actionsDisabled={workspace?.inviteActionsDisabled ?? true}
        cancelingInviteId={workspace?.cancelingInviteId}
        onCancelInvite={workspace?.onCancelInvite}
      />
    </>
  );
}
