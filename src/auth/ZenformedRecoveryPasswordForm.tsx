'use client';

import { useState, type FormEvent, type ReactElement } from 'react';
import { resolveAuthLabels, type ZenformedAuthLabels } from './authLabels';
import { ZenformedAuthNavLink } from './ZenformedAuthNavLink';
import { ZenformedAuthPageLinks } from './ZenformedAuthPageLinks';
import formStyles from './authForm.module.css';

export type UpdateRecoveredPasswordHandler = (
  password: string
) => Promise<{ readonly ok: true } | { readonly ok: false; readonly error: string }>;

export type ZenformedRecoveryPasswordFormProps = {
  readonly onUpdatePassword: UpdateRecoveredPasswordHandler;
  readonly labels?: Partial<ZenformedAuthLabels> | null;
  readonly loginHref?: string | null;
};

export function ZenformedRecoveryPasswordForm({
  onUpdatePassword,
  labels,
  loginHref,
}: ZenformedRecoveryPasswordFormProps): ReactElement {
  const resolvedLabels = resolveAuthLabels(labels);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const result = await onUpdatePassword(password);
      if (result.ok) {
        setSuccess(true);
        return;
      }
      setError(result.error);
    } catch {
      setError('Unable to update password. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <>
        <p className={formStyles.success} role="status">
          {resolvedLabels.resetPasswordSuccess}
        </p>
        {loginHref ? (
          <ZenformedAuthPageLinks align="center">
            <ZenformedAuthNavLink href={loginHref}>{resolvedLabels.backToSignIn}</ZenformedAuthNavLink>
          </ZenformedAuthPageLinks>
        ) : null}
      </>
    );
  }

  return (
    <>
      <p className={formStyles.hint}>{resolvedLabels.resetPasswordInstructions}</p>
      <form onSubmit={(event) => void handleSubmit(event)} className={formStyles.form}>
        <label htmlFor="zenformed-recovery-password-new" className={formStyles.label}>
          {resolvedLabels.newPasswordLabel}
        </label>
        <input
          id="zenformed-recovery-password-new"
          name="new-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className={formStyles.input}
          disabled={submitting}
        />
        <label htmlFor="zenformed-recovery-password-confirm" className={formStyles.label}>
          {resolvedLabels.confirmPasswordLabel}
        </label>
        <input
          id="zenformed-recovery-password-confirm"
          name="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className={formStyles.input}
          disabled={submitting}
        />
        {error ? (
          <p className={formStyles.error} role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className={`${formStyles.submitButton} ${formStyles.submit}`}
          disabled={submitting}
        >
          {submitting ? resolvedLabels.updatingPassword : resolvedLabels.updatePassword}
        </button>
      </form>
      {loginHref ? (
        <ZenformedAuthPageLinks align="center">
          <ZenformedAuthNavLink href={loginHref}>{resolvedLabels.backToSignIn}</ZenformedAuthNavLink>
        </ZenformedAuthPageLinks>
      ) : null}
    </>
  );
}
