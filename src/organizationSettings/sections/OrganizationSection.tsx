'use client';

import { useEffect, useMemo, useState } from 'react';
import { PlaceholderSectionNote } from '../components/PlaceholderSectionNote';
import { SettingsSaveStatusLine } from '../components/SettingsSaveStatusLine';
import { ZenformedSettingsField } from '../components/ZenformedSettingsField';
import { ZenformedSettingsGroup } from '../components/ZenformedSettingsGroup';
import { ZenformedTimezoneSelect } from '../components/ZenformedTimezoneSelect';
import { resolveDefaultTimezone } from '../timezoneData';
import type {
  OrganizationSettingsBrandingPersistence,
  OrganizationSettingsClassNames,
  OrganizationSettingsLabels,
  OrganizationSettingsViewModel,
} from '../types';

type Props = {
  readonly viewModel: OrganizationSettingsViewModel;
  readonly labels: OrganizationSettingsLabels;
  readonly classNames: OrganizationSettingsClassNames;
  readonly branding?: OrganizationSettingsBrandingPersistence | null;
};

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'lead', label: 'Lead' },
] as const;

const INDUSTRY_OPTIONS = [
  { value: '', labelKey: 'industryNone' as const },
  { value: 'cnc', labelKey: 'industryCnc' as const },
  { value: 'hvac', labelKey: 'industryHvac' as const },
  { value: 'plumbing', labelKey: 'industryPlumbing' as const },
] as const;

export function OrganizationSection({ viewModel, labels, classNames, branding }: Props) {
  const { organization, plan, members, pendingInvites } = viewModel;
  const [companyName, setCompanyName] = useState(organization.companyName);
  const [industry, setIndustry] = useState(organization.industry);
  const [timezone, setTimezone] = useState(
    resolveDefaultTimezone(organization.timezone || null)
  );

  useEffect(() => {
    setCompanyName(organization.companyName);
    setIndustry(organization.industry);
    setTimezone(resolveDefaultTimezone(organization.timezone || null));
  }, [organization.companyName, organization.industry, organization.timezone]);

  const logoUrl = organization.logoUrl;
  const initial = companyName.trim().charAt(0).toUpperCase() || 'O';
  const seatsConnected = plan.seatsTotal > 0;

  const profileDirty = useMemo(() => {
    const savedIndustry = (organization.industry ?? '').trim();
    const savedTimezone = resolveDefaultTimezone(organization.timezone || null);
    return (
      companyName.trim() !== (organization.companyName ?? '').trim() ||
      industry.trim() !== savedIndustry ||
      timezone !== savedTimezone
    );
  }, [companyName, industry, timezone, organization]);

  const profileSaveStatus = branding?.profileSaveStatus ?? 'idle';
  const canSaveProfile = Boolean(branding?.onSaveOrganizationProfile) && profileDirty;
  const savingProfile = profileSaveStatus === 'saving';
  const logoUploading = branding?.logoUploading ?? false;
  const canUploadLogo = Boolean(branding?.onUploadLogoClick && branding?.onLogoFileChange);

  return (
    <>
      <ZenformedSettingsGroup title={labels.orgProfile} classNames={classNames}>
        <ZenformedSettingsField
          label={labels.companyName}
          classNames={classNames}
          value={companyName}
          onChange={setCompanyName}
          readOnly={savingProfile || branding?.isLoading}
        />
        <div className={classNames.field}>
          <span className={classNames.fieldLabel}>{labels.logo}</span>
          <div className={classNames.logoPreview}>
            <div className={classNames.logoInitial}>
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" />
              ) : (
                initial
              )}
            </div>
            <button
              type="button"
              className={classNames.btn}
              disabled={!canUploadLogo || logoUploading || branding?.isLoading}
              onClick={branding?.onUploadLogoClick}
            >
              {logoUploading ? labels.uploadingLogo : labels.uploadLogo}
            </button>
            {branding?.logoInputRef ? (
              <input
                ref={branding.logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={branding.onLogoFileChange}
              />
            ) : null}
          </div>
        </div>
        <div className={classNames.field}>
          <label className={classNames.fieldLabel} htmlFor="org-industry">
            {labels.industry}
          </label>
          <select
            id="org-industry"
            className={`${classNames.select} ${classNames.industrySelect}`}
            value={industry}
            disabled={savingProfile || branding?.isLoading}
            onChange={(e) => setIndustry(e.target.value)}
          >
            {INDUSTRY_OPTIONS.map((opt) => (
              <option key={opt.value || 'none'} value={opt.value}>
                {labels[opt.labelKey]}
              </option>
            ))}
          </select>
        </div>
        <ZenformedTimezoneSelect
          label={labels.timezone}
          classNames={classNames}
          value={timezone}
          disabled={savingProfile || branding?.isLoading}
          onChange={setTimezone}
        />
        <SettingsSaveStatusLine
          status={profileSaveStatus}
          labels={labels}
          classNames={classNames}
          errorMessage={branding?.saveErrorMessage}
          dirty={profileDirty && profileSaveStatus === 'idle'}
        />
        <div className={classNames.actions}>
          <button
            type="button"
            className={`${classNames.btn} ${classNames.btnPrimary}`}
            disabled={!canSaveProfile || savingProfile}
            onClick={() => {
              void branding?.onSaveOrganizationProfile?.({
                companyName: companyName.trim(),
                industry: industry.trim() || null,
                timezone,
              });
            }}
          >
            {savingProfile ? labels.saving : labels.saveOrganizationProfile}
          </button>
        </div>
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
    </>
  );
}
