'use client';

import type { ReactElement, ReactNode } from 'react';
import { useAccountMenuState } from '../useAccountMenuState';
import { ZenformedAppList } from './ZenformedAppList';
import type {
  ZenformedAppsLauncherClassNames,
  ZenformedAppsLauncherLabels,
  ZenformedAppsLauncherLayoutOptions,
} from './types';
import type { ZenformedAppRegistryEntry } from './types';

export type ZenformedAppsLauncherProps = ZenformedAppsLauncherLayoutOptions & {
  readonly apps: readonly ZenformedAppRegistryEntry[];
  readonly classNames: ZenformedAppsLauncherClassNames;
  readonly labels: ZenformedAppsLauncherLabels;
  readonly launchApp: (targetApp: string, returnPath?: string) => Promise<void>;
  readonly launchingAppId: string | null;
  readonly launchError?: string | null;
  readonly appsIcon: ReactNode;
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
}: ZenformedAppsLauncherProps): ReactElement {
  const { accountMenuOpen, setAccountMenuOpen, accountMenuRef, closeAccountMenu } =
    useAccountMenuState();

  return (
    <div className={classNames.appsLauncherWrap} ref={accountMenuRef}>
      <button
        type="button"
        className={classNames.appsLauncherTrigger}
        onClick={() => setAccountMenuOpen((open) => !open)}
        aria-label={labels.triggerAriaLabel}
        aria-expanded={accountMenuOpen}
        aria-haspopup="menu"
      >
        <span className={classNames.appsLauncherIcon} aria-hidden>
          {appsIcon}
        </span>
      </button>
      {accountMenuOpen ? (
        <div
          className={classNames.appsPopover}
          role="menu"
          aria-label={labels.popoverAriaLabel}
        >
          <ZenformedAppList
            apps={apps}
            classNames={classNames}
            labels={labels}
            variant="popover"
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
