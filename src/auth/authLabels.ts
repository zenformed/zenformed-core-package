export const DEFAULT_AUTH_LABELS = {
  forgotPassword: 'Forgot password?',
  forgotPasswordTitle: 'Reset password',
  forgotPasswordNotWiredYet:
    'Password reset email is not wired yet. You will be able to request a reset link from this page soon.',
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
