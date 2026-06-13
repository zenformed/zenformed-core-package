'use client';

import { useState, type FormEvent, type ReactElement } from 'react';
import { resolveAuthLabels, type ZenformedAuthLabels } from './authLabels';
import formStyles from './authForm.module.css';

export type ZenformedLoginSubmitHandler = (email: string, password: string) => Promise<void>;

export type ZenformedLoginFormProps = {
  readonly onSubmit: ZenformedLoginSubmitHandler;
  readonly labels?: Partial<ZenformedAuthLabels> | null;
  readonly error?: string | null;
  readonly initialEmail?: string;
  readonly emailReadOnly?: boolean;
  readonly submitLabel?: string;
  readonly submittingLabel?: string;
};

export function ZenformedLoginForm({
  onSubmit,
  labels,
  error,
  initialEmail = '',
  emailReadOnly = false,
  submitLabel,
  submittingLabel,
}: ZenformedLoginFormProps): ReactElement {
  const resolvedLabels = resolveAuthLabels(labels);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      await onSubmit(email, password);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className={formStyles.form}>
      <label htmlFor="zenformed-login-email" className={formStyles.label}>
        {resolvedLabels.emailLabel}
      </label>
      <input
        id="zenformed-login-email"
        name="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        readOnly={emailReadOnly}
        autoComplete="email"
        className={emailReadOnly ? formStyles.inputReadOnly : formStyles.input}
        disabled={submitting}
      />
      <label htmlFor="zenformed-login-password" className={formStyles.label}>
        {resolvedLabels.passwordLabel}
      </label>
      <input
        id="zenformed-login-password"
        name="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        autoComplete="current-password"
        className={formStyles.input}
        disabled={submitting}
      />
      {error ?? submitError ? (
        <p className={formStyles.error} role="alert">
          {error ?? submitError}
        </p>
      ) : null}
      <button
        type="submit"
        className={`${formStyles.submitButton} ${formStyles.submit}`}
        disabled={submitting}
      >
        {submitting
          ? (submittingLabel ?? resolvedLabels.signingIn)
          : (submitLabel ?? resolvedLabels.signIn)}
      </button>
    </form>
  );
}
