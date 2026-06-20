'use client';

import type { ReactElement } from 'react';
import { CHECKOUT_LEGAL_ACCEPTANCE_VALIDATION_MESSAGE } from './checkoutLegalPayload';
import styles from './legal.module.css';

export type CheckoutLegalAcceptanceProps = {
  readonly termsHref: string;
  readonly privacyHref: string;
  readonly checked: boolean;
  readonly onCheckedChange: (checked: boolean) => void;
  readonly validationMessage?: string | null;
  readonly id?: string;
};

export function CheckoutLegalAcceptance({
  termsHref,
  privacyHref,
  checked,
  onCheckedChange,
  validationMessage = null,
  id = 'checkout-legal-acceptance',
}: CheckoutLegalAcceptanceProps): ReactElement {
  const showValidation =
    validationMessage != null && validationMessage.trim() !== ''
      ? validationMessage
      : null;

  return (
    <div className={styles.acceptance}>
      <label className={styles.acceptanceLabel} htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          className={styles.acceptanceCheckbox}
          checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
        />
        <span>
          I have read and agree to the{' '}
          <a
            className={styles.acceptanceLink}
            href={termsHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            className={styles.acceptanceLink}
            href={privacyHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            Privacy Policy
          </a>
        </span>
      </label>
      {showValidation != null ? (
        <p className={styles.acceptanceError} role="alert">
          {showValidation}
        </p>
      ) : null}
    </div>
  );
}

export { CHECKOUT_LEGAL_ACCEPTANCE_VALIDATION_MESSAGE };
