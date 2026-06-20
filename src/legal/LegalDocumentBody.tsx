'use client';

import type { ReactElement } from 'react';
import type { LegalDocumentSection } from './termsOfServiceContent';
import styles from './legal.module.css';

export type LegalDocumentBodyProps = {
  readonly sections: readonly LegalDocumentSection[];
};

export function LegalDocumentBody({ sections }: LegalDocumentBodyProps): ReactElement {
  return (
    <div className={styles.document} style={{ paddingTop: 0 }}>
      <div className={styles.sections}>
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className={styles.paragraph}>
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
