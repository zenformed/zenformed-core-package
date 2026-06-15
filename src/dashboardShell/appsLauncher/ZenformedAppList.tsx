'use client';

import type { ReactElement } from 'react';
import type {
  ZenformedAppRegistryEntry,
  ZenformedAppsLauncherClassNames,
  ZenformedAppsLauncherLabels,
  ZenformedAppsLauncherLayoutOptions,
} from './types';
import { partitionLauncherApps } from './partitionLauncherApps';
import { resolveZenformedAppIconSrc } from './zenformedAppIconCatalog';

export type ZenformedAppListProps = ZenformedAppsLauncherLayoutOptions & {
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
  const initial = (app.name ?? '').trim().charAt(0).toUpperCase() || '?';
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
}: AppActionProps): ReactElement {
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
}: AppActionProps): ReactElement {
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

function resolveAppsSectionTitle(labels: ZenformedAppsLauncherLabels): string {
  return labels.appsSectionTitle ?? labels.sectionTitle ?? 'Apps';
}

function resolveAccountSectionTitle(labels: ZenformedAppsLauncherLabels): string {
  return labels.accountSectionTitle ?? 'Account';
}

function LauncherPopoverContent({
  apps,
  classNames,
  labels,
  onNavigate,
  launchApp,
  launchingAppId,
  launchError,
  accountAppId,
  showAccountSection,
  accountHomeLabel,
}: Omit<ZenformedAppListProps, 'variant'>): ReactElement {
  const { launcherApps, accountApp } = partitionLauncherApps(apps, accountAppId);
  const accountLabel =
    accountHomeLabel ?? labels.accountHomeLabel ?? accountApp?.name ?? 'Zenformed Home';
  const accountEntry =
    showAccountSection !== false && accountApp != null
      ? { ...accountApp, name: accountLabel }
      : null;

  return (
    <div className={classNames.appsPopoverList}>
      {launchError ? <p className={classNames.appsLaunchError}>{launchError}</p> : null}
      <section className={classNames.appsPopoverSection} aria-label={resolveAppsSectionTitle(labels)}>
        <h2 className={classNames.appsPopoverSectionTitle}>{resolveAppsSectionTitle(labels)}</h2>
        <div className={classNames.appsTileGrid}>
          {launcherApps.map((app) => (
            <AppPopoverTile
              key={app.id}
              app={app}
              classNames={classNames}
              onNavigate={onNavigate}
              launchApp={launchApp}
              launchingAppId={launchingAppId}
            />
          ))}
        </div>
      </section>
      {accountEntry ? (
        <section
          className={classNames.appsPopoverSection}
          aria-label={resolveAccountSectionTitle(labels)}
        >
          <h2 className={classNames.appsPopoverSectionTitle}>
            {resolveAccountSectionTitle(labels)}
          </h2>
          <div className={classNames.appsTileGrid}>
            <AppPopoverTile
              app={accountEntry}
              classNames={classNames}
              onNavigate={onNavigate}
              launchApp={launchApp}
              launchingAppId={launchingAppId}
            />
          </div>
        </section>
      ) : null}
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
  accountAppId,
  showAccountSection,
  accountHomeLabel,
}: ZenformedAppListProps): ReactElement {
  if (variant === 'popover') {
    return (
      <LauncherPopoverContent
        apps={apps}
        classNames={classNames}
        labels={labels}
        onNavigate={onNavigate}
        launchApp={launchApp}
        launchingAppId={launchingAppId}
        launchError={launchError}
        accountAppId={accountAppId}
        showAccountSection={showAccountSection}
        accountHomeLabel={accountHomeLabel}
      />
    );
  }

  const { launcherApps } = partitionLauncherApps(apps, accountAppId);

  return (
    <div>
      {launchError ? <p className={classNames.appsLaunchError}>{launchError}</p> : null}
      <div className={classNames.appCardGrid}>
        {launcherApps.map((app) => (
          <AppCard
            key={app.id}
            app={app}
            classNames={classNames}
            onNavigate={onNavigate}
            launchApp={launchApp}
            launchingAppId={launchingAppId}
          />
        ))}
      </div>
    </div>
  );
}
