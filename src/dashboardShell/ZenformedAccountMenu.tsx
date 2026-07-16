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
  effectiveLicenseTier: _effectiveLicenseTier,
  organizationRoleLabel,
  labels,
  onOpenSettings,
  onRequestSignOutConfirm,
  onRequestProfilePhotoModal,
  profilePhotoChangeEnabled = false,
  showSettingsButton = true,
  settingsIcon,
  signOutIcon,
  profilePhotoCameraIcon,
  accountMenuOpen,
  setAccountMenuOpen,
  accountMenuRef,
  closeAccountMenu,
}: ZenformedAccountMenuProps): ReactElement {
  const displayAvatarUrl = profilePhotoChangeEnabled ? avatarUrl : null;

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
        {displayAvatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={displayAvatarUrl} alt="" className={classNames.accountMenuTriggerImg} />
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
            {!avatarLoading ? getUserInitials(user, userDisplayName) : null}
          </div>
        )}
      </button>
      {accountMenuOpen && (
        <div className={classNames.accountMenuDropdown} role="menu">
          {organizationRoleLabel ? (
            <div className={classNames.badgeRow}>
              <span
                className={classNames.adminBadge}
                aria-label={`${labels.roleAriaLabelPrefix ?? 'Role:'} ${organizationRoleLabel}`}
              >
                {organizationRoleLabel}
              </span>
            </div>
          ) : null}
          <div className={classNames.accountMenuPhotoWrap}>
            <div className={classNames.accountMenuPhotoCircle}>
              {displayAvatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={displayAvatarUrl} alt="" className={classNames.accountMenuPhotoImg} aria-hidden />
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
                  {!avatarLoading ? getUserInitials(user, userDisplayName) : null}
                </div>
              )}
            </div>
            {profilePhotoChangeEnabled ? (
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
            ) : null}
          </div>
          {userDisplayName ? (
            <div className={classNames.accountMenuShopName}>{userDisplayName}</div>
          ) : null}
          {showSettingsButton ? (
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
          ) : null}
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
