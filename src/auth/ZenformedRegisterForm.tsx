'use client';

import { useState, type FormEvent, type ReactElement } from 'react';
import { resolveAuthLabels, type ZenformedAuthLabels } from './authLabels';
import formStyles from './authForm.module.css';

const MIN_PASSWORD_LENGTH = 8;

export type ZenformedRegisterSubmitInput = {
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
  readonly firstName?: string;
  readonly lastName?: string;
};

export type ZenformedRegisterSubmitHandler = (
  input: ZenformedRegisterSubmitInput
) => Promise<void>;

export type ZenformedRegisterFormProps = {
  readonly onSubmit: ZenformedRegisterSubmitHandler;
  readonly labels?: Partial<ZenformedAuthLabels> | null;
  readonly error?: string | null;
  readonly initialEmail?: string;
  readonly emailReadOnly?: boolean;
  readonly collectName?: boolean;
  readonly initialFirstName?: string;
  readonly initialLastName?: string;
  readonly submitLabel?: string;
  readonly submittingLabel?: string;
};

export function ZenformedRegisterForm({
  onSubmit,
  labels,
  error,
  initialEmail = '',
  emailReadOnly = false,
  collectName = false,
  initialFirstName = '',
  initialLastName = '',
  submitLabel,
  submittingLabel,
}: ZenformedRegisterFormProps): ReactElement {
  const resolvedLabels = resolveAuthLabels(labels);
  const [email, setEmail] = useState(initialEmail);
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setSubmitError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        email,
        password,
        confirmPassword,
        firstName: collectName ? firstName : undefined,
        lastName: collectName ? lastName : undefined,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not create account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className={formStyles.form}>
      <label htmlFor="zenformed-register-email" className={formStyles.label}>
        {resolvedLabels.emailLabel}
      </label>
      <input
        id="zenformed-register-email"
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
      {collectName ? (
        <>
          <label htmlFor="zenformed-register-first-name" className={formStyles.label}>
            {resolvedLabels.firstNameLabel}
          </label>
          <input
            id="zenformed-register-first-name"
            name="first-name"
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            autoComplete="given-name"
            className={formStyles.input}
            disabled={submitting}
          />
          <label htmlFor="zenformed-register-last-name" className={formStyles.label}>
            {resolvedLabels.lastNameLabel}
          </label>
          <input
            id="zenformed-register-last-name"
            name="last-name"
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            autoComplete="family-name"
            className={formStyles.input}
            disabled={submitting}
          />
        </>
      ) : null}
      <label htmlFor="zenformed-register-password" className={formStyles.label}>
        {resolvedLabels.newPasswordLabel}
      </label>
      <input
        id="zenformed-register-password"
        name="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        minLength={MIN_PASSWORD_LENGTH}
        autoComplete="new-password"
        className={formStyles.input}
        disabled={submitting}
      />
      <label htmlFor="zenformed-register-confirm-password" className={formStyles.label}>
        {resolvedLabels.confirmPasswordLabel}
      </label>
      <input
        id="zenformed-register-confirm-password"
        name="confirm-password"
        type="password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        required
        minLength={MIN_PASSWORD_LENGTH}
        autoComplete="new-password"
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
          ? (submittingLabel ?? resolvedLabels.creatingAccount)
          : (submitLabel ?? resolvedLabels.createAccount)}
      </button>
    </form>
  );
}
