'use client';

export { DEFAULT_AUTH_LABELS, resolveAuthLabels } from './authLabels';
export type { ZenformedAuthLabels } from './authLabels';
export { ZenformedAuthNavLink } from './ZenformedAuthNavLink';
export type { ZenformedAuthNavLinkProps } from './ZenformedAuthNavLink';
export { ZenformedAuthLinkButton } from './ZenformedAuthLinkButton';
export type { ZenformedAuthLinkButtonProps } from './ZenformedAuthLinkButton';
export { ZenformedAuthPageLinks } from './ZenformedAuthPageLinks';
export type { ZenformedAuthPageLinksProps } from './ZenformedAuthPageLinks';
export { ZenformedLoginForm } from './ZenformedLoginForm';
export type {
  ZenformedLoginFormProps,
  ZenformedLoginSubmitHandler,
} from './ZenformedLoginForm';
export { ZenformedRegisterForm } from './ZenformedRegisterForm';
export type {
  ZenformedRegisterFormProps,
  ZenformedRegisterSubmitHandler,
  ZenformedRegisterSubmitInput,
} from './ZenformedRegisterForm';
export { ZenformedForgotPasswordForm } from './ZenformedForgotPasswordForm';
export type {
  ZenformedForgotPasswordFormProps,
  RequestPasswordResetHandler,
} from './ZenformedForgotPasswordForm';
export { ZenformedRecoveryPasswordForm } from './ZenformedRecoveryPasswordForm';
export type {
  ZenformedRecoveryPasswordFormProps,
  UpdateRecoveredPasswordHandler,
} from './ZenformedRecoveryPasswordForm';
export { type ZenformedAuthSupabaseClient } from './zenformedAuthSupabaseClient';
export {
  parseAuthEntryQueryParams,
  buildAuthEntryHref,
  resolvePostAuthRedirectTarget,
  type AuthEntryQueryParams,
} from './authEntryQueryParams';
export { hasAuthRecoveryCallback } from './authRecoveryCallback';
export { waitForSupabaseAuthSessionSync } from './waitForSupabaseAuthSessionSync';
export { signInWithPassword, type SignInWithPasswordResult } from './signInWithPassword';
export {
  signUpWithPassword,
  type SignUpWithPasswordOptions,
  type SignUpWithPasswordResult,
} from './signUpWithPassword';
export { signInWithGoogle, type SignInWithGoogleOptions, type SignInWithGoogleResult } from './signInWithGoogle';
export {
  sanitizeAuthReturnPath,
  sanitizePostAuthDestination,
  isAuthEntryReturnPath,
  AUTH_ENTRY_PATH_PREFIXES,
} from './sanitizeAuthReturnPath';
export {
  ZENFORMED_OAUTH_INTENT_STORAGE_KEY,
  ZENFORMED_OAUTH_INTENT_TTL_MS,
  buildZenformedOAuthIntent,
  isZenformedOAuthIntentExpired,
  saveZenformedOAuthIntent,
  saveZenformedOAuthIntentFromAuthEntry,
  consumeZenformedOAuthIntent,
  clearZenformedOAuthIntent,
  authEntryParamsFromOAuthIntent,
  type ZenformedOAuthIntent,
  type SaveZenformedOAuthIntentInput,
} from './oauthIntent';
export {
  extractGoogleProfileNames,
  mergeProfileNamesFromGoogle,
  type GoogleProfileNameFields,
} from './googleProfileMetadata';
export {
  ZenformedGoogleSignInButton,
  ZenformedAuthMethodDivider,
  type ZenformedGoogleSignInButtonProps,
  type ZenformedGoogleSignInHandler,
  type ZenformedAuthMethodDividerProps,
} from './ZenformedGoogleSignInButton';
export {
  useZenformedPasswordRecoveryStatus,
  type PasswordRecoveryStatus,
} from './useZenformedPasswordRecoveryStatus';
export {
  resolveAuthRedirectUrl,
  resolveAppOrigin,
  type ResolveAuthRedirectUrlInput,
} from './resolveAuthRedirectUrl';
export {
  requestPasswordResetEmail,
  type RequestPasswordResetInput,
  type RequestPasswordResetResult,
} from './requestPasswordResetEmail';
export {
  updateRecoveredPassword,
  type UpdateRecoveredPasswordInput,
  type UpdateRecoveredPasswordResult,
} from './updateRecoveredPassword';
export { default as authFormStyles } from './authForm.module.css';
