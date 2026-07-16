'use client';

import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import { ZenformedAccountMenu } from '../ZenformedAccountMenu';
import { useAccountMenuState } from '../useAccountMenuState';
import { useZenformedMobileShellLayout } from '../useZenformedMobileShellLayout';
import { ZenformedNotificationsMenu } from '../notifications/ZenformedNotificationsMenu';
import { useZenformedSidebarExpandState } from './useZenformedSidebarExpandState';
import { ZenformedSidebarActionRow } from './ZenformedSidebarActionRow';
import {
  ZenformedSidebarMenuGlyph,
  ZenformedSidebarSections,
} from './ZenformedSidebarSections';
import { resolveSidebarSectionLabelText, type ZenformedCollapsibleSidebarShellProps } from './types';
import styles from './collapsibleSidebar.module.css';

function RailChrome({
  props,
  showLabels,
  onNavigate,
  onNotificationsOpenChange,
  onAccountOpenChange,
}: {
  props: ZenformedCollapsibleSidebarShellProps;
  showLabels: boolean;
  onNavigate?: () => void;
  onNotificationsOpenChange?: (open: boolean) => void;
  onAccountOpenChange?: (open: boolean) => void;
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
    otherSectionCollapsedLabel,
  } = props;

  const accountMenu = useAccountMenuState();
  useEffect(() => {
    onAccountOpenChange?.(accountMenu.accountMenuOpen);
  }, [accountMenu.accountMenuOpen, onAccountOpenChange]);

  const org = organizationName?.trim() || null;
  const otherLabel = resolveSidebarSectionLabelText({
    label: otherSectionLabel,
    collapsedLabel: otherSectionCollapsedLabel,
    expanded: showLabels,
  });

  return (
    <div
      className={styles.railInner}
      data-zenformed-sidebar-expanded={showLabels ? 'true' : 'false'}
    >
      <div className={styles.topBlock}>
        <div className={styles.appsSwitcherSlot}>{appsSwitcher}</div>
        {org ? (
          <>
            <p className={styles.orgName} title={org}>
              {org}
            </p>
            <div className={styles.orgSeparator} aria-hidden />
          </>
        ) : null}
      </div>

      <div className={styles.scrollRegion}>
        <ZenformedSidebarSections
          sections={sections}
          expanded={showLabels}
          onNavigate={onNavigate}
        />
      </div>

      <div className={styles.other}>
        {otherLabel ? (
          <div
            className={`${styles.sectionLabel} ${styles.otherLabel} ${
              showLabels ? '' : styles.sectionLabelCollapsed
            }`}
            role="presentation"
          >
            <span>{otherLabel}</span>
          </div>
        ) : null}

        {notifications && notifications.organizationId.trim() ? (
          <ZenformedSidebarActionRow
            showLabel={showLabels}
            label={notificationsLabel}
            icon={
              <ZenformedNotificationsMenu
                {...notifications}
                onOpenChange={onNotificationsOpenChange}
              />
            }
            className={styles.notificationsSlot}
          />
        ) : null}

        <ZenformedSidebarActionRow
          showLabel={showLabels}
          label={themeLabel}
          icon={<span className={styles.themeControlWrap}>{themeControl}</span>}
        />

        {settings ? (
          <ZenformedSidebarActionRow
            asButton
            showLabel={showLabels}
            label={settings.label}
            title={settings.title ?? settings.label}
            icon={settings.icon}
            onClick={() => {
              settings.onSelect();
              onNavigate?.();
            }}
          />
        ) : null}

        {account ? (
          <div className={`${styles.actionRow} ${styles.accountSlot}`}>
            <span className={styles.actionIcon}>
              <ZenformedAccountMenu
                classNames={account.classNames}
                user={account.user}
                userDisplayName={account.userDisplayName}
                avatarUrl={account.avatarUrl}
                avatarLoading={account.avatarLoading ?? false}
                organizationRoleLabel={account.organizationRoleLabel}
                labels={account.labels}
                onOpenSettings={() => {
                  account.onOpenSettings();
                  onNavigate?.();
                }}
                onRequestSignOutConfirm={account.onRequestSignOutConfirm}
                onRequestProfilePhotoModal={account.onRequestProfilePhotoModal}
                profilePhotoChangeEnabled={account.profilePhotoChangeEnabled}
                showSettingsButton={account.showSettingsButton ?? false}
                settingsIcon={account.settingsIcon}
                signOutIcon={account.signOutIcon}
                profilePhotoCameraIcon={account.profilePhotoCameraIcon}
                accountMenuOpen={accountMenu.accountMenuOpen}
                setAccountMenuOpen={accountMenu.setAccountMenuOpen}
                accountMenuRef={accountMenu.accountMenuRef}
                closeAccountMenu={accountMenu.closeAccountMenu}
              />
            </span>
            {showLabels ? (
              <span className={styles.accountText}>
                <span className={styles.accountName} title={account.userDisplayName}>
                  {account.userDisplayName}
                </span>
                {(() => {
                  const email = (account.userEmail ?? account.user.email)?.trim() || '';
                  if (!email) return null;
                  if (email.toLowerCase() === account.userDisplayName.trim().toLowerCase()) {
                    return null;
                  }
                  return (
                    <span className={styles.accountEmail} title={email}>
                      {email}
                    </span>
                  );
                })()}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Package-owned collapsible sidebar shell.
 * Collapsed gutter is permanently reserved; expanded rail overlays content (no reflow).
 * A single rail instance is used for desktop and mobile so notifications keep one poller.
 * Legacy `ZenformedDashboardHeader` remains exported for unmigrated hosts.
 */
export function ZenformedCollapsibleSidebarShell(
  props: ZenformedCollapsibleSidebarShellProps
): ReactElement {
  const {
    appName,
    children,
    holdExpanded = false,
    mobileMenuAriaLabel = 'Open navigation',
    sidebarAriaLabel = 'Application navigation',
  } = props;

  const isMobile = useZenformedMobileShellLayout();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const forceExpanded =
    holdExpanded || notificationsOpen || accountOpen || (isMobile && drawerOpen);
  const expand = useZenformedSidebarExpandState({
    forceExpanded,
    hoverEnabled: !isMobile,
  });

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    if (!isMobile) setDrawerOpen(false);
  }, [isMobile]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const showLabels = isMobile ? drawerOpen : expand.expanded;

  const railClass = useMemo(() => {
    const parts = [styles.rail];
    if (showLabels) parts.push(styles.railExpanded);
    if (isMobile && drawerOpen) parts.push(styles.railMobileOpen);
    if (isMobile && !drawerOpen) parts.push(styles.railMobileClosed);
    return parts.join(' ');
  }, [drawerOpen, isMobile, showLabels]);

  return (
    <div className={styles.shell} data-zenformed-collapsible-sidebar-shell>
      <div className={`${styles.gutter} ${isMobile ? styles.gutterMobile : ''}`}>
        {isMobile && drawerOpen ? (
          <button
            type="button"
            className={styles.backdrop}
            aria-label="Close navigation"
            onClick={closeDrawer}
          />
        ) : null}
        <aside
          className={railClass}
          aria-label={sidebarAriaLabel}
          data-expanded={showLabels ? 'true' : 'false'}
          onPointerEnter={expand.onRailPointerEnter}
          onPointerLeave={expand.onRailPointerLeave}
          onFocusCapture={expand.onRailFocusCapture}
          onBlurCapture={expand.onRailBlurCapture}
        >
          <RailChrome
            props={props}
            showLabels={showLabels}
            onNavigate={isMobile ? closeDrawer : undefined}
            onNotificationsOpenChange={setNotificationsOpen}
            onAccountOpenChange={setAccountOpen}
          />
        </aside>
      </div>

      <div className={styles.main}>
        <div className={styles.mobileBar}>
          <button
            type="button"
            className={styles.mobileMenuBtn}
            aria-label={mobileMenuAriaLabel}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <ZenformedSidebarMenuGlyph />
          </button>
          <p className={styles.mobileTitle}>{appName}</p>
        </div>
        <div className={styles.mainBody}>{children}</div>
      </div>
    </div>
  );
}

export { ZenformedSidebarAppChevrons } from './ZenformedSidebarSections';
export { ZenformedSidebarAppsTriggerChrome } from './ZenformedSidebarAppsTriggerChrome';
export { ZenformedSidebarActionRow } from './ZenformedSidebarActionRow';
