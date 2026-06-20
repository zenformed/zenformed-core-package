'use client';

import { useCallback, useState } from 'react';
import { PlaceholderSectionNote } from '../components/PlaceholderSectionNote';
import { AppEntitlementBadges } from '../components/AppEntitlementBadges';
import { OrganizationSettingsBillingToast } from '../components/OrganizationSettingsBillingToast';
import { SubscriptionBillingConfirmDialog } from '../components/SubscriptionBillingConfirmDialog';
import { SubscriptionCancelConfirmDialog } from '../components/SubscriptionCancelConfirmDialog';
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

type BillingToastState = {
  readonly message: string;
  readonly variant: 'success' | 'error';
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
  onCancel,
  onReactivate,
  onRemoveScheduledDowngrade,
  canceling,
  reactivating,
  removingScheduledDowngrade,
  canManageBilling,
}: {
  readonly app: OrganizationSettingsAppAccess;
  readonly labels: OrganizationSettingsLabels;
  readonly classNames: OrganizationSettingsClassNames;
  readonly iconBaseUrl?: string | null;
  readonly onManage?: (appSlug: string) => void;
  readonly onCancel?: (app: OrganizationSettingsAppAccess) => void;
  readonly onReactivate?: (app: OrganizationSettingsAppAccess) => void;
  readonly onRemoveScheduledDowngrade?: (app: OrganizationSettingsAppAccess) => void;
  readonly canceling?: boolean;
  readonly reactivating?: boolean;
  readonly removingScheduledDowngrade?: boolean;
  readonly canManageBilling?: boolean;
}) {
  const isTrial = app.entitlementStatus?.trim().toLowerCase() === 'trial';
  const cancelScheduled = app.cancelAtPeriodEnd === true;
  const hasScheduledDowngrade = app.removeScheduledDowngradeEnabled === true;
  const manageEnabled = app.manageEnabled === true && onManage != null;
  const cancelEnabled =
    !cancelScheduled &&
    !hasScheduledDowngrade &&
    app.cancelEnabled !== false &&
    canManageBilling === true &&
    onCancel != null;
  const reactivateEnabled =
    cancelScheduled && app.reactivateEnabled !== false && canManageBilling === true && onReactivate != null;
  const removeScheduledDowngradeEnabled =
    hasScheduledDowngrade && canManageBilling === true && onRemoveScheduledDowngrade != null;
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

      {hasScheduledDowngrade && app.scheduledDowngradeLabel != null ? (
        <div className={classNames.appBillingDetails}>
          <p className={classNames.hint}>{app.scheduledDowngradeLabel}</p>
        </div>
      ) : null}

      {cancelScheduled ? (
        <div className={classNames.appBillingDetails}>
          <p className={classNames.hint}>{labels.cancellationScheduled}</p>
          {app.accessUntilLabel != null ? (
            <BillingDetailRow
              label={labels.accessUntil}
              value={app.accessUntilLabel}
              classNames={classNames}
            />
          ) : null}
        </div>
      ) : isTrial || app.nextBillingDateLabel != null ? (
        <div className={classNames.appBillingDetails}>
          {isTrial && app.trialEndsLabel != null ? (
            <BillingDetailRow
              label={labels.trialEnds}
              value={app.trialEndsLabel}
              classNames={classNames}
            />
          ) : null}
          {app.accessDaysRemaining != null || app.daysRemaining != null ? (
            <BillingDetailRow
              label={labels.daysRemaining}
              value={String(app.accessDaysRemaining ?? app.daysRemaining)}
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
        {reactivateEnabled ? (
          <button
            type="button"
            className={`${classNames.btn} ${classNames.btnSmall} ${classNames.btnGhost}`}
            disabled={reactivating}
            onClick={() => onReactivate?.(app)}
          >
            {labels.reactivateSubscription}
          </button>
        ) : null}
        {removeScheduledDowngradeEnabled ? (
          <button
            type="button"
            className={`${classNames.btn} ${classNames.btnSmall} ${classNames.btnGhost}`}
            disabled={removingScheduledDowngrade}
            onClick={() => onRemoveScheduledDowngrade?.(app)}
          >
            {labels.removeScheduledDowngrade}
          </button>
        ) : null}
        {cancelEnabled ? (
          <button
            type="button"
            className={`${classNames.btn} ${classNames.btnSmall} ${classNames.btnGhost}`}
            disabled={canceling}
            onClick={() => onCancel?.(app)}
          >
            {labels.cancelSubscription}
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function AppsBillingSection({ viewModel, labels, classNames, workspace }: Props) {
  const { billingApps } = viewModel;
  const [cancelTarget, setCancelTarget] = useState<OrganizationSettingsAppAccess | null>(null);
  const [reactivateTarget, setReactivateTarget] = useState<OrganizationSettingsAppAccess | null>(null);
  const [removeScheduledDowngradeTarget, setRemoveScheduledDowngradeTarget] =
    useState<OrganizationSettingsAppAccess | null>(null);
  const [reactivateModalError, setReactivateModalError] = useState<string | null>(null);
  const [removeScheduledDowngradeModalError, setRemoveScheduledDowngradeModalError] = useState<
    string | null
  >(null);
  const [billingToast, setBillingToast] = useState<BillingToastState | null>(null);
  const hasBillingSource =
    workspace?.snapshot?.appEntitlements != null || workspace?.snapshot?.appAccess != null;
  const showBillingPlaceholder = !(workspace?.hasLiveData ?? false) || !hasBillingSource;
  const canManageBilling = workspace?.permissions?.canViewAppsBilling === true;
  const cancelingAppSlug = workspace?.cancelingAppSlug ?? null;
  const reactivatingAppSlug = workspace?.reactivatingAppSlug ?? null;
  const removingScheduledChangeAppSlug = workspace?.removingScheduledChangeAppSlug ?? null;

  const dismissBillingToast = useCallback(() => {
    setBillingToast(null);
  }, []);

  const openReactivateTarget = useCallback((app: OrganizationSettingsAppAccess) => {
    setReactivateModalError(null);
    workspace?.onDismissReactivateSubscriptionError?.();
    setReactivateTarget(app);
  }, [workspace]);

  const openRemoveScheduledDowngradeTarget = useCallback((app: OrganizationSettingsAppAccess) => {
    setRemoveScheduledDowngradeModalError(null);
    workspace?.onDismissRemoveScheduledChangeError?.();
    setRemoveScheduledDowngradeTarget(app);
  }, [workspace]);

  return (
    <>
      {showBillingPlaceholder ? (
        <PlaceholderSectionNote message={labels.billingPlaceholderNote} classNames={classNames} />
      ) : null}

      {workspace?.cancelSubscriptionError ? (
        <p className={classNames.saveStatusError} role="alert">
          {workspace.cancelSubscriptionError}
        </p>
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
              onCancel={setCancelTarget}
              onReactivate={openReactivateTarget}
              onRemoveScheduledDowngrade={openRemoveScheduledDowngradeTarget}
              canceling={cancelingAppSlug === (app.appSlug ?? app.id)}
              reactivating={reactivatingAppSlug === (app.appSlug ?? app.id)}
              removingScheduledDowngrade={removingScheduledChangeAppSlug === (app.appSlug ?? app.id)}
              canManageBilling={canManageBilling}
            />
          ))
        )}
      </ZenformedSettingsGroup>

      <SubscriptionCancelConfirmDialog
        app={cancelTarget}
        labels={labels}
        isSubmitting={cancelTarget != null && cancelingAppSlug === (cancelTarget.appSlug ?? cancelTarget.id)}
        onClose={() => {
          workspace?.onDismissCancelSubscriptionError?.();
          setCancelTarget(null);
        }}
        onConfirm={() => {
          if (cancelTarget == null || workspace?.onCancelAppSubscription == null) return;
          void workspace.onCancelAppSubscription(cancelTarget.appSlug ?? cancelTarget.id).then((ok) => {
            if (ok) setCancelTarget(null);
          });
        }}
      />

      <SubscriptionBillingConfirmDialog
        open={reactivateTarget != null}
        title={labels.reactivateSubscriptionTitle}
        bodyParagraphs={[labels.reactivateSubscriptionBody1, labels.reactivateSubscriptionBody2]}
        cancelLabel={labels.cancel}
        confirmLabel={labels.reactivateSubscription}
        isSubmitting={
          reactivateTarget != null &&
          reactivatingAppSlug === (reactivateTarget.appSlug ?? reactivateTarget.id)
        }
        errorMessage={reactivateModalError}
        onClose={() => {
          if (reactivatingAppSlug != null) return;
          setReactivateModalError(null);
          setReactivateTarget(null);
        }}
        onConfirm={() => {
          if (reactivateTarget == null || workspace?.onReactivateAppSubscription == null) return;
          const appSlug = reactivateTarget.appSlug ?? reactivateTarget.id;
          void workspace.onReactivateAppSubscription(appSlug).then((ok) => {
            if (ok) {
              setReactivateTarget(null);
              setReactivateModalError(null);
              setBillingToast({
                message: labels.reactivateSubscriptionSuccess,
                variant: 'success',
              });
              return;
            }
            setReactivateModalError(labels.reactivateSubscriptionFailed);
          });
        }}
      />

      <SubscriptionBillingConfirmDialog
        open={removeScheduledDowngradeTarget != null}
        title={labels.removeScheduledDowngradeTitle}
        bodyParagraphs={[labels.removeScheduledDowngradeBody1, labels.removeScheduledDowngradeBody2]}
        cancelLabel={labels.cancel}
        confirmLabel={labels.removeScheduledDowngrade}
        isSubmitting={
          removeScheduledDowngradeTarget != null &&
          removingScheduledChangeAppSlug ===
            (removeScheduledDowngradeTarget.appSlug ?? removeScheduledDowngradeTarget.id)
        }
        errorMessage={removeScheduledDowngradeModalError}
        onClose={() => {
          if (removingScheduledChangeAppSlug != null) return;
          setRemoveScheduledDowngradeModalError(null);
          setRemoveScheduledDowngradeTarget(null);
        }}
        onConfirm={() => {
          if (
            removeScheduledDowngradeTarget == null ||
            workspace?.onRemoveScheduledPlanChange == null
          ) {
            return;
          }
          const appSlug = removeScheduledDowngradeTarget.appSlug ?? removeScheduledDowngradeTarget.id;
          void workspace.onRemoveScheduledPlanChange(appSlug).then((ok) => {
            if (ok) {
              setRemoveScheduledDowngradeTarget(null);
              setRemoveScheduledDowngradeModalError(null);
              setBillingToast({
                message: labels.removeScheduledDowngradeSuccess,
                variant: 'success',
              });
              return;
            }
            setRemoveScheduledDowngradeModalError(labels.removeScheduledDowngradeFailed);
          });
        }}
      />

      <OrganizationSettingsBillingToast
        message={billingToast?.message ?? null}
        variant={billingToast?.variant ?? 'success'}
        onDismiss={dismissBillingToast}
      />
    </>
  );
}
