'use client';

import { PlaceholderSectionNote } from '../components/PlaceholderSectionNote';
import { ZenformedSettingsGroup } from '../components/ZenformedSettingsGroup';
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

function AppActiveCheck({
  className,
  ariaLabel,
}: {
  readonly className: string;
  readonly ariaLabel: string;
}) {
  return (
    <span className={className} role="img" aria-label={ariaLabel}>
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L5.69 10.19l6.72-6.72a.75.75 0 0 1 1.06 0Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

export function AppsBillingSection({ viewModel, labels, classNames, workspace }: Props) {
  const { billingApps } = viewModel;
  const workspaceLive = workspace?.hasLiveData ?? false;
  const showBillingPlaceholder = !workspaceLive;

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
            <div key={app.id} className={classNames.appBillingRow}>
              <span className={classNames.appBillingName}>{app.name}</span>
              <span className={classNames.appBillingPlan}>{app.planLabel}</span>
              {app.isActive ? (
                <AppActiveCheck
                  className={classNames.appBillingActiveCheck}
                  ariaLabel={labels.appActiveAriaLabel}
                />
              ) : (
                <span className={classNames.appBillingActiveCheck} aria-hidden="true" />
              )}
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

      <ZenformedSettingsGroup title={labels.billingActions} classNames={classNames}>
        <div className={classNames.actions}>
          <button type="button" className={classNames.btn} disabled>
            {labels.manageBilling}
          </button>
          <button type="button" className={classNames.btn} disabled>
            {labels.viewInvoices}
          </button>
        </div>
      </ZenformedSettingsGroup>
    </>
  );
}
