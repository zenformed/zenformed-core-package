'use client';

import { PlaceholderSectionNote } from '../components/PlaceholderSectionNote';
import { AppEntitlementBadges } from '../components/AppEntitlementBadges';
import { ZenformedSettingsGroup } from '../components/ZenformedSettingsGroup';
import { resolveBillingAppIconSrc } from '../billingAppIcons';
import type {
  OrganizationSettingsAppAccess,
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

function BillingDetailRow({
  label,
  value,
  classNames,
}: {
  readonly label: string;
  readonly value: string;
  readonly classNames: OrganizationSettingsClassNames;
}) {
  return (
    <div className={classNames.appBillingDetailRow}>
      <span className={classNames.rowLabel}>{label}</span>
      <span className={classNames.rowValue}>{value}</span>
    </div>
  );
}

function BillingAppLogo({
  app,
  iconBaseUrl,
  classNames,
}: {
  readonly app: OrganizationSettingsAppAccess;
  readonly iconBaseUrl?: string | null;
  readonly classNames: OrganizationSettingsClassNames;
}) {
  const appSlug = app.appSlug ?? app.id;
  const iconSrc = resolveBillingAppIconSrc(appSlug, iconBaseUrl);
  if (iconSrc == null) {
    return (
      <span className={classNames.appBillingLogoFallback} aria-hidden="true">
        {app.name.charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      className={classNames.appBillingLogo}
      src={iconSrc}
      alt=""
      width={40}
      height={40}
      loading="lazy"
      decoding="async"
    />
  );
}

function BillingAppCard({
  app,
  labels,
  classNames,
  iconBaseUrl,
  onManage,
}: {
  readonly app: OrganizationSettingsAppAccess;
  readonly labels: OrganizationSettingsLabels;
  readonly classNames: OrganizationSettingsClassNames;
  readonly iconBaseUrl?: string | null;
  readonly onManage?: (appSlug: string) => void;
}) {
  const isTrial = app.entitlementStatus?.trim().toLowerCase() === 'trial';
  const manageEnabled = app.manageEnabled === true && onManage != null;
  const appSlug = app.appSlug ?? app.id;
  const planBadgeText =
    app.planSlug != null && app.planSlug.trim() !== ''
      ? app.planLabel.replace(/\s+Trial$/i, '').trim()
      : app.planLabel;

  return (
    <article className={classNames.appBillingCard}>
      <div className={classNames.appBillingCardHeader}>
        <BillingAppLogo app={app} iconBaseUrl={iconBaseUrl} classNames={classNames} />
        <div className={classNames.appBillingTitleBlock}>
          <strong>{app.name}</strong>
          <AppEntitlementBadges
            planLabel={planBadgeText}
            planBadgeVariant={app.planBadgeVariant ?? 'default'}
            statusLabel={app.statusLabel}
            statusBadgeVariant={app.statusBadgeVariant ?? 'inactive'}
          />
        </div>
      </div>

      {isTrial || app.nextBillingDateLabel != null ? (
        <div className={classNames.appBillingDetails}>
          {isTrial && app.trialEndsLabel != null ? (
            <BillingDetailRow
              label={labels.trialEnds}
              value={app.trialEndsLabel}
              classNames={classNames}
            />
          ) : null}
          {isTrial && app.daysRemaining != null ? (
            <BillingDetailRow
              label={labels.daysRemaining}
              value={String(app.daysRemaining)}
              classNames={classNames}
            />
          ) : null}
          {app.nextBillingDateLabel != null ? (
            <BillingDetailRow
              label={labels.nextBillingDate}
              value={app.nextBillingDateLabel}
              classNames={classNames}
            />
          ) : null}
        </div>
      ) : null}

      <div className={classNames.appBillingFooter}>
        <button
          type="button"
          className={`${classNames.btn} ${classNames.btnSmall}`}
          disabled={!manageEnabled}
          onClick={() => {
            if (manageEnabled) onManage?.(appSlug);
          }}
        >
          {app.actionLabel || labels.manageSubscription}
        </button>
      </div>
    </article>
  );
}

export function AppsBillingSection({ viewModel, labels, classNames, workspace }: Props) {
  const { billingApps } = viewModel;
  const hasBillingSource =
    workspace?.snapshot?.appEntitlements != null || workspace?.snapshot?.appAccess != null;
  const showBillingPlaceholder = !(workspace?.hasLiveData ?? false) || !hasBillingSource;

  return (
    <>
      {showBillingPlaceholder ? (
        <PlaceholderSectionNote message={labels.billingPlaceholderNote} classNames={classNames} />
      ) : null}

      <ZenformedSettingsGroup title={labels.apps} classNames={classNames}>
        {billingApps.length === 0 ? (
          <p className={classNames.hint}>{labels.noAppAccessYet}</p>
        ) : (
          billingApps.map((app) => (
            <BillingAppCard
              key={app.id}
              app={app}
              labels={labels}
              classNames={classNames}
              iconBaseUrl={workspace?.appBillingIconBaseUrl}
              onManage={workspace?.onManageAppSubscription}
            />
          ))
        )}
      </ZenformedSettingsGroup>
    </>
  );
}
