'use client';

import type { ReactElement, ReactNode } from 'react';
import type {
  LegalDocumentParagraph,
  LegalDocumentSection,
  LegalRichTextPart,
} from './legalDocumentTypes';
import styles from './legal.module.css';

export type LegalDocumentBodyProps = {
  readonly sections: readonly LegalDocumentSection[];
};

const EMAIL_PATTERN = /\b([a-zA-Z0-9._%+-]+@zenformed\.com)\b/g;

function linkClassName(): string {
  return styles.inlineLink;
}

function renderPlainTextWithMailto(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const pattern = new RegExp(EMAIL_PATTERN.source, 'g');
  while ((match = pattern.exec(text)) != null) {
    const email = match[1];
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    nodes.push(
      <a
        key={`${keyPrefix}-mail-${match.index}`}
        className={linkClassName()}
        href={`mailto:${email}`}
      >
        {email}
      </a>
    );
    lastIndex = match.index + email.length;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes.length > 0 ? nodes : [text];
}

function renderPart(part: LegalRichTextPart, key: string): ReactNode {
  if (typeof part === 'string') {
    return <span key={key}>{renderPlainTextWithMailto(part, key)}</span>;
  }
  return (
    <a key={key} className={linkClassName()} href={part.href}>
      {part.label}
    </a>
  );
}

function renderParagraph(paragraph: LegalDocumentParagraph, index: number): ReactElement {
  if (typeof paragraph === 'string') {
    return (
      <p key={`p-${index}`} className={styles.paragraph}>
        {renderPlainTextWithMailto(paragraph, `p-${index}`)}
      </p>
    );
  }
  return (
    <p key={`p-${index}`} className={styles.paragraph}>
      {paragraph.map((part, partIndex) => renderPart(part, `p-${index}-${partIndex}`))}
    </p>
  );
}

export function LegalDocumentBody({ sections }: LegalDocumentBodyProps): ReactElement {
  return (
    <div className={styles.document} style={{ paddingTop: 0 }}>
      <div className={styles.sections}>
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            {section.paragraphs.map((paragraph, index) => renderParagraph(paragraph, index))}
            {section.bullets != null && section.bullets.length > 0 ? (
              <ul className={styles.bulletList}>
                {section.bullets.map((bullet) => (
                  <li key={bullet} className={styles.bulletItem}>
                    {renderPlainTextWithMailto(bullet, bullet)}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
