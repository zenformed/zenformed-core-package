'use client';

import type { ReactElement } from 'react';
import { ZenformedAccountMenu } from './ZenformedAccountMenu';
import { useAccountMenuState } from './useAccountMenuState';
import { useZenformedShellUserDisplay } from './useZenformedShellUserDisplay';
import { ZenformedNotificationsMenu } from './notifications/ZenformedNotificationsMenu';
import type { ZenformedDashboardHeaderProps } from './types';

export function ZenformedDashboardHeader({
  classNames,
  user,
  avatarUrl,
  avatarLoading,
  effectiveLicenseTier,
  organizationRoleLabel,
  labels,
  themeToggle,
  onOpenSettings,
  onRequestSignOutConfirm,
  onRequestProfilePhotoModal,
  profilePhotoChangeEnabled = false,
  centerSlot,
  leftSlot,
  notifications,
  settingsIcon,
  signOutIcon,
  profilePhotoCameraIcon,
  settingsApiUrl,
  getAccessToken,
  sessionUserId,
}: ZenformedDashboardHeaderProps): ReactElement {
  const { accountMenuOpen, setAccountMenuOpen, accountMenuRef, closeAccountMenu } = useAccountMenuState();

  const userDisplayName = useZenformedShellUserDisplay({
    settingsApiUrl: settingsApiUrl ?? '/api/internal/users-me-settings',
    getAccessToken: getAccessToken ?? (() => null),
    sessionUserId: sessionUserId ?? null,
    user,
    enabled: Boolean(user && settingsApiUrl && getAccessToken && sessionUserId),
  });

  return (
    <header className={classNames.header} data-zenformed-dashboard-header>
      <div
        className={classNames.headerLeft}
        data-zenformed-header-left
        aria-hidden={leftSlot == null ? true : undefined}
      >
        {leftSlot}
      </div>
      {centerSlot}
      {user ? (
        <div className={classNames.headerRight} data-zenformed-header-right>
          {themeToggle}
          {notifications && notifications.organizationId.trim() ? (
            <ZenformedNotificationsMenu
              organizationId={notifications.organizationId}
              api={notifications.api}
              notificationsPageHref={notifications.notificationsPageHref}
              onNavigate={notifications.onNavigate}
              unreadPollIntervalMs={notifications.unreadPollIntervalMs}
            />
          ) : null}
          <ZenformedAccountMenu
            classNames={classNames}
            user={user}
            userDisplayName={userDisplayName}
            avatarUrl={avatarUrl}
            avatarLoading={avatarLoading}
            effectiveLicenseTier={effectiveLicenseTier}
            organizationRoleLabel={organizationRoleLabel}
            labels={labels}
            onOpenSettings={onOpenSettings}
            onRequestSignOutConfirm={onRequestSignOutConfirm}
            onRequestProfilePhotoModal={onRequestProfilePhotoModal}
            profilePhotoChangeEnabled={profilePhotoChangeEnabled}
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
