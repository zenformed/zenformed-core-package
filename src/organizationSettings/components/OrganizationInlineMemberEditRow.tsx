'use client';

import { useEffect, useState } from 'react';
import type {
  OrganizationSettingsClassNames,
  OrganizationSettingsLabels,
  OrganizationSettingsMember,
} from '../types';
import type { OrganizationMemberProfileUpdatePayload } from '../organizationWorkspaceTypes';

type Props = {
  readonly member: OrganizationSettingsMember;
  readonly labels: OrganizationSettingsLabels;
  readonly classNames: OrganizationSettingsClassNames;
  readonly isSubmitting?: boolean;
  readonly errorMessage?: string | null;
  readonly onSubmit: (payload: OrganizationMemberProfileUpdatePayload) => Promise<boolean>;
  readonly onCancel: () => void;
};

function resolveInitialFirstName(member: OrganizationSettingsMember): string {
  if (member.firstName != null && member.firstName.trim()) return member.firstName.trim();
  const display = member.displayName?.trim() || member.name.trim();
  const parts = display.split(/\s+/).filter(Boolean);
  return parts[0] ?? '';
}

function resolveInitialLastName(member: OrganizationSettingsMember): string {
  if (member.lastName != null && member.lastName.trim()) return member.lastName.trim();
  const display = member.displayName?.trim() || member.name.trim();
  const parts = display.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return '';
  return parts.slice(1).join(' ');
}

function resolveInitialEmail(member: OrganizationSettingsMember): string {
  if (member.email != null && member.email.trim()) return member.email.trim();
  const match = /\(([^)]+@[^)]+)\)/.exec(member.name);
  return match?.[1]?.trim() ?? '';
}

export function OrganizationInlineMemberEditRow({
  member,
  labels,
  classNames,
  isSubmitting = false,
  errorMessage,
  onSubmit,
  onCancel,
}: Props) {
  const [firstName, setFirstName] = useState(() => resolveInitialFirstName(member));
  const [lastName, setLastName] = useState(() => resolveInitialLastName(member));
  const [email, setEmail] = useState(() => resolveInitialEmail(member));

  useEffect(() => {
    setFirstName(resolveInitialFirstName(member));
    setLastName(resolveInitialLastName(member));
    setEmail(resolveInitialEmail(member));
  }, [member]);

  const canSubmit = email.trim().length > 0 && !isSubmitting;

  return (
    <div className={classNames.memberEditPanel}>
      <div className={classNames.field}>
        <label className={classNames.fieldLabel} htmlFor={`member-edit-first-${member.id}`}>
          {labels.firstName}
        </label>
        <input
          id={`member-edit-first-${member.id}`}
          className={classNames.input}
          value={firstName}
          disabled={isSubmitting}
          autoComplete="given-name"
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>
      <div className={classNames.field}>
        <label className={classNames.fieldLabel} htmlFor={`member-edit-last-${member.id}`}>
          {labels.lastName}
        </label>
        <input
          id={`member-edit-last-${member.id}`}
          className={classNames.input}
          value={lastName}
          disabled={isSubmitting}
          autoComplete="family-name"
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <div className={classNames.field}>
        <label className={classNames.fieldLabel} htmlFor={`member-edit-email-${member.id}`}>
          {labels.email}
        </label>
        <input
          id={`member-edit-email-${member.id}`}
          className={classNames.input}
          type="email"
          value={email}
          disabled={isSubmitting}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {errorMessage ? (
        <p className={`${classNames.saveStatus} ${classNames.saveStatusError}`}>{errorMessage}</p>
      ) : null}
      <div className={classNames.actions}>
        <button
          type="button"
          className={`${classNames.btn} ${classNames.btnPrimary} ${classNames.btnSmall}`}
          disabled={!canSubmit}
          onClick={() =>
            void onSubmit({
              firstName: firstName.trim() || null,
              lastName: lastName.trim() || null,
              email: email.trim(),
            })
          }
        >
          {isSubmitting ? labels.saving : labels.save}
        </button>
        <button
          type="button"
          className={`${classNames.btn} ${classNames.btnGhost} ${classNames.btnSmall}`}
          disabled={isSubmitting}
          onClick={onCancel}
        >
          {labels.cancel}
        </button>
      </div>
    </div>
  );
}
