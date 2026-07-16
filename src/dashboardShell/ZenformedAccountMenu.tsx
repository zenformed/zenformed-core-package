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
  variant = 'default',
  settingsIcon,
  signOutIcon,
  profilePhotoCameraIcon,
  accountMenuOpen,
  setAccountMenuOpen,
  accountMenuRef,
  closeAccountMenu,
}: ZenformedAccountMenuProps): ReactElement {
  const displayAvatarUrl = profilePhotoChangeEnabled ? avatarUrl : null;
  const email = user.email?.trim() || '';
  const nameLine = userDisplayName.trim() || email;
  const showEmailUnderName = Boolean(email) && email.toLowerCase() !== nameLine.toLowerCase();
  const isSidebar = variant === 'sidebar';

  const avatarNode = displayAvatarUrl ? (
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
      {!avatarLoading ? getUserInitials(user, nameLine) : null}
    </div>
  );

  const dropdownAvatar = displayAvatarUrl ? (
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
      {!avatarLoading ? getUserInitials(user, nameLine) : null}
    </div>
  );

  return (
    <div
      className={classNames.accountMenuWrap}
      ref={accountMenuRef}
      data-zenformed-account-menu-variant={variant}
    >
      <button
        type="button"
        className={classNames.accountMenuTrigger}
        onClick={() => setAccountMenuOpen((o) => !o)}
        aria-label={labels.menuTriggerAriaLabel}
        aria-expanded={accountMenuOpen}
        aria-haspopup="true"
      >
        {avatarNode}
      </button>
      {accountMenuOpen ? (
        <div className={classNames.accountMenuDropdown} role="menu">
          {isSidebar ? (
            <>
              <div className={classNames.accountMenuSidebarHeader}>
                <div className={classNames.accountMenuPhotoWrap}>
                  <div className={classNames.accountMenuPhotoCircle}>{dropdownAvatar}</div>
                </div>
                <div className={classNames.accountMenuSidebarIdentity}>
                  <div className={classNames.accountMenuShopName}>{nameLine}</div>
                  {showEmailUnderName ? (
                    <div className={classNames.accountMenuEmail}>{email}</div>
                  ) : null}
                </div>
              </div>
              <div className={classNames.accountMenuSidebarDivider} aria-hidden />
            </>
          ) : (
            <>
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
                  {dropdownAvatar}
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
              {nameLine ? (
                <div className={classNames.accountMenuShopName}>{nameLine}</div>
              ) : null}
              {showEmailUnderName ? (
                <div className={classNames.accountMenuEmail}>{email}</div>
              ) : null}
            </>
          )}
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
            {signOutIcon ?? (
              <ZenformedAccountMenuSignOutIcon className={classNames.accountMenuBtnIcon} />
            )}
            {labels.signOutButtonLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
