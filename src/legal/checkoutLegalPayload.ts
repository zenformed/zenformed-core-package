import { ZENFORMED_LEGAL_VERSION } from './constants';

export type CheckoutLegalAcceptancePayload = {
  readonly acceptedTermsVersion: string;
  readonly acceptedPrivacyVersion: string;
};

export function buildCheckoutLegalAcceptancePayload(): CheckoutLegalAcceptancePayload {
  return {
    acceptedTermsVersion: ZENFORMED_LEGAL_VERSION,
    acceptedPrivacyVersion: ZENFORMED_LEGAL_VERSION,
  };
}

export const CHECKOUT_LEGAL_ACCEPTANCE_VALIDATION_MESSAGE =
  'You must agree to the Terms of Service and Privacy Policy to continue to checkout.';
