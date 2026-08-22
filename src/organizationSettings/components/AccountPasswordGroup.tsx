'use client';

import { useEffect, useState } from 'react';
import { ZenformedAuthNavLink } from '../../auth/ZenformedAuthNavLink';
import { ZenformedSettingsGroup } from './ZenformedSettingsGroup';
import type { OrganizationSettingsClassNames, OrganizationSettingsLabels } from '../types';

type Props = {
  readonly labels: OrganizationSettingsLabels;
  readonly classNames: OrganizationSettingsClassNames;
  /** Remount / clear fields when the settings drawer opens (pass from parent when `open` is true). */
  readonly formKey?: string;
  readonly forgotPasswordHref?: string | null;
};

/**
 * Password fields are never loaded from profile/settings APIs.
 * Controlled state stays empty until the user types; remount clears browser autofill residue.
 */
export function AccountPasswordGroup({
  labels,
  classNames,
  formKey = 'default',
  forgotPasswordHref,
}: Props) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }, [formKey]);

  return (
    <ZenformedSettingsGroup title={labels.password} classNames={classNames} collapsible={false}>
      <p className={classNames.hint}>{labels.passwordChangeComingSoon}</p>
      <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
        <div className={classNames.field}>
          <label className={classNames.fieldLabel} htmlFor="zenformed-settings-old-password">
            {labels.oldPassword}
          </label>
          <input
            id="zenformed-settings-old-password"
            name="zenformed-settings-old-password"
            className={classNames.input}
            type="password"
            value={oldPassword}
            autoComplete="current-password"
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>
        <div className={classNames.field}>
          <label className={classNames.fieldLabel} htmlFor="zenformed-settings-new-password">
            {labels.newPassword}
          </label>
          <input
            id="zenformed-settings-new-password"
            name="zenformed-settings-new-password"
            className={classNames.input}
            type="password"
            value={newPassword}
            autoComplete="new-password"
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className={classNames.field}>
          <label
            className={classNames.fieldLabel}
            htmlFor="zenformed-settings-confirm-password"
          >
            {labels.confirmPassword}
          </label>
          <input
            id="zenformed-settings-confirm-password"
            name="zenformed-settings-confirm-password"
            className={classNames.input}
            type="password"
            value={confirmPassword}
            autoComplete="new-password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </form>
      <div className={classNames.actions}>
        {forgotPasswordHref ? (
          <ZenformedAuthNavLink
            href={forgotPasswordHref}
            appearance="button"
            className={`${classNames.btn} ${classNames.btnGhost}`}
          >
            {labels.resetPassword}
          </ZenformedAuthNavLink>
        ) : null}
        <button type="button" className={`${classNames.btn} ${classNames.btnPrimary}`} disabled>
          {labels.savePassword}
        </button>
      </div>
    </ZenformedSettingsGroup>
  );
}
