'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react';
import { getUserInitials, userCircleColor } from '../accountMenuUtils';
import { useAccountMenuState } from '../useAccountMenuState';
import { useBodyScrollLock } from '../useBodyScrollLock';
import { useZenformedMobileShellLayout } from '../useZenformedMobileShellLayout';
import { ZenformedNotificationsMenu } from '../notifications/ZenformedNotificationsMenu';
import { useZenformedSidebarExpandState } from './useZenformedSidebarExpandState';
import { ZenformedSidebarActionRow } from './ZenformedSidebarActionRow';
import {
  ZenformedSidebarMenuGlyph,
  ZenformedSidebarSections,
} from './ZenformedSidebarSections';
import { ZenformedMobileDrawerChrome } from './ZenformedMobileDrawerChrome';
import { ZenformedSidebarPresentationProvider } from './sidebarPresentationContext';
import { MobileDrawerCloseProvider } from './mobileDrawerCloseContext';
import {
  resolveMobileDrawerWidthCss,
  resolveSidebarSectionLabelText,
  type ZenformedCollapsibleSidebarShellProps,
} from './types';
import styles from './collapsibleSidebar.module.css';

function DesktopRailChrome({
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

  const openAccountPanel = useCallback(() => {
    accountMenu.setAccountMenuOpen(true);
  }, [accountMenu.setAccountMenuOpen]);

  const org = organizationName?.trim() || null;
  const otherLabel = resolveSidebarSectionLabelText({
    label: otherSectionLabel,
    collapsedLabel: otherSectionCollapsedLabel,
    expanded: showLabels,
  });

  const accountName = account?.userDisplayName?.trim() || account?.user.email?.trim() || '';
  const accountEmail = (account?.userEmail ?? account?.user.email)?.trim() || '';
  const showAccountEmail =
    Boolean(accountEmail) && accountEmail.toLowerCase() !== accountName.toLowerCase();

  return (
    <div
      className={styles.railInner}
      data-zenformed-sidebar-expanded={showLabels ? 'true' : 'false'}
    >
      <div className={styles.railTop}>
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
      </div>

      <div
        className={`${styles.other} ${styles.railBottom}`}
        ref={account ? accountMenu.accountMenuRef : undefined}
      >
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
          <div
            className={`${styles.actionRow} ${styles.accountSlot}`}
            onClick={openAccountPanel}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openAccountPanel();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={account.labels.menuTriggerAriaLabel}
            aria-expanded={accountMenu.accountMenuOpen}
            aria-haspopup="menu"
          >
            <span className={styles.actionIcon} aria-hidden>
              {account.profilePhotoChangeEnabled && account.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={account.avatarUrl}
                  alt=""
                  className={styles.otherAccountAvatar}
                />
              ) : (
                <span
                  className={styles.otherAccountAvatar}
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

        {account && accountMenu.accountMenuOpen ? (
          <div className={styles.otherAccountPanel} role="menu" aria-label="Account">
            <div className={styles.otherAccountHeader}>
              {account.profilePhotoChangeEnabled && account.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={account.avatarUrl} alt="" className={styles.otherAccountAvatar} />
              ) : (
                <span
                  className={styles.otherAccountAvatar}
                  style={{
                    backgroundColor: account.avatarLoading
                      ? 'var(--color-muted, #f1f5f9)'
                      : userCircleColor(account.user.email),
                  }}
                  aria-hidden
                >
                  {!account.avatarLoading
                    ? getUserInitials(account.user, accountName)
                    : null}
                </span>
              )}
              <div className={styles.otherAccountIdentity}>
                <span className={styles.otherAccountName} title={accountName}>
                  {accountName}
                </span>
                {showAccountEmail ? (
                  <span className={styles.otherAccountEmail} title={accountEmail}>
                    {accountEmail}
                  </span>
                ) : null}
              </div>
            </div>
            <div className={styles.otherAccountDivider} aria-hidden />
            <button
              type="button"
              className={styles.otherAccountSignOut}
              onClick={() => {
                accountMenu.closeAccountMenu();
                account.onRequestSignOutConfirm();
              }}
            >
              {account.signOutIcon}
              {account.labels.signOutButtonLabel}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Package-owned collapsible sidebar shell.
 * Desktop: hover-expand rail. Mobile: Facebook-style drawer (~90vw).
 * Only one chrome tree mounts at a time so notifications keep a single poller.
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
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const drawerWasOpenRef = useRef(false);

  const forceExpanded =
    holdExpanded || notificationsOpen || accountOpen || (isMobile && drawerOpen);
  const expand = useZenformedSidebarExpandState({
    forceExpanded,
    hoverEnabled: !isMobile,
  });

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);

  useBodyScrollLock(isMobile && drawerOpen);

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

  useEffect(() => {
    if (!isMobile) return;
    if (drawerOpen) {
      drawerWasOpenRef.current = true;
      const root = drawerRef.current;
      root?.removeAttribute('inert');
      const focusable = root?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
      return;
    }
    drawerRef.current?.setAttribute('inert', '');
    if (drawerWasOpenRef.current) {
      drawerWasOpenRef.current = false;
      menuButtonRef.current?.focus();
    }
  }, [drawerOpen, isMobile]);

  useEffect(() => {
    if (isMobile) return;
    drawerRef.current?.removeAttribute('inert');
  }, [isMobile]);

  const showLabels = isMobile ? drawerOpen : expand.expanded;

  const railClass = useMemo(() => {
    const parts = [styles.rail];
    if (isMobile) {
      parts.push(styles.mobileDrawer);
      if (drawerOpen) parts.push(styles.mobileDrawerOpen);
      else parts.push(styles.mobileDrawerClosed);
      return parts.join(' ');
    }
    if (showLabels) parts.push(styles.railExpanded);
    return parts.join(' ');
  }, [drawerOpen, isMobile, showLabels]);

  const presentation = isMobile ? 'mobile' : 'desktop';

  return (
    <ZenformedSidebarPresentationProvider value={presentation}>
      <MobileDrawerCloseProvider value={isMobile ? closeDrawer : null}>
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
            id={isMobile ? 'zenformed-mobile-drawer' : undefined}
            ref={drawerRef}
            className={railClass}
            aria-label={sidebarAriaLabel}
            aria-hidden={isMobile ? !drawerOpen : undefined}
            data-expanded={showLabels ? 'true' : 'false'}
            data-zenformed-mobile-drawer={isMobile ? 'true' : undefined}
            style={
              isMobile
                ? ({
                    ['--zenformed-mobile-drawer-width' as string]: resolveMobileDrawerWidthCss(),
                  } as CSSProperties)
                : undefined
            }
            onPointerEnter={isMobile ? undefined : expand.onRailPointerEnter}
            onPointerLeave={isMobile ? undefined : expand.onRailPointerLeave}
            onFocusCapture={isMobile ? undefined : expand.onRailFocusCapture}
            onBlurCapture={isMobile ? undefined : expand.onRailBlurCapture}
          >
            {isMobile ? (
              <ZenformedMobileDrawerChrome
                props={props}
                onNavigate={closeDrawer}
                onNotificationsOpenChange={setNotificationsOpen}
              />
            ) : (
              <DesktopRailChrome
                props={props}
                showLabels={showLabels}
                onNotificationsOpenChange={setNotificationsOpen}
                onAccountOpenChange={setAccountOpen}
              />
            )}
          </aside>
        </div>

        <div className={styles.main}>
          {isMobile ? (
            <div className={styles.mobileBar}>
              <button
                ref={menuButtonRef}
                type="button"
                className={styles.mobileMenuBtn}
                aria-label={mobileMenuAriaLabel}
                aria-expanded={drawerOpen}
                aria-controls="zenformed-mobile-drawer"
                onClick={() => (drawerOpen ? closeDrawer() : openDrawer())}
              >
                <ZenformedSidebarMenuGlyph />
              </button>
            </div>
          ) : null}
          <div className={styles.mainBody}>{children}</div>
        </div>
      </div>
      </MobileDrawerCloseProvider>
    </ZenformedSidebarPresentationProvider>
  );
}

export { ZenformedSidebarAppChevrons } from './ZenformedSidebarSections';
export { ZenformedSidebarAppsTriggerChrome } from './ZenformedSidebarAppsTriggerChrome';
export { ZenformedSidebarActionRow } from './ZenformedSidebarActionRow';
