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
