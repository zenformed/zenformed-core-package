'use client';

import { PlaceholderSectionNote } from '../components/PlaceholderSectionNote';
import { ZenformedSettingsGroup } from '../components/ZenformedSettingsGroup';
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

function BillingAppCard({
  app,
  labels,
  classNames,
  onManage,
}: {
  readonly app: OrganizationSettingsAppAccess;
  readonly labels: OrganizationSettingsLabels;
  readonly classNames: OrganizationSettingsClassNames;
  readonly onManage?: (appSlug: string) => void;
}) {
  const isTrial = app.entitlementStatus?.trim().toLowerCase() === 'trial';
  const manageEnabled = app.manageEnabled === true && onManage != null;
  const appSlug = app.appSlug ?? app.id;

  return (
    <article className={classNames.appBillingCard}>
      <div className={classNames.appBillingRow}>
        <div className={classNames.appBillingName}>
          <strong>{app.name}</strong>
          <div className={classNames.appBillingPlan}>{app.planLabel}</div>
        </div>
        <div className={classNames.appBillingActions}>
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
              onManage={workspace?.onManageAppSubscription}
            />
          ))
        )}
      </ZenformedSettingsGroup>
    </>
  );
}
