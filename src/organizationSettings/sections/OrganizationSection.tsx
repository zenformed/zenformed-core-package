'use client';

import { useEffect, useMemo, useState } from 'react';
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

const INDUSTRY_OPTIONS = [
  { value: '', labelKey: 'industryNone' as const },
  { value: 'cnc', labelKey: 'industryCnc' as const },
  { value: 'hvac', labelKey: 'industryHvac' as const },
  { value: 'plumbing', labelKey: 'industryPlumbing' as const },
] as const;

export function OrganizationSection({
  viewModel,
  labels,
  classNames,
  branding,
}: Props) {
  const { organization } = viewModel;
  const [legalName, setLegalName] = useState(organization.legalName);
  const [displayName, setDisplayName] = useState(organization.displayName);
  const [industry, setIndustry] = useState(organization.industry);
  const [timezone, setTimezone] = useState(
    resolveDefaultTimezone(organization.timezone || null)
  );

  useEffect(() => {
    setLegalName(organization.legalName);
    setDisplayName(organization.displayName);
    setIndustry(organization.industry);
    setTimezone(resolveDefaultTimezone(organization.timezone || null));
  }, [organization.legalName, organization.displayName, organization.industry, organization.timezone]);

  const logoUrl = organization.logoUrl;
  const publicLabel =
    displayName.trim() || legalName.trim() || 'O';
  const initial = publicLabel.trim().charAt(0).toUpperCase() || 'O';
  const profileSaveStatus = branding?.profileSaveStatus ?? 'idle';
  const savingProfile = profileSaveStatus === 'saving';

  const profileDirty = useMemo(() => {
    const savedIndustry = (organization.industry ?? '').trim();
    const savedTimezone = resolveDefaultTimezone(organization.timezone || null);
    return (
      legalName.trim() !== (organization.legalName ?? '').trim() ||
      displayName.trim() !== (organization.displayName ?? '').trim() ||
      industry.trim() !== savedIndustry ||
      timezone !== savedTimezone
    );
  }, [legalName, displayName, industry, timezone, organization]);

  const namesReadOnly =
    !(branding?.canEditOrganizationProfile ?? false) || savingProfile || Boolean(branding?.isLoading);
  const canSaveProfile = Boolean(branding?.onSaveOrganizationProfile) && profileDirty;
  const logoUploading = branding?.logoUploading ?? false;
  const canUploadLogo =
    Boolean(branding?.canEditOrganizationProfile) &&
    Boolean(branding?.onUploadLogoClick && branding?.onLogoFileChange);

  return (
    <>
      <ZenformedSettingsGroup title={labels.orgProfile} classNames={classNames}>
        <ZenformedSettingsField
          label={labels.legalName}
          classNames={classNames}
          value={legalName}
          onChange={setLegalName}
          readOnly={namesReadOnly}
        />
        <p className={classNames.hint}>{labels.legalNameHint}</p>
        <ZenformedSettingsField
          label={labels.displayName}
          classNames={classNames}
          value={displayName}
          onChange={setDisplayName}
          readOnly={namesReadOnly}
        />
        <p className={classNames.hint}>{labels.displayNameHint}</p>
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
              disabled={!canUploadLogo || logoUploading || branding?.isLoading || namesReadOnly}
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
            disabled={savingProfile || branding?.isLoading || namesReadOnly}
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
          disabled={savingProfile || branding?.isLoading || namesReadOnly}
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
            disabled={!canSaveProfile || savingProfile || namesReadOnly}
            onClick={() => {
              void branding?.onSaveOrganizationProfile?.({
                legalName: legalName.trim(),
                displayName: displayName.trim(),
                industry: industry.trim() || null,
                timezone,
              });
            }}
          >
            {savingProfile ? labels.saving : labels.saveOrganizationProfile}
          </button>
        </div>
      </ZenformedSettingsGroup>
    </>
  );
}
