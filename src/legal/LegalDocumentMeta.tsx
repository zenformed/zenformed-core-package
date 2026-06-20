'use client';

import type { ReactElement } from 'react';
import {
  ZENFORMED_LEGAL_VERSION,
  ZENFORMED_PRIVACY_EFFECTIVE_DATE,
  ZENFORMED_PRIVACY_LAST_UPDATED,
  ZENFORMED_TERMS_EFFECTIVE_DATE,
  ZENFORMED_TERMS_LAST_UPDATED,
} from './constants';
import styles from './legal.module.css';

export type LegalDocumentMetaProps = {
  readonly documentTitle: 'Terms of Service' | 'Privacy Policy';
  readonly effectiveDate: string;
  readonly lastUpdated: string;
};

export function LegalDocumentMeta({
  documentTitle,
  effectiveDate,
  lastUpdated,
}: LegalDocumentMetaProps): ReactElement {
  return (
    <header className={styles.document}>
      <h1 className={styles.title}>{documentTitle}</h1>
      <div className={styles.meta}>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Effective Date:</span>
          <span>{effectiveDate}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Last Updated:</span>
          <span>{lastUpdated}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Version:</span>
          <span>{ZENFORMED_LEGAL_VERSION}</span>
        </div>
      </div>
    </header>
  );
}

export function LegalTermsMeta(): ReactElement {
  return (
    <LegalDocumentMeta
      documentTitle="Terms of Service"
      effectiveDate={ZENFORMED_TERMS_EFFECTIVE_DATE}
      lastUpdated={ZENFORMED_TERMS_LAST_UPDATED}
    />
  );
}

export function LegalPrivacyMeta(): ReactElement {
  return (
    <LegalDocumentMeta
      documentTitle="Privacy Policy"
      effectiveDate={ZENFORMED_PRIVACY_EFFECTIVE_DATE}
      lastUpdated={ZENFORMED_PRIVACY_LAST_UPDATED}
    />
  );
}
