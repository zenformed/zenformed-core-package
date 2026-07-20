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
  const inlineInDrawer = presentation === 'mobile' && popoverLayout === 'sidebarList';
  const isSidebarOverlay = popoverLayout === 'sidebarList' && !inlineInDrawer;

  const popoverPortalRef = useRef<HTMLDivElement>(null);
  const { accountMenuOpen, setAccountMenuOpen, accountMenuRef, closeAccountMenu } =
    useAccountMenuState({
      extraRoots: isSidebarOverlay ? [popoverPortalRef] : undefined,
    });
  const [portalStyle, setPortalStyle] = useState<CSSProperties | null>(null);

  useEffect(() => {
    onOpenChange?.(accountMenuOpen);
  }, [accountMenuOpen, onOpenChange]);

  const updatePortalPosition = useCallback(() => {
    const anchor = accountMenuRef.current;
    if (!anchor || !isSidebarOverlay) {
      setPortalStyle(null);
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
  }, [accountMenuRef, isSidebarOverlay]);

  useLayoutEffect(() => {
    if (!accountMenuOpen || !isSidebarOverlay) {
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
  }, [accountMenuOpen, isSidebarOverlay, updatePortalPosition]);

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

  const dockedPopover =
    isSidebarOverlay && accountMenuOpen ? (
      <div
        ref={popoverPortalRef}
        className={classNames.appsPopover}
        style={{
          ...ZENFORMED_DROPDOWN_SURFACE_BORDER_STYLE,
          ...(portalStyle ?? { visibility: 'hidden' }),
        }}
        role="menu"
        aria-label={labels.popoverAriaLabel}
        data-zenformed-sidebar-dock-popover="apps"
      >
        {list}
      </div>
    ) : null;

  return (
    <div
      className={classNames.appsLauncherWrap}
      ref={accountMenuRef}
      data-zenformed-apps-overlay={isSidebarOverlay && accountMenuOpen ? 'true' : undefined}
      data-zenformed-apps-inline={inlineInDrawer ? 'true' : undefined}
      data-zenformed-apps-inline-open={inlineInDrawer && accountMenuOpen ? 'true' : undefined}
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
          aria-haspopup={inlineInDrawer ? 'true' : 'menu'}
        >
          <span className={classNames.appsLauncherIcon} aria-hidden>
            {appsIcon}
          </span>
        </button>
      )}
      {inlineInDrawer && accountMenuOpen ? (
        <div
          className={classNames.appsPopover}
          data-zenformed-apps-inline-panel=""
          role="menu"
          aria-label={labels.popoverAriaLabel}
        >
          {list}
        </div>
      ) : null}
      {!inlineInDrawer && !isSidebarOverlay && accountMenuOpen ? (
        <div
          className={classNames.appsPopover}
          style={ZENFORMED_DROPDOWN_SURFACE_BORDER_STYLE}
          role="menu"
          aria-label={labels.popoverAriaLabel}
        >
          {list}
        </div>
      ) : null}
      {typeof document !== 'undefined' && dockedPopover
        ? createPortal(dockedPopover, document.body)
        : null}
    </div>
  );
}
