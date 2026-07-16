'use client';

import type { ReactElement, ReactNode } from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAccountMenuState } from '../useAccountMenuState';
import { useZenformedMobileShellLayout } from '../useZenformedMobileShellLayout';
import { ZenformedAppList } from './ZenformedAppList';
import type {
  ZenformedAppsLauncherClassNames,
  ZenformedAppsLauncherLabels,
  ZenformedAppsLauncherLayoutOptions,
} from './types';
import type { ZenformedAppRegistryEntry } from './types';
import { ZENFORMED_DROPDOWN_SURFACE_BORDER_STYLE } from '../dropdownSurfaceBorderStyle';
import mobileModalStyles from '../sidebarMobileModal.module.css';

const APPS_MOBILE_MODAL_SELECTOR = '[data-zenformed-sidebar-mobile-modal="apps"]';

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
  const isMobile = useZenformedMobileShellLayout();
  const isSidebarOverlay = popoverLayout === 'sidebarList';
  const useMobileModal = isMobile && isSidebarOverlay;

  const { accountMenuOpen, setAccountMenuOpen, accountMenuRef, closeAccountMenu } =
    useAccountMenuState(
      useMobileModal ? { containSelector: APPS_MOBILE_MODAL_SELECTOR } : undefined
    );

  useEffect(() => {
    onOpenChange?.(accountMenuOpen);
  }, [accountMenuOpen, onOpenChange]);

  const onTriggerClick = () => setAccountMenuOpen((open) => !open);

  const list = (
    <ZenformedAppList
      apps={apps}
      classNames={classNames}
      labels={labels}
      variant="popover"
      popoverLayout={popoverLayout}
      currentAppId={currentAppId}
      onNavigate={closeAccountMenu}
      launchApp={launchApp}
      launchingAppId={launchingAppId}
      launchError={launchError}
      accountAppId={accountAppId}
      showAccountSection={showAccountSection}
      accountHomeLabel={accountHomeLabel}
    />
  );

  const desktopPopover =
    accountMenuOpen && !useMobileModal ? (
      <div
        className={classNames.appsPopover}
        style={isSidebarOverlay ? undefined : ZENFORMED_DROPDOWN_SURFACE_BORDER_STYLE}
        role="menu"
        aria-label={labels.popoverAriaLabel}
      >
        {list}
      </div>
    ) : null;

  const mobileModal =
    typeof document !== 'undefined' && accountMenuOpen && useMobileModal
      ? createPortal(
          <div
            className={mobileModalStyles.root}
            data-zenformed-sidebar-mobile-modal="apps"
            role="presentation"
          >
            <button
              type="button"
              className={mobileModalStyles.backdrop}
              aria-label="Close apps menu"
              onClick={closeAccountMenu}
            />
            <div
              className={`${classNames.appsPopover} ${mobileModalStyles.panel}`}
              role="menu"
              aria-label={labels.popoverAriaLabel}
            >
              {list}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div
      className={classNames.appsLauncherWrap}
      ref={accountMenuRef}
      data-zenformed-apps-overlay={isSidebarOverlay && accountMenuOpen ? 'true' : undefined}
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
      {desktopPopover}
      {mobileModal}
    </div>
  );
}
