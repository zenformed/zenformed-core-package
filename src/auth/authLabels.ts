export const DEFAULT_AUTH_LABELS = {
  forgotPassword: 'Forgot password?',
  forgotPasswordTitle: 'Reset password',
  forgotPasswordInstructions:
    'Enter your email address and we will send you a link to reset your password.',
  emailLabel: 'Email',
  sendResetLink: 'Send reset link',
  sendingResetLink: 'Sending…',
  forgotPasswordSuccess:
    'If an account exists for this email, a password reset link has been sent.',
  forgotPasswordError: 'Unable to send reset email. Try again later.',
  resetPasswordTitle: 'Choose a new password',
  resetPasswordInstructions: 'Enter a new password for your account.',
  newPasswordLabel: 'New password',
  confirmPasswordLabel: 'Confirm password',
  updatePassword: 'Update password',
  updatingPassword: 'Updating…',
  resetPasswordSuccess: 'Your password has been updated. You can sign in with your new password.',
  resetPasswordInvalidLink:
    'This reset link is invalid or has expired. Request a new password reset email.',
  backToSignIn: 'Back to sign in',
} as const;

export type ZenformedAuthLabels = {
  readonly [K in keyof typeof DEFAULT_AUTH_LABELS]: string;
};

export function resolveAuthLabels(
  overrides?: Partial<ZenformedAuthLabels> | null
): ZenformedAuthLabels {
  return { ...DEFAULT_AUTH_LABELS, ...overrides };
}
