'use client';

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

export function AppsBillingSection({ viewModel, labels, classNames }: Props) {
  const { plan, billingApps } = viewModel;

  return (
    <>
      <ZenformedSettingsGroup title={labels.organizationPlan} classNames={classNames}>
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
      </ZenformedSettingsGroup>

      <ZenformedSettingsGroup title={labels.apps} classNames={classNames}>
        {billingApps.map((app) => (
          <div key={app.id} className={classNames.row}>
            <span className={classNames.rowLabel}>{app.name}</span>
            <span className={classNames.rowValue}>{app.planLabel}</span>
            <button type="button" className={`${classNames.btn} ${classNames.btnSmall}`} disabled>
              {app.actionLabel}
            </button>
          </div>
        ))}
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
