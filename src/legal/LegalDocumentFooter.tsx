'use client';

import type { ReactElement } from 'react';
import {
  ZENFORMED_LEGAL_EMAIL,
  ZENFORMED_LEGAL_ENTITY,
  ZENFORMED_LEGAL_LOCATION,
  ZENFORMED_LEGAL_VERSION,
  ZENFORMED_PRIVACY_EMAIL,
} from './constants';
import styles from './legal.module.css';

export function LegalDocumentFooter(): ReactElement {
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
      <p className={styles.footerLine}>Version: {ZENFORMED_LEGAL_VERSION}</p>
    </footer>
  );
}
