'use client';

import { useState, type FormEvent, type ReactElement } from 'react';
import { resolveAuthLabels, type ZenformedAuthLabels } from './authLabels';
import { ZenformedAuthNavLink } from './ZenformedAuthNavLink';
import { ZenformedAuthPageLinks } from './ZenformedAuthPageLinks';
import formStyles from './authForm.module.css';

export type RequestPasswordResetHandler = (
  email: string
) => Promise<{ readonly ok: true } | { readonly ok: false; readonly error: string }>;

export type ZenformedForgotPasswordFormProps = {
  readonly onRequestReset: RequestPasswordResetHandler;
  readonly labels?: Partial<ZenformedAuthLabels> | null;
  readonly loginHref?: string | null;
  readonly initialEmail?: string;
};

export function ZenformedForgotPasswordForm({
  onRequestReset,
  labels,
  loginHref,
  initialEmail = '',
}: ZenformedForgotPasswordFormProps): ReactElement {
  const resolvedLabels = resolveAuthLabels(labels);
  const [email, setEmail] = useState(initialEmail);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await onRequestReset(email);
      if (result.ok) {
        setSuccess(true);
        return;
      }
      setError(result.error || resolvedLabels.forgotPasswordError);
    } catch {
      setError(resolvedLabels.forgotPasswordError);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <>
        <p className={formStyles.success} role="status">
          {resolvedLabels.forgotPasswordSuccess}
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
      <p className={formStyles.hint}>{resolvedLabels.forgotPasswordInstructions}</p>
      <form onSubmit={(event) => void handleSubmit(event)} className={formStyles.form}>
        <label htmlFor="zenformed-forgot-password-email" className={formStyles.label}>
          {resolvedLabels.emailLabel}
        </label>
        <input
          id="zenformed-forgot-password-email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
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
          {submitting ? resolvedLabels.sendingResetLink : resolvedLabels.sendResetLink}
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
