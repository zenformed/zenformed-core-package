'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import orgStyles from '../organizationSettings.module.css';
import type { OrganizationSettingsAppAccess, OrganizationSettingsLabels } from '../types';

export type SubscriptionCancelConfirmDialogProps = {
  readonly app: OrganizationSettingsAppAccess | null;
  readonly labels: OrganizationSettingsLabels;
  readonly isSubmitting?: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
};

function formatLabel(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');
}

export function SubscriptionCancelConfirmDialog({
  app,
  labels,
  isSubmitting = false,
  onClose,
  onConfirm,
}: SubscriptionCancelConfirmDialogProps): ReactElement {
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (app == null) {
      setAcknowledged(false);
      return;
    }
    setAcknowledged(false);
  }, [app?.id]);

  useEffect(() => {
    if (app == null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [app, onClose]);

  if (app == null) return <></>;

  const accessDate = app.accessUntilLabel ?? app.nextBillingDateLabel ?? app.trialEndsLabel ?? '—';
  const days =
    app.accessDaysRemaining != null ? String(app.accessDaysRemaining) : app.daysRemaining != null ? String(app.daysRemaining) : null;

  const messageParts = [
    formatLabel(labels.cancelSubscriptionAccessUntil, { date: accessDate }),
    days != null
      ? formatLabel(labels.cancelSubscriptionDaysRemaining, { days })
      : null,
    formatLabel(labels.cancelSubscriptionAfterDate, { appName: app.name }),
  ].filter(Boolean);

  const content = (
    <div className={orgStyles.billingCancelOverlay} role="presentation" onClick={onClose}>
      <div
        className={orgStyles.billingCancelDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="billing-cancel-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="billing-cancel-dialog-title" className={orgStyles.billingCancelTitle}>
          {formatLabel(labels.cancelSubscriptionTitle, { appName: app.name })}
        </h2>
        <div className={orgStyles.billingCancelBody}>
          {messageParts.map((line) => (
            <p key={line} className={orgStyles.billingCancelParagraph}>
              {line}
            </p>
          ))}
          <label className={orgStyles.billingCancelAckRow}>
            <input
              type="checkbox"
              className={orgStyles.checkbox}
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.target.checked)}
            />
            <span>{labels.cancelSubscriptionAcknowledge}</span>
          </label>
        </div>
        <div className={orgStyles.billingCancelActions}>
          <button type="button" className={orgStyles.cancelBtn} onClick={onClose} disabled={isSubmitting}>
            {labels.keepSubscription}
          </button>
          <button
            type="button"
            className={orgStyles.confirmBtnDanger}
            disabled={!acknowledged || isSubmitting}
            onClick={onConfirm}
          >
            {isSubmitting ? labels.saving : labels.cancelSubscriptionConfirm}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return <></>;
  return createPortal(content, document.body);
}
