'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { getUserInitials, userCircleColor } from '../accountMenuUtils';
import { useAccountMenuState } from '../useAccountMenuState';
import { useBodyScrollLock } from '../useBodyScrollLock';
import { useZenformedMobileShellLayout } from '../useZenformedMobileShellLayout';
import { ZenformedNotificationsMenu } from '../notifications/ZenformedNotificationsMenu';
import {
  ZenformedPresenceDot,
  ZenformedPresenceStatusSelector,
  useZenformedPresenceOptional,
} from '../../presence';
import presenceStyles from '../../presence/presence.module.css';
import { useZenformedSidebarExpandState } from './useZenformedSidebarExpandState';
import { ZenformedSidebarActionRow } from './ZenformedSidebarActionRow';
import {
  ZenformedSidebarMenuGlyph,
  ZenformedSidebarSections,
} from './ZenformedSidebarSections';
import { ZenformedMobileDrawerChrome } from './ZenformedMobileDrawerChrome';
import { ZenformedOrganizationSwitcher } from './ZenformedOrganizationSwitcher';
import { ZenformedSidebarPresentationProvider } from './sidebarPresentationContext';
import { MobileDrawerCloseProvider } from './mobileDrawerCloseContext';
import {
  resolveMobileDrawerWidthCss,
  resolveSidebarSectionLabelText,
  type ZenformedCollapsibleSidebarShellProps,
} from './types';
import styles from './collapsibleSidebar.module.css';

const SIDEBAR_DOCK_GAP_PX = 8;
const SIDEBAR_DOCK_VIEWPORT_PAD_PX = 8;

function resolveOtherLeading(
  otherLeading: ZenformedCollapsibleSidebarShellProps['otherLeading'],
  showLabel: boolean
): ReactNode {
  if (otherLeading == null) return null;
  if (typeof otherLeading === 'function') return otherLeading({ showLabel });
  return otherLeading;
}

function resolveSidebarRailRight(anchor: HTMLElement): number {
  const rail = anchor.closest('aside');
  if (rail instanceof HTMLElement) {
    return rail.getBoundingClientRect().right;
  }
  return anchor.getBoundingClientRect().right;
}

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
    organizationSwitcher,
    sections = [],
    notifications,
    themeControl,
    themeLabel = 'Light/Dark Mode',
    settings,
    account,
    notificationsLabel = 'Notifications',
    otherSectionLabel = 'Other',
    otherSectionCollapsedLabel,
    otherLeading,
  } = props;

  const accountPanelPortalRef = useRef<HTMLDivElement>(null);
  const accountMenu = useAccountMenuState({ extraRoots: [accountPanelPortalRef] });
  const [accountPortalStyle, setAccountPortalStyle] = useState<CSSProperties | null>(null);
  const presence = useZenformedPresenceOptional();
  const accountPresenceStatus = presence?.currentEffectiveStatus ?? 'offline';

  useEffect(() => {
    onAccountOpenChange?.(accountMenu.accountMenuOpen);
  }, [accountMenu.accountMenuOpen, onAccountOpenChange]);

  useEffect(() => {
    if (!accountMenu.accountMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') accountMenu.closeAccountMenu();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [accountMenu.accountMenuOpen, accountMenu.closeAccountMenu]);

  const updateAccountPortalPosition = useCallback(() => {
    const anchor = accountMenu.accountMenuRef.current;
    if (!anchor) {
      setAccountPortalStyle(null);
      return;
    }
    const left = resolveSidebarRailRight(anchor) + SIDEBAR_DOCK_GAP_PX;
    setAccountPortalStyle({
      position: 'fixed',
      left: `${Math.round(left)}px`,
      right: 'auto',
      top: 'auto',
      bottom: `${SIDEBAR_DOCK_VIEWPORT_PAD_PX}px`,
      zIndex: 10_000,
    });
  }, [accountMenu.accountMenuRef]);

  useLayoutEffect(() => {
    if (!accountMenu.accountMenuOpen) {
      setAccountPortalStyle(null);
      return;
    }
    updateAccountPortalPosition();
    window.addEventListener('resize', updateAccountPortalPosition);
    window.addEventListener('scroll', updateAccountPortalPosition, true);
    return () => {
      window.removeEventListener('resize', updateAccountPortalPosition);
      window.removeEventListener('scroll', updateAccountPortalPosition, true);
    };
  }, [accountMenu.accountMenuOpen, updateAccountPortalPosition]);

  const toggleAccountPanel = useCallback(() => {
    accountMenu.setAccountMenuOpen((open) => !open);
  }, [accountMenu.setAccountMenuOpen]);

  const themeRowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const btn = themeRowRef.current?.querySelector('button');
    if (!btn) return;
    btn.tabIndex = -1;
    btn.setAttribute('aria-hidden', 'true');
  }, [themeControl]);

  const onThemeRowActivate = useCallback(() => {
    themeRowRef.current?.querySelector('button')?.click();
  }, []);

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
  const roleLabel = account?.organizationRoleLabel?.trim() || '';

  const accountPanel =
    account && accountMenu.accountMenuOpen ? (
      <div
        ref={accountPanelPortalRef}
        className={`${styles.otherAccountPanel} ${styles.otherAccountPanelPortaled}`}
        style={accountPortalStyle ?? { visibility: 'hidden' }}
        role="menu"
        aria-label="Account"
        data-zenformed-sidebar-dock-popover="account"
      >
        <div className={styles.otherAccountUserSection}>
          <div className={styles.otherAccountHeader}>
            <span className={presenceStyles.avatarWithDot}>
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
                  {!account.avatarLoading ? getUserInitials(account.user, accountName) : null}
                </span>
              )}
              {presence ? (
                <ZenformedPresenceDot
                  status={accountPresenceStatus}
                  className={presenceStyles.avatarDot}
                />
              ) : null}
            </span>
            <div className={styles.otherAccountIdentity}>
              <span className={styles.otherAccountName} title={accountName}>
                {accountName}
              </span>
              {showAccountEmail || roleLabel ? (
                <div className={styles.otherAccountMetaRow}>
                  {showAccountEmail ? (
                    <span className={styles.otherAccountEmail} title={accountEmail}>
                      {accountEmail}
                    </span>
                  ) : (
                    <span className={styles.otherAccountEmailSpacer} aria-hidden />
                  )}
                  {roleLabel ? (
                    <span
                      className={styles.otherAccountRolePill}
                      aria-label={`${account.labels.roleAriaLabelPrefix ?? 'Role:'} ${roleLabel}`}
                    >
                      {roleLabel}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
          {presence ? <ZenformedPresenceStatusSelector /> : null}
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
    ) : null;

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
              <ZenformedOrganizationSwitcher organizationName={org} state={organizationSwitcher} />
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

      <div className={`${styles.other} ${styles.railBottom}`}>
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

        {otherLeading ? resolveOtherLeading(otherLeading, showLabels) : null}

        {notifications && notifications.organizationId.trim() ? (
          <div
            className={`${styles.actionRow} ${styles.notificationsSlot} ${styles.notificationsHitRow}`}
          >
            <ZenformedNotificationsMenu
              {...notifications}
              sidebarPlacement
              sidebarLabel={showLabels ? notificationsLabel : undefined}
              onOpenChange={onNotificationsOpenChange}
            />
          </div>
        ) : null}

        <div
          ref={themeRowRef}
          className={`${styles.actionRow} ${styles.themeHitRow}`}
          role="button"
          tabIndex={0}
          aria-label={themeLabel}
          title={themeLabel}
          onClick={onThemeRowActivate}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onThemeRowActivate();
            }
          }}
        >
          <span className={styles.actionIcon} aria-hidden>
            <span className={styles.themeControlWrap}>{themeControl}</span>
          </span>
          {showLabels ? (
            <span className={styles.actionLabel} title={themeLabel}>
              {themeLabel}
            </span>
          ) : null}
        </div>

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
            ref={accountMenu.accountMenuRef}
            className={`${styles.actionRow} ${styles.accountSlot}`}
            onClick={toggleAccountPanel}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleAccountPanel();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={account.labels.menuTriggerAriaLabel}
            aria-expanded={accountMenu.accountMenuOpen}
            aria-haspopup="menu"
          >
            <span className={styles.actionIcon} aria-hidden>
              <span className={presenceStyles.avatarWithDot}>
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
                {presence ? (
                  <ZenformedPresenceDot
                    status={accountPresenceStatus}
                    className={presenceStyles.avatarDot}
                    announce={false}
                  />
                ) : null}
              </span>
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

        {typeof document !== 'undefined' && accountPanel
          ? createPortal(accountPanel, document.body)
          : null}
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

  /** Click outside the rail (and outside docked popovers) collapses the rail. */
  useEffect(() => {
    if (isMobile) return;
    const onClickCapture = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (drawerRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest('[data-zenformed-sidebar-dock-popover]')) {
        return;
      }
      expand.setExpanded(false);
    };
    document.addEventListener('click', onClickCapture, true);
    return () => document.removeEventListener('click', onClickCapture, true);
  }, [expand.setExpanded, isMobile]);

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
