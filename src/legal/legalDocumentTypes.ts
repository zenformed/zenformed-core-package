/** Inline text or a same-origin / mailto link within a legal paragraph. */
export type LegalRichTextPart =
  | string
  | {
      readonly type: 'link';
      readonly href: string;
      readonly label: string;
    };

export type LegalDocumentParagraph = string | readonly LegalRichTextPart[];

export type LegalDocumentSection = {
  readonly title: string;
  readonly paragraphs: readonly LegalDocumentParagraph[];
  /** Optional bullet list rendered after paragraphs. */
  readonly bullets?: readonly string[];
};
