'use client';

import { useState } from 'react';
import { PlaceholderSectionNote } from '../components/PlaceholderSectionNote';
import { ZenformedSettingsField } from '../components/ZenformedSettingsField';
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

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'lead', label: 'Lead' },
] as const;

export function OrganizationSection({ viewModel, labels, classNames }: Props) {
  const { organization, plan, members, pendingInvites, appAccess } = viewModel;
  const [companyName, setCompanyName] = useState(organization.companyName);
  const [industry, setIndustry] = useState(organization.industry);
  const [timezone, setTimezone] = useState(organization.timezone);
  const initial = companyName.trim().charAt(0).toUpperCase() || 'O';
  const seatsConnected = plan.seatsTotal > 0;

  return (
    <>
      <ZenformedSettingsGroup title={labels.orgProfile} classNames={classNames}>
        <ZenformedSettingsField
          label={labels.companyName}
          classNames={classNames}
          value={companyName}
          onChange={setCompanyName}
        />
        <div className={classNames.field}>
          <span className={classNames.fieldLabel}>{labels.logo}</span>
          <div className={classNames.logoPreview}>
            <div className={classNames.logoInitial}>
              {organization.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={organization.logoUrl} alt="" />
              ) : (
                initial
              )}
            </div>
            <button type="button" className={classNames.btn} disabled>
              Upload logo
            </button>
          </div>
        </div>
        <ZenformedSettingsField
          label={labels.industry}
          classNames={classNames}
          value={industry}
          onChange={setIndustry}
        />
        <ZenformedSettingsField
          label={labels.timezone}
          classNames={classNames}
          value={timezone}
          onChange={setTimezone}
        />
      </ZenformedSettingsGroup>

      <ZenformedSettingsGroup title={labels.teamMembers} classNames={classNames}>
        <PlaceholderSectionNote
          message={labels.organizationPlaceholderNote}
          classNames={classNames}
        />
        {seatsConnected ? (
          <p className={classNames.seatsSummary}>
            {labels.seatsUsed}: {plan.seatsUsed} / {plan.seatsTotal}
          </p>
        ) : (
          <p className={classNames.hint}>{labels.seatsNotConnected}</p>
        )}
        <div className={classNames.actions}>
          <button type="button" className={`${classNames.btn} ${classNames.btnPrimary}`} disabled>
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

      <ZenformedSettingsGroup title={labels.pendingInvites} classNames={classNames}>
        <p className={classNames.hint}>{labels.noPendingInvitesYet}</p>
        {pendingInvites.length > 0
          ? pendingInvites.map((invite) => (
              <div key={invite.id} className={classNames.row}>
                <div>
                  <div className={classNames.rowValue}>{invite.email}</div>
                  <div className={classNames.hint}>{invite.sentLabel}</div>
                </div>
                <div className={classNames.actions}>
                  <button
                    type="button"
                    className={`${classNames.btn} ${classNames.btnSmall}`}
                    disabled
                  >
                    {labels.resend}
                  </button>
                  <button
                    type="button"
                    className={`${classNames.btn} ${classNames.btnSmall} ${classNames.btnGhost}`}
                    disabled
                  >
                    {labels.cancel}
                  </button>
                </div>
              </div>
            ))
          : null}
      </ZenformedSettingsGroup>

      <ZenformedSettingsGroup title={labels.appAccess} classNames={classNames}>
        {appAccess.length === 0 ? (
          <p className={classNames.hint}>{labels.noAppAccessYet}</p>
        ) : (
          appAccess.map((app) => (
            <div key={app.id} className={classNames.row}>
              <span className={classNames.rowLabel}>{app.name}</span>
              <span className={classNames.rowValue}>
                {app.planLabel}{' '}
                <span
                  className={
                    app.isActive ? classNames.badgeSuccess : classNames.badgeMuted
                  }
                >
                  {app.statusLabel}
                </span>
              </span>
              <button
                type="button"
                className={`${classNames.btn} ${classNames.btnSmall}`}
                disabled
              >
                {app.actionLabel}
              </button>
            </div>
          ))
        )}
      </ZenformedSettingsGroup>
    </>
  );
}
