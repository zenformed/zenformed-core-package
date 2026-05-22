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

export function AppsBillingSection({ viewModel, labels, classNames, workspace }: Props) {
  const { plan, billingApps } = viewModel;
  const planConnected = plan.seatsTotal > 0 && plan.planName !== '—';
  const workspaceLive = workspace?.hasLiveData ?? false;
  const showBillingPlaceholder = !workspaceLive;

  return (
    <>
      {showBillingPlaceholder ? (
        <PlaceholderSectionNote message={labels.billingPlaceholderNote} classNames={classNames} />
      ) : null}

      <ZenformedSettingsGroup title={labels.organizationPlan} classNames={classNames}>
        {planConnected ? (
          <>
            <div className={classNames.row}>
              <span className={classNames.rowLabel}>Plan</span>
              <span className={classNames.rowValue}>{plan.planName}</span>
            </div>
            <div className={classNames.row}>
              <span className={classNames.rowLabel}>{labels.seatsUsed}</span>
              <span className={classNames.rowValue}>
                {plan.seatsUsed} / {plan.seatsTotal}
              </span>
            </div>
            <div className={classNames.row}>
              <span className={classNames.rowLabel}>Status</span>
              <span className={`${classNames.badge} ${classNames.badgeSuccess}`}>
                {plan.statusLabel}
              </span>
            </div>
            {workspace?.snapshot?.seats?.notes ? (
              <p className={classNames.hint}>{workspace.snapshot.seats.notes}</p>
            ) : null}
          </>
        ) : (
          <p className={classNames.hint}>{labels.planNotConnected}</p>
        )}
      </ZenformedSettingsGroup>

      <ZenformedSettingsGroup title={labels.apps} classNames={classNames}>
        {billingApps.length === 0 ? (
          <p className={classNames.hint}>{labels.noAppAccessYet}</p>
        ) : (
          billingApps.map((app) => (
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
