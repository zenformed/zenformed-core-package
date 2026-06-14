'use client';

import type { ReactElement, ReactNode } from 'react';
import type {
  ZenformedAppRegistryEntry,
  ZenformedAppsLauncherClassNames,
  ZenformedAppsLauncherLabels,
} from './types';

export type ZenformedAppListProps = {
  readonly apps: readonly ZenformedAppRegistryEntry[];
  readonly classNames: ZenformedAppsLauncherClassNames;
  readonly labels: ZenformedAppsLauncherLabels;
  readonly variant: 'cards' | 'popover';
  readonly onNavigate?: () => void;
  readonly launchApp: (targetApp: string, returnPath?: string) => Promise<void>;
  readonly launchingAppId: string | null;
  readonly launchError?: string | null;
};

function isLaunchableApp(app: ZenformedAppRegistryEntry): boolean {
  return app.status === 'live' && app.launchTarget != null;
}

function isHrefApp(app: ZenformedAppRegistryEntry): boolean {
  return app.status === 'live' && app.href != null;
}

type AppActionProps = {
  app: ZenformedAppRegistryEntry;
  classNames: ZenformedAppsLauncherClassNames;
  labels: ZenformedAppsLauncherLabels;
  onNavigate?: () => void;
  launchApp: (targetApp: string, returnPath?: string) => Promise<void>;
  launchingAppId: string | null;
};

function AppCard({
  app,
  classNames,
  labels,
  onNavigate,
  launchApp,
  launchingAppId,
}: AppActionProps): ReactElement {
  const isLaunching = launchingAppId === app.id;

  if (isLaunchableApp(app)) {
    return (
      <button
        type="button"
        className={classNames.appCard}
        disabled={isLaunching}
        onClick={() => {
          onNavigate?.();
          void launchApp(app.launchTarget!, '/dashboard');
        }}
      >
        <h3 className={classNames.appCardTitle}>{app.name}</h3>
        <p className={classNames.appCardDescription}>{app.description}</p>
        {isLaunching ? <span className={classNames.appComingSoon}>Opening…</span> : null}
      </button>
    );
  }

  if (isHrefApp(app)) {
    return (
      <a href={app.href} className={classNames.appCard} onClick={() => onNavigate?.()}>
        <h3 className={classNames.appCardTitle}>{app.name}</h3>
        <p className={classNames.appCardDescription}>{app.description}</p>
      </a>
    );
  }

  return (
    <div className={`${classNames.appCard} ${classNames.appCardDisabled}`} aria-disabled="true">
      <h3 className={classNames.appCardTitle}>{app.name}</h3>
      <p className={classNames.appCardDescription}>{app.description}</p>
      <span className={classNames.appComingSoon}>{labels.comingSoonLabel}</span>
    </div>
  );
}

function AppPopoverRow({
  app,
  classNames,
  labels,
  onNavigate,
  launchApp,
  launchingAppId,
}: AppActionProps): ReactElement {
  const isLaunching = launchingAppId === app.id;

  if (isLaunchableApp(app)) {
    return (
      <button
        type="button"
        className={classNames.appsPopoverRow}
        role="menuitem"
        disabled={isLaunching}
        onClick={() => {
          onNavigate?.();
          void launchApp(app.launchTarget!, '/dashboard');
        }}
      >
        <span className={classNames.appsPopoverRowName}>{app.name}</span>
        <span className={classNames.appsPopoverRowDescription}>
          {isLaunching ? 'Opening…' : app.description}
        </span>
      </button>
    );
  }

  if (isHrefApp(app)) {
    return (
      <a
        href={app.href}
        className={classNames.appsPopoverRow}
        role="menuitem"
        onClick={() => onNavigate?.()}
      >
        <span className={classNames.appsPopoverRowName}>{app.name}</span>
        <span className={classNames.appsPopoverRowDescription}>{app.description}</span>
      </a>
    );
  }

  return (
    <div
      className={`${classNames.appsPopoverRow} ${classNames.appsPopoverRowDisabled}`}
      role="menuitem"
    >
      <span className={classNames.appsPopoverRowName}>{app.name}</span>
      <span className={classNames.appsPopoverRowMeta}>{labels.comingSoonLabel}</span>
    </div>
  );
}

export function ZenformedAppList({
  apps,
  classNames,
  labels,
  variant,
  onNavigate,
  launchApp,
  launchingAppId,
  launchError,
}: ZenformedAppListProps): ReactElement {
  const list =
    variant === 'popover'
      ? apps.map((app) => (
          <AppPopoverRow
            key={app.id}
            app={app}
            classNames={classNames}
            labels={labels}
            onNavigate={onNavigate}
            launchApp={launchApp}
            launchingAppId={launchingAppId}
          />
        ))
      : apps.map((app) => (
          <AppCard
            key={app.id}
            app={app}
            classNames={classNames}
            labels={labels}
            onNavigate={onNavigate}
            launchApp={launchApp}
            launchingAppId={launchingAppId}
          />
        ));

  if (variant === 'popover') {
    return (
      <div className={classNames.appsPopoverList}>
        {launchError ? <p className={classNames.appsLaunchError}>{launchError}</p> : null}
        {list}
      </div>
    );
  }

  return (
    <div>
      {launchError ? <p className={classNames.appsLaunchError}>{launchError}</p> : null}
      <div className={classNames.appCardGrid}>{list}</div>
    </div>
  );
}
