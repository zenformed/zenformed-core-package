'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useAccountMenuState } from '../useAccountMenuState';
import { useZenformedSidebarPresentation } from '../collapsibleSidebar/sidebarPresentationContext';
import { useMobileDrawerClose } from '../collapsibleSidebar/mobileDrawerCloseContext';
import { ZenformedAppList } from './ZenformedAppList';
import type {
  ZenformedAppsLauncherClassNames,
  ZenformedAppsLauncherLabels,
  ZenformedAppsLauncherLayoutOptions,
} from './types';
import type { ZenformedAppRegistryEntry } from './types';
import { ZENFORMED_DROPDOWN_SURFACE_BORDER_STYLE } from '../dropdownSurfaceBorderStyle';

const SIDEBAR_DOCK_GAP_PX = 8;
const SIDEBAR_DOCK_VIEWPORT_PAD_PX = 8;

export type ZenformedAppsLauncherProps = ZenformedAppsLauncherLayoutOptions & {
  readonly apps: readonly ZenformedAppRegistryEntry[];
  readonly classNames: ZenformedAppsLauncherClassNames;
  readonly labels: ZenformedAppsLauncherLabels;
  readonly launchApp: (targetApp: string, returnPath?: string) => Promise<void>;
  readonly launchingAppId: string | null;
  readonly launchError?: string | null;
  readonly appsIcon: ReactNode;
  /**
   * Optional custom trigger (e.g. collapsible sidebar app switcher chrome).
   * Receives open state and the same click handler as the default trigger.
   */
  readonly renderTrigger?: (state: {
    readonly open: boolean;
    readonly onClick: () => void;
    readonly ariaLabel: string;
  }) => ReactNode;
  readonly onOpenChange?: (open: boolean) => void;
};

function resolveSidebarRailRect(anchor: HTMLElement): DOMRect {
  const rail = anchor.closest('aside');
  if (rail instanceof HTMLElement) {
    return rail.getBoundingClientRect();
  }
  return anchor.getBoundingClientRect();
}

export function ZenformedAppsLauncher({
  apps,
  classNames,
  labels,
  launchApp,
  launchingAppId,
  launchError,
  appsIcon,
  accountAppId,
  showAccountSection,
  accountHomeLabel,
  popoverLayout,
  currentAppId,
  renderTrigger,
  onOpenChange,
}: ZenformedAppsLauncherProps): ReactElement {
  const presentation = useZenformedSidebarPresentation();
  const closeMobileDrawer = useMobileDrawerClose();
  const isSidebarList = popoverLayout === 'sidebarList';
  /** Desktop: dock beside the rail. */
  const isDesktopDock = isSidebarList && presentation === 'desktop';
  /** Mobile: centered modal sheet (~70% viewport), not inline in the drawer. */
  const isMobileTopSheet = isSidebarList && presentation === 'mobile';
  const usesPortal = isDesktopDock || isMobileTopSheet;

  const popoverPortalRef = useRef<HTMLDivElement>(null);
  const { accountMenuOpen, setAccountMenuOpen, accountMenuRef, closeAccountMenu } =
    useAccountMenuState({
      extraRoots: usesPortal ? [popoverPortalRef] : undefined,
    });
  const [portalStyle, setPortalStyle] = useState<CSSProperties | null>(null);

  useEffect(() => {
    onOpenChange?.(accountMenuOpen);
  }, [accountMenuOpen, onOpenChange]);

  const updatePortalPosition = useCallback(() => {
    const anchor = accountMenuRef.current;
    if (!anchor || !usesPortal) {
      setPortalStyle(null);
      return;
    }

    if (isMobileTopSheet) {
      setPortalStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        width: 'min(28rem, calc(100vw - 1rem))',
        height: '70vh',
        maxHeight: '70vh',
        transform: 'translate(-50%, -50%)',
        zIndex: 10_051,
      });
      return;
    }

    const railRect = resolveSidebarRailRect(anchor);
    setPortalStyle({
      position: 'fixed',
      left: `${Math.round(railRect.right + SIDEBAR_DOCK_GAP_PX)}px`,
      top: `${Math.round(railRect.top + SIDEBAR_DOCK_VIEWPORT_PAD_PX)}px`,
      right: 'auto',
      bottom: 'auto',
      zIndex: 10_000,
    });
  }, [accountMenuRef, isMobileTopSheet, usesPortal]);

  useLayoutEffect(() => {
    if (!accountMenuOpen || !usesPortal) {
      setPortalStyle(null);
      return;
    }
    updatePortalPosition();
    window.addEventListener('resize', updatePortalPosition);
    window.addEventListener('scroll', updatePortalPosition, true);
    return () => {
      window.removeEventListener('resize', updatePortalPosition);
      window.removeEventListener('scroll', updatePortalPosition, true);
    };
  }, [accountMenuOpen, updatePortalPosition, usesPortal]);

  const onTriggerClick = () => setAccountMenuOpen((open) => !open);

  const onListNavigate = () => {
    closeAccountMenu();
    closeMobileDrawer?.();
  };

  const list = accountMenuOpen ? (
    <ZenformedAppList
      apps={apps}
      classNames={classNames}
      labels={labels}
      variant="popover"
      popoverLayout={popoverLayout}
      currentAppId={currentAppId}
      onNavigate={onListNavigate}
      launchApp={launchApp}
      launchingAppId={launchingAppId}
      launchError={launchError}
      accountAppId={accountAppId}
      showAccountSection={showAccountSection}
      accountHomeLabel={accountHomeLabel}
    />
  ) : null;

  const dockKind = isMobileTopSheet ? 'apps-mobile' : 'apps';
  const portaledMobileBackdrop =
    isMobileTopSheet && accountMenuOpen ? (
      <button
        type="button"
        aria-label="Dismiss apps menu"
        className={classNames.appsMobileBackdrop}
        data-zenformed-sidebar-dock-popover-backdrop="apps-mobile"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10_050,
          margin: 0,
          padding: 0,
          border: 'none',
          cursor: 'pointer',
          background: 'rgba(8, 15, 30, 0.62)',
          backdropFilter: 'blur(14px) saturate(1.1)',
          WebkitBackdropFilter: 'blur(14px) saturate(1.1)',
        }}
        onClick={closeAccountMenu}
      />
    ) : null;
  const portaledPopover =
    usesPortal && accountMenuOpen ? (
      <div
        ref={popoverPortalRef}
        className={classNames.appsPopover}
        style={{
          ...ZENFORMED_DROPDOWN_SURFACE_BORDER_STYLE,
          ...(portalStyle ?? { visibility: 'hidden' }),
        }}
        role="menu"
        aria-label={labels.popoverAriaLabel}
        data-zenformed-sidebar-dock-popover={dockKind}
      >
        {list}
      </div>
    ) : null;

  const portaledLayer =
    portaledMobileBackdrop != null || portaledPopover != null ? (
      <>
        {portaledMobileBackdrop}
        {portaledPopover}
      </>
    ) : null;

  return (
    <div
      className={classNames.appsLauncherWrap}
      ref={accountMenuRef}
      data-zenformed-apps-overlay={isDesktopDock && accountMenuOpen ? 'true' : undefined}
    >
      {renderTrigger ? (
        renderTrigger({
          open: accountMenuOpen,
          onClick: onTriggerClick,
          ariaLabel: labels.triggerAriaLabel,
        })
      ) : (
        <button
          type="button"
          className={classNames.appsLauncherTrigger}
          onClick={onTriggerClick}
          aria-label={labels.triggerAriaLabel}
          aria-expanded={accountMenuOpen}
          aria-haspopup="menu"
        >
          <span className={classNames.appsLauncherIcon} aria-hidden>
            {appsIcon}
          </span>
        </button>
      )}
      {!usesPortal && accountMenuOpen ? (
        <div
          className={classNames.appsPopover}
          style={ZENFORMED_DROPDOWN_SURFACE_BORDER_STYLE}
          role="menu"
          aria-label={labels.popoverAriaLabel}
        >
          {list}
        </div>
      ) : null}
      {typeof document !== 'undefined' && portaledLayer
        ? createPortal(portaledLayer, document.body)
        : null}
    </div>
  );
}
