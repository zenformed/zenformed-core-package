'use client';

import { useEffect, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import orgStyles from '../organizationSettings.module.css';

export type SubscriptionBillingConfirmDialogProps = {
  readonly open: boolean;
  readonly title: string;
  readonly bodyParagraphs: readonly string[];
  readonly cancelLabel: string;
  readonly confirmLabel: string;
  readonly isSubmitting?: boolean;
  readonly errorMessage?: string | null;
  readonly confirmVariant?: 'primary' | 'danger';
  readonly onClose: () => void;
  readonly onConfirm: () => void;
};

export function SubscriptionBillingConfirmDialog({
  open,
  title,
  bodyParagraphs,
  cancelLabel,
  confirmLabel,
  isSubmitting = false,
  errorMessage = null,
  confirmVariant = 'primary',
  onClose,
  onConfirm,
}: SubscriptionBillingConfirmDialogProps): ReactElement {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, isSubmitting, onClose]);

  if (!open) return <></>;

  const confirmClassName =
    confirmVariant === 'danger' ? orgStyles.confirmBtnDanger : orgStyles.confirmBtn;

  const content = (
    <div className={orgStyles.billingCancelOverlay} role="presentation" onClick={isSubmitting ? undefined : onClose}>
      <div
        className={orgStyles.billingCancelDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="billing-action-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="billing-action-dialog-title" className={orgStyles.billingCancelTitle}>
          {title}
        </h2>
        <div className={orgStyles.billingCancelBody}>
          {bodyParagraphs.map((line) => (
            <p key={line} className={orgStyles.billingCancelParagraph}>
              {line}
            </p>
          ))}
          {errorMessage != null && errorMessage.trim() !== '' ? (
            <p className={orgStyles.billingActionError} role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>
        <div className={orgStyles.billingCancelActions}>
          <button type="button" className={orgStyles.cancelBtn} onClick={onClose} disabled={isSubmitting}>
            {cancelLabel}
          </button>
          <button type="button" className={confirmClassName} disabled={isSubmitting} onClick={onConfirm}>
            {isSubmitting ? 'Saving…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return <></>;
  return createPortal(content, document.body);
}
