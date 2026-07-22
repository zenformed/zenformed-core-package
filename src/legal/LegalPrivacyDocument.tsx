'use client';

import type { ReactElement } from 'react';
import { LegalDocumentBody } from './LegalDocumentBody';
import { LegalDocumentFooter } from './LegalDocumentFooter';
import { LegalPrivacyMeta } from './LegalDocumentMeta';
import { PRIVACY_POLICY_SECTIONS } from './privacyPolicyContent';
import styles from './legal.module.css';

export function LegalPrivacyDocument(): ReactElement {
  return (
    <>
      <LegalPrivacyMeta />
      <LegalDocumentBody sections={PRIVACY_POLICY_SECTIONS} />
      <div className={styles.document} style={{ paddingTop: 0 }}>
        <LegalDocumentFooter document="privacy" />
      </div>
    </>
  );
}
