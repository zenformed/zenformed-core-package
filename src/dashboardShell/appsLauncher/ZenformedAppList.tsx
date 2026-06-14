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

function isDisabledApp(app: ZenformedAppRegistryEntry): boolean {
  return !isLaunchableApp(app) && !isHrefApp(app);
}

type AppActionProps = {
  app: ZenformedAppRegistryEntry;
  classNames: ZenformedAppsLauncherClassNames;
  labels: ZenformedAppsLauncherLabels;
  onNavigate?: () => void;
  launchApp: (targetApp: string, returnPath?: string) => Promise<void>;
  launchingAppId: string | null;
};

type AppIconVariant = 'popover' | 'card';

function AppIcon({
  app,
  classNames,
  variant,
}: {
  app: ZenformedAppRegistryEntry;
  classNames: ZenformedAppsLauncherClassNames;
  variant: AppIconVariant;
}): ReactElement {
  const iconClass = variant === 'card' ? classNames.appCardIcon : classNames.appsTileIcon;
  const fallbackClass =
    variant === 'card' ? classNames.appCardIconFallback : classNames.appsTileIconFallback;
  const iconSrc = resolveZenformedAppIconSrc(app);
  if (iconSrc) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={iconSrc} alt="" className={iconClass} />
    );
  }
  const initial = app.name.trim().charAt(0).toUpperCase() || '?';
  return (
    <span className={fallbackClass} aria-hidden>
      {initial}
    </span>
  );
}

function AppCard({
  app,
  classNames,
  onNavigate,
  launchApp,
  launchingAppId,
}: Omit<AppActionProps, 'labels'>): ReactElement {
  const isLaunching = launchingAppId === app.id;
  const disabled = isDisabledApp(app);
  const cardClass = disabled
    ? `${classNames.appCard} ${classNames.appCardDisabled}`
    : classNames.appCard;
  const cardBody = (
    <>
      <AppIcon app={app} classNames={classNames} variant="card" />
      <h3 className={classNames.appCardTitle}>{isLaunching ? 'Opening…' : app.name}</h3>
    </>
  );

  if (isLaunchableApp(app)) {
    return (
      <button
        type="button"
        className={cardClass}
        disabled={isLaunching}
        onClick={() => {
          onNavigate?.();
          void launchApp(app.launchTarget!, '/dashboard');
        }}
      >
        {cardBody}
      </button>
    );
  }

  if (isHrefApp(app)) {
    return (
      <a href={app.href} className={cardClass} onClick={() => onNavigate?.()}>
        {cardBody}
      </a>
    );
  }

  return (
    <div className={cardClass} aria-disabled="true">
      {cardBody}
    </div>
  );
}

function AppPopoverTile({
  app,
  classNames,
  onNavigate,
  launchApp,
  launchingAppId,
}: Omit<AppActionProps, 'labels'>): ReactElement {
  const isLaunching = launchingAppId === app.id;
  const disabled = isDisabledApp(app);
  const tileClass = disabled
    ? `${classNames.appsTile} ${classNames.appsTileDisabled}`
    : classNames.appsTile;
  const tileBody = (
    <>
      <AppIcon app={app} classNames={classNames} variant="popover" />
      <span className={classNames.appsTileName}>
        {isLaunching ? 'Opening…' : app.name}
      </span>
    </>
  );

  if (isLaunchableApp(app)) {
    return (
      <button
        type="button"
        className={tileClass}
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
        className={tileClass}
        role="menuitem"
        onClick={() => onNavigate?.()}
      >
        {tileBody}
      </a>
    );
  }

  return (
    <div className={tileClass} role="menuitem" aria-disabled="true">
      {tileBody}
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
            onNavigate={onNavigate}
            launchApp={launchApp}
            launchingAppId={launchingAppId}
          />
        ));

  if (variant === 'popover') {
    return (
      <div className={classNames.appsPopoverList}>
        {launchError ? <p className={classNames.appsLaunchError}>{launchError}</p> : null}
        <section className={classNames.appsPopoverSection}>
          <h2 className={classNames.appsPopoverSectionTitle}>{labels.sectionTitle}</h2>
          <div className={classNames.appsTileGrid}>{list}</div>
        </section>
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
