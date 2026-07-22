'use client';

import type { ReactElement } from 'react';
import { LegalDocumentBody } from './LegalDocumentBody';
import { LegalDocumentFooter } from './LegalDocumentFooter';
import { LegalTermsMeta } from './LegalDocumentMeta';
import { TERMS_OF_SERVICE_SECTIONS } from './termsOfServiceContent';
import styles from './legal.module.css';

export function LegalTermsDocument(): ReactElement {
  return (
    <>
      <LegalTermsMeta />
      <LegalDocumentBody sections={TERMS_OF_SERVICE_SECTIONS} />
      <div className={styles.document} style={{ paddingTop: 0 }}>
        <LegalDocumentFooter document="terms" />
      </div>
    </>
  );
}
