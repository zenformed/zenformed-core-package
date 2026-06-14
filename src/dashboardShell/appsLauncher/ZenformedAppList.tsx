'use client';

import type { ReactElement } from 'react';
import type {
  ZenformedAppRegistryEntry,
  ZenformedAppsLauncherClassNames,
  ZenformedAppsLauncherLabels,
} from './types';
import { resolveZenformedAppIconSrc } from './zenformedAppIconCatalog';

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

function AppTileIcon({
  app,
  classNames,
}: {
  app: ZenformedAppRegistryEntry;
  classNames: ZenformedAppsLauncherClassNames;
}): ReactElement {
  const iconSrc = resolveZenformedAppIconSrc(app);
  if (iconSrc) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={iconSrc} alt="" className={classNames.appsTileIcon} />
    );
  }
  const initial = app.name.trim().charAt(0).toUpperCase() || '?';
  return (
    <span className={classNames.appsTileIconFallback} aria-hidden>
      {initial}
    </span>
  );
}

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

function AppPopoverTile({
  app,
  classNames,
  labels,
  onNavigate,
  launchApp,
  launchingAppId,
}: AppActionProps): ReactElement {
  const isLaunching = launchingAppId === app.id;
  const tileBody = (
    <>
      <span className={classNames.appsTileIconWrap}>
        <AppTileIcon app={app} classNames={classNames} />
      </span>
      <span className={classNames.appsTileName}>
        {isLaunching ? 'Opening…' : app.name}
      </span>
    </>
  );

  if (isLaunchableApp(app)) {
    return (
      <button
        type="button"
        className={classNames.appsTile}
        role="menuitem"
        disabled={isLaunching}
        onClick={() => {
          onNavigate?.();
          void launchApp(app.launchTarget!, '/dashboard');
        }}
      >
        {tileBody}
      </button>
    );
  }

  if (isHrefApp(app)) {
    return (
      <a
        href={app.href}
        className={classNames.appsTile}
        role="menuitem"
        onClick={() => onNavigate?.()}
      >
        {tileBody}
      </a>
    );
  }

  return (
    <div
      className={`${classNames.appsTile} ${classNames.appsTileDisabled}`}
      role="menuitem"
      aria-disabled="true"
    >
      <span className={classNames.appsTileIconWrap}>
        <AppTileIcon app={app} classNames={classNames} />
      </span>
      <span className={classNames.appsTileName}>{app.name}</span>
      <span className={classNames.appsTileMeta}>{labels.comingSoonLabel}</span>
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
          <AppPopoverTile
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
        <div className={classNames.appsTileGrid}>{list}</div>
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
