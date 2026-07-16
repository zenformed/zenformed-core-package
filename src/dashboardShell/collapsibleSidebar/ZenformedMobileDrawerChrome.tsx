'use client';

import { useCallback, type ReactElement } from 'react';
import { getUserInitials, userCircleColor } from '../accountMenuUtils';
import { ZenformedNotificationsMenu } from '../notifications/ZenformedNotificationsMenu';
import { ZenformedSidebarActionRow } from './ZenformedSidebarActionRow';
import { ZenformedSidebarSections } from './ZenformedSidebarSections';
import { resolveSidebarSectionLabelText, type ZenformedCollapsibleSidebarShellProps } from './types';
import styles from './collapsibleSidebar.module.css';

/**
 * Facebook-style mobile drawer content.
 * Three regions: identity (shrink 0) → scrollable nav (flex 1) → Sign Out (shrink 0).
 * Desktop rail chrome is a separate tree — only one mounts at a time (single notifications poller).
 */
export function ZenformedMobileDrawerChrome({
  props,
  onNavigate,
  onNotificationsOpenChange,
}: {
  props: ZenformedCollapsibleSidebarShellProps;
  onNavigate?: () => void;
  onNotificationsOpenChange?: (open: boolean) => void;
}): ReactElement {
  const {
    appsSwitcher,
    organizationName,
    sections = [],
    notifications,
    themeControl,
    themeLabel = 'Light/Dark Mode',
    settings,
    account,
    notificationsLabel = 'Notifications',
    otherSectionLabel = 'Other',
  } = props;

  const org = organizationName?.trim() || null;
  const otherLabel = resolveSidebarSectionLabelText({
    label: otherSectionLabel,
    expanded: true,
  });

  const accountName = account?.userDisplayName?.trim() || account?.user.email?.trim() || '';
  const accountEmail = (account?.userEmail ?? account?.user.email)?.trim() || '';
  const showAccountEmail =
    Boolean(accountEmail) && accountEmail.toLowerCase() !== accountName.toLowerCase();

  const closeAnd = useCallback(
    (fn?: () => void) => {
      fn?.();
      onNavigate?.();
    },
    [onNavigate]
  );

  return (
    <div
      className={styles.mobileDrawerInner}
      data-zenformed-sidebar-expanded="true"
      data-zenformed-mobile-drawer="true"
    >
      <div className={styles.mobileDrawerIdentity}>
        {account ? (
          <div
            className={styles.mobileUserBar}
            data-zenformed-mobile-user-bar
            // Reserved for a future profile destination; no click for now.
          >
            <span className={styles.mobileUserAvatar} aria-hidden>
              {account.profilePhotoChangeEnabled && account.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={account.avatarUrl} alt="" className={styles.mobileUserAvatarImg} />
              ) : (
                <span
                  className={styles.mobileUserAvatarFallback}
                  style={{
                    backgroundColor: account.avatarLoading
                      ? 'var(--color-muted, #f1f5f9)'
                      : userCircleColor(account.user.email),
                  }}
                >
                  {!account.avatarLoading
                    ? getUserInitials(account.user, account.userDisplayName)
                    : null}
                </span>
              )}
            </span>
            <span className={styles.mobileUserText}>
              <span className={styles.mobileUserName} title={accountName}>
                {accountName}
              </span>
              {showAccountEmail ? (
                <span className={styles.mobileUserEmail} title={accountEmail}>
                  {accountEmail}
                </span>
              ) : null}
            </span>
          </div>
        ) : null}

        <div className={styles.mobileAppsSlot}>{appsSwitcher}</div>

        {org ? (
          <>
            <p className={styles.mobileOrgName} title={org}>
              {org}
            </p>
            <div className={styles.mobileOrgSeparator} aria-hidden />
          </>
        ) : null}
      </div>

      <div className={styles.mobileDrawerScroll}>
        <ZenformedSidebarSections
          sections={sections}
          expanded
          onNavigate={onNavigate}
        />

        <div className={styles.mobileOther}>
          {otherLabel ? (
            <div className={`${styles.sectionLabel} ${styles.otherLabel}`} role="presentation">
              <span>{otherLabel}</span>
            </div>
          ) : null}

          {notifications && notifications.organizationId.trim() ? (
            <div className={`${styles.actionRow} ${styles.notificationsSlot} ${styles.mobileHitRow}`}>
              <ZenformedNotificationsMenu
                {...notifications}
                sidebarLabel={notificationsLabel}
                onNavigate={(destinationUrl) => {
                  notifications.onNavigate(destinationUrl);
                  onNavigate?.();
                }}
                onOpenChange={onNotificationsOpenChange}
              />
            </div>
          ) : null}

          <div className={`${styles.actionRow} ${styles.mobileHitRow} ${styles.mobileThemeRow}`}>
            <span className={styles.themeControlWrap}>{themeControl}</span>
            <span className={styles.actionLabel} title={themeLabel}>
              {themeLabel}
            </span>
          </div>

          {settings ? (
            <ZenformedSidebarActionRow
              asButton
              showLabel
              label={settings.label}
              title={settings.title ?? settings.label}
              icon={settings.icon}
              onClick={() => closeAnd(settings.onSelect)}
            />
          ) : null}
        </div>
      </div>

      {account ? (
        <div className={styles.mobileDrawerFooter}>
          <button
            type="button"
            className={styles.mobileSignOut}
            onClick={() => closeAnd(account.onRequestSignOutConfirm)}
          >
            {account.signOutIcon}
            <span>{account.labels.signOutButtonLabel}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
