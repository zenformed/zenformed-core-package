'use client';

import type { ReactElement, ReactNode } from 'react';
import { useEffect } from 'react';
import { useAccountMenuState } from '../useAccountMenuState';
import { ZenformedAppList } from './ZenformedAppList';
import type {
  ZenformedAppsLauncherClassNames,
  ZenformedAppsLauncherLabels,
  ZenformedAppsLauncherLayoutOptions,
} from './types';
import type { ZenformedAppRegistryEntry } from './types';
import { ZENFORMED_DROPDOWN_SURFACE_BORDER_STYLE } from '../dropdownSurfaceBorderStyle';

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
  const { accountMenuOpen, setAccountMenuOpen, accountMenuRef, closeAccountMenu } =
    useAccountMenuState();

  useEffect(() => {
    onOpenChange?.(accountMenuOpen);
  }, [accountMenuOpen, onOpenChange]);

  const onTriggerClick = () => setAccountMenuOpen((open) => !open);
  const isSidebarOverlay = popoverLayout === 'sidebarList';

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
      {accountMenuOpen ? (
        <div
          className={classNames.appsPopover}
          style={isSidebarOverlay ? undefined : ZENFORMED_DROPDOWN_SURFACE_BORDER_STYLE}
          role="menu"
          aria-label={labels.popoverAriaLabel}
        >
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
        </div>
      ) : null}
    </div>
  );
}
