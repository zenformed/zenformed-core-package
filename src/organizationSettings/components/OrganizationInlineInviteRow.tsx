'use client';

import { useState } from 'react';
import type {
  OrganizationSettingsClassNames,
  OrganizationSettingsLabels,
} from '../types';
import type { OrganizationInviteCreatePayload } from '../organizationWorkspaceTypes';

type Props = {
  readonly labels: OrganizationSettingsLabels;
  readonly classNames: OrganizationSettingsClassNames;
  readonly isSubmitting?: boolean;
  readonly errorMessage?: string | null;
  readonly onSubmit: (payload: OrganizationInviteCreatePayload) => Promise<boolean>;
  readonly onCancel: () => void;
};

const INVITE_ROLE_OPTIONS = [
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
] as const;

export function OrganizationInlineInviteRow({
  labels,
  classNames,
  isSubmitting = false,
  errorMessage,
  onSubmit,
  onCancel,
}: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');

  const canSubmit = email.trim().length > 0 && !isSubmitting;

  return (
    <div className={classNames.row}>
      <div className={classNames.field}>
        <label className={classNames.fieldLabel} htmlFor="org-invite-first-name">
          {labels.firstName}
        </label>
        <input
          id="org-invite-first-name"
          className={classNames.input}
          value={firstName}
          disabled={isSubmitting}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>
      <div className={classNames.field}>
        <label className={classNames.fieldLabel} htmlFor="org-invite-last-name">
          {labels.lastName}
        </label>
        <input
          id="org-invite-last-name"
          className={classNames.input}
          value={lastName}
          disabled={isSubmitting}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <div className={classNames.field}>
        <label className={classNames.fieldLabel} htmlFor="org-invite-email">
          {labels.email}
        </label>
        <input
          id="org-invite-email"
          type="email"
          className={classNames.input}
          value={email}
          disabled={isSubmitting}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className={classNames.field}>
        <label className={classNames.fieldLabel} htmlFor="org-invite-role">
          {labels.role}
        </label>
        <select
          id="org-invite-role"
          className={classNames.select}
          value={role}
          disabled={isSubmitting}
          onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
        >
          {INVITE_ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {errorMessage ? (
        <p className={`${classNames.saveStatus} ${classNames.saveStatusMuted}`}>{errorMessage}</p>
      ) : null}
      <div className={classNames.actions}>
        <button
          type="button"
          className={`${classNames.btn} ${classNames.btnPrimary}`}
          disabled={!canSubmit}
          onClick={() => {
            void onSubmit({
              email: email.trim(),
              firstName: firstName.trim() || null,
              lastName: lastName.trim() || null,
              role,
            });
          }}
        >
          {isSubmitting ? labels.saving : labels.sendInvite}
        </button>
        <button
          type="button"
          className={`${classNames.btn} ${classNames.btnGhost}`}
          disabled={isSubmitting}
          onClick={onCancel}
        >
          {labels.cancel}
        </button>
      </div>
    </div>
  );
}
