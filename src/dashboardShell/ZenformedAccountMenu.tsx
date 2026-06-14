'use client';

import type { ReactElement } from 'react';
import { getUserInitials, userCircleColor } from './accountMenuUtils';
import type { ZenformedAccountMenuProps } from './types';
import {
  ZenformedAccountMenuCameraIcon,
  ZenformedAccountMenuSettingsIcon,
  ZenformedAccountMenuSignOutIcon,
} from './ZenformedAccountMenuIcons';

export function ZenformedAccountMenu({
  classNames,
  user,
  userDisplayName,
  avatarUrl,
  avatarLoading,
  effectiveLicenseTier,
  organizationRoleLabel,
  labels,
  onOpenSettings,
  onRequestSignOutConfirm,
  onRequestProfilePhotoModal,
  settingsIcon,
  signOutIcon,
  profilePhotoCameraIcon,
  accountMenuOpen,
  setAccountMenuOpen,
  accountMenuRef,
  closeAccountMenu,
}: ZenformedAccountMenuProps): ReactElement {
  return (
    <div className={classNames.accountMenuWrap} ref={accountMenuRef}>
      <button
        type="button"
        className={classNames.accountMenuTrigger}
        onClick={() => setAccountMenuOpen((o) => !o)}
        aria-label={labels.menuTriggerAriaLabel}
        aria-expanded={accountMenuOpen}
        aria-haspopup="true"
      >
        {avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={avatarUrl} alt="" className={classNames.accountMenuTriggerImg} />
        ) : (
          <div
            className={classNames.accountMenuTriggerAvatar}
            style={{
              backgroundColor: avatarLoading
                ? 'var(--color-muted, #f1f5f9)'
                : userCircleColor(user.email),
            }}
            aria-hidden
          >
            {!avatarLoading ? getUserInitials(user.email) : null}
          </div>
        )}
      </button>
      {accountMenuOpen && (
        <div className={classNames.accountMenuDropdown} role="menu">
          <div className={classNames.accountMenuEmail}>{user.email}</div>
          {(effectiveLicenseTier || organizationRoleLabel) && (
            <div className={classNames.badgeRow}>
              {effectiveLicenseTier ? (
                <span
                  className={
                    effectiveLicenseTier === 'PRO'
                      ? `${classNames.tierBadge} ${classNames.tierBadgePro}`
                      : `${classNames.tierBadge} ${classNames.tierBadgeStandard}`
                  }
                  aria-label={`${labels.planAriaLabelPrefix} ${effectiveLicenseTier}`}
                >
                  {effectiveLicenseTier}
                </span>
              ) : null}
              {organizationRoleLabel ? (
                <span
                  className={classNames.adminBadge}
                  aria-label={`${labels.roleAriaLabelPrefix ?? 'Role:'} ${organizationRoleLabel}`}
                >
                  {organizationRoleLabel}
                </span>
              ) : null}
            </div>
          )}
          <div className={classNames.accountMenuPhotoWrap}>
            <div className={classNames.accountMenuPhotoCircle}>
              {avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={avatarUrl} alt="" className={classNames.accountMenuPhotoImg} aria-hidden />
              ) : (
                <div
                  className={classNames.accountMenuAvatar}
                  style={{
                    backgroundColor: avatarLoading
                      ? 'var(--color-muted, #f1f5f9)'
                      : userCircleColor(user.email),
                  }}
                  aria-hidden
                >
                  {!avatarLoading ? getUserInitials(user.email) : null}
                </div>
              )}
            </div>
            <button
              type="button"
              className={classNames.accountMenuPhotoCameraBtn}
              onClick={() => {
                closeAccountMenu();
                onRequestProfilePhotoModal();
              }}
              title={labels.profilePhotoChangeTitle}
              aria-label={labels.profilePhotoChangeAriaLabel}
            >
              {profilePhotoCameraIcon ?? <ZenformedAccountMenuCameraIcon />}
            </button>
          </div>
          {userDisplayName ? (
            <div className={classNames.accountMenuShopName}>{userDisplayName}</div>
          ) : null}
          <button
            type="button"
            className={classNames.accountMenuBtn}
            onClick={() => {
              closeAccountMenu();
              onOpenSettings();
            }}
          >
            {settingsIcon ?? (
              <ZenformedAccountMenuSettingsIcon className={classNames.accountMenuBtnIcon} />
            )}
            {labels.settingsButtonLabel}
          </button>
          <button
            type="button"
            className={classNames.accountMenuBtn}
            onClick={() => {
              closeAccountMenu();
              onRequestSignOutConfirm();
            }}
          >
            {signOutIcon ?? <ZenformedAccountMenuSignOutIcon className={classNames.accountMenuBtnIcon} />}
            {labels.signOutButtonLabel}
          </button>
        </div>
      )}
    </div>
  );
}
