'use client';

import type { ReactElement } from 'react';
import {
  DEFAULT_LEGAL_PRIVACY_PATH,
  DEFAULT_LEGAL_TERMS_PATH,
  ZENFORMED_LEGAL_EMAIL,
  ZENFORMED_LEGAL_ENTITY,
  ZENFORMED_LEGAL_LOCATION,
  ZENFORMED_LEGAL_VERSION,
  ZENFORMED_PRIVACY_EMAIL,
} from './constants';
import styles from './legal.module.css';

export type LegalDocumentFooterProps = {
  /** Which legal document is currently shown — used for cross-links. */
  readonly document?: 'privacy' | 'terms';
};

export function LegalDocumentFooter({
  document = 'terms',
}: LegalDocumentFooterProps): ReactElement {
  const otherHref = document === 'privacy' ? DEFAULT_LEGAL_TERMS_PATH : DEFAULT_LEGAL_PRIVACY_PATH;
  const otherLabel = document === 'privacy' ? 'Terms of Service' : 'Privacy Policy';

  return (
    <footer className={styles.footer}>
      <p className={styles.footerEntity}>{ZENFORMED_LEGAL_ENTITY}</p>
      <p className={styles.footerLine}>{ZENFORMED_LEGAL_LOCATION}</p>
      <p className={styles.footerLine}>
        Contact:{' '}
        <a className={styles.footerLink} href={`mailto:${ZENFORMED_LEGAL_EMAIL}`}>
          {ZENFORMED_LEGAL_EMAIL}
        </a>
        {' · '}
        <a className={styles.footerLink} href={`mailto:${ZENFORMED_PRIVACY_EMAIL}`}>
          {ZENFORMED_PRIVACY_EMAIL}
        </a>
      </p>
      <p className={styles.footerLine}>
        See also:{' '}
        <a className={styles.footerLink} href={otherHref}>
          {otherLabel}
        </a>
      </p>
      <p className={styles.footerLine}>Version: {ZENFORMED_LEGAL_VERSION}</p>
    </footer>
  );
}
