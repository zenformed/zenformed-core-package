'use client';

import { useEffect, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import orgStyles from '../organizationSettings.module.css';

export type OrganizationSettingsBillingToastProps = {
  readonly message: string | null;
  readonly variant?: 'success' | 'error';
  readonly onDismiss: () => void;
  readonly autoDismissMs?: number;
};

export function OrganizationSettingsBillingToast({
  message,
  variant = 'success',
  onDismiss,
  autoDismissMs = 4000,
}: OrganizationSettingsBillingToastProps): ReactElement {
  useEffect(() => {
    if (message == null || message.trim() === '') return;
    const timer = window.setTimeout(onDismiss, autoDismissMs);
    return () => window.clearTimeout(timer);
  }, [message, autoDismissMs, onDismiss]);

  if (message == null || message.trim() === '') return <></>;

  const content = (
    <div
      className={
        variant === 'error' ? orgStyles.billingToastError : orgStyles.billingToastSuccess
      }
      role="status"
      aria-live="polite"
    >
      <span>{message}</span>
      <button type="button" className={orgStyles.billingToastDismiss} onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  );

  if (typeof document === 'undefined') return <></>;
  return createPortal(content, document.body);
}
