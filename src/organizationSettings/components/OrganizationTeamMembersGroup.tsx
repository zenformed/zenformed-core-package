'use client';

import { ZenformedSettingsGroup } from './ZenformedSettingsGroup';
import type {
  OrganizationSettingsClassNames,
  OrganizationSettingsLabels,
  OrganizationSettingsMember,
  OrganizationSettingsPlan,
} from '../types';

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
};

export function OrganizationTeamMembersGroup({
  members,
  plan,
  labels,
  classNames,
  isLoading,
  seatsConnected,
  inviteDisabled = true,
}: Props) {
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
          disabled={inviteDisabled || isLoading}
          title={labels.inviteComingSoon}
        >
          {labels.inviteMember}
        </button>
      </div>
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
