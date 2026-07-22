export {
  ZENFORMED_LEGAL_VERSION,
  ZENFORMED_TERMS_EFFECTIVE_DATE,
  ZENFORMED_TERMS_LAST_UPDATED,
  ZENFORMED_PRIVACY_EFFECTIVE_DATE,
  ZENFORMED_PRIVACY_LAST_UPDATED,
  ZENFORMED_LEGAL_ENTITY,
  ZENFORMED_LEGAL_LOCATION,
  ZENFORMED_LEGAL_EMAIL,
  ZENFORMED_PRIVACY_EMAIL,
  DEFAULT_LEGAL_TERMS_PATH,
  DEFAULT_LEGAL_PRIVACY_PATH,
  ZENFORMED_PRODUCT_NAMES,
} from './constants';

export type { CheckoutLegalAcceptancePayload } from './checkoutLegalPayload';
export {
  buildCheckoutLegalAcceptancePayload,
  CHECKOUT_LEGAL_ACCEPTANCE_VALIDATION_MESSAGE,
} from './checkoutLegalPayload';

export type {
  LegalDocumentParagraph,
  LegalDocumentSection,
  LegalRichTextPart,
} from './legalDocumentTypes';
export { TERMS_OF_SERVICE_SECTIONS } from './termsOfServiceContent';
export { PRIVACY_POLICY_SECTIONS } from './privacyPolicyContent';

export { LegalDocumentMeta, LegalTermsMeta, LegalPrivacyMeta } from './LegalDocumentMeta';
export { LegalDocumentFooter } from './LegalDocumentFooter';
export type { LegalDocumentFooterProps } from './LegalDocumentFooter';
export { LegalDocumentBody } from './LegalDocumentBody';
export { LegalTermsDocument } from './LegalTermsDocument';
export { LegalPrivacyDocument } from './LegalPrivacyDocument';
export { CheckoutLegalAcceptance } from './ZenformedCheckoutLegalAcceptance';
