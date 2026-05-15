'use client';

import type { ReactElement } from 'react';
import { ZenformedAccountMenu } from './ZenformedAccountMenu';
import { useAccountMenuState } from './useAccountMenuState';
import type { ZenformedDashboardHeaderProps } from './types';

export function ZenformedDashboardHeader({
  classNames,
  user,
  avatarUrl,
  avatarLoading,
  shopName,
  defaultShopNameFallback,
  effectiveLicenseTier,
  isAdmin,
  labels,
  themeToggle,
  onOpenSettings,
  onRequestSignOutConfirm,
  onRequestProfilePhotoModal,
  centerSlot,
  leftSlot,
  settingsIcon,
  signOutIcon,
  profilePhotoCameraIcon,
}: ZenformedDashboardHeaderProps): ReactElement {
  const { accountMenuOpen, setAccountMenuOpen, accountMenuRef, closeAccountMenu } = useAccountMenuState();

  return (
    <header className={classNames.header}>
      {leftSlot ?? <div className={classNames.headerLeft} aria-hidden />}
      {centerSlot}
      {user ? (
        <div className={classNames.headerRight}>
          <div className={classNames.headerRightUserBlock}>
            <div className={classNames.headerUserEmail}>{user.email}</div>
            <div className={classNames.badgeRow}>
              {effectiveLicenseTier && (
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
              )}
              {isAdmin && <span className={classNames.adminBadge}>{labels.adminBadgeLabel}</span>}
            </div>
          </div>
          {themeToggle}
          <ZenformedAccountMenu
            classNames={classNames}
            user={user}
            avatarUrl={avatarUrl}
            avatarLoading={avatarLoading}
            shopName={shopName}
            defaultShopNameFallback={defaultShopNameFallback}
            isAdmin={isAdmin}
            labels={labels}
            onOpenSettings={onOpenSettings}
            onRequestSignOutConfirm={onRequestSignOutConfirm}
            onRequestProfilePhotoModal={onRequestProfilePhotoModal}
            settingsIcon={settingsIcon}
            signOutIcon={signOutIcon}
            profilePhotoCameraIcon={profilePhotoCameraIcon}
            accountMenuOpen={accountMenuOpen}
            setAccountMenuOpen={setAccountMenuOpen}
            accountMenuRef={accountMenuRef}
            closeAccountMenu={closeAccountMenu}
          />
        </div>
      ) : null}
    </header>
  );
}
