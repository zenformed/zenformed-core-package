'use client';

import type { ReactElement } from 'react';
import { AppEntitlementBadges } from '../../organizationSettings/components/AppEntitlementBadges';
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
      <div className={classNames.appCardBody}>
        <h3 className={classNames.appCardTitle}>{isLaunching ? 'Opening…' : app.name}</h3>
        {app.entitlementBadges ? (
          <AppEntitlementBadges {...app.entitlementBadges} compact />
        ) : null}
      </div>
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

function resolveAppTierLabel(app: ZenformedAppRegistryEntry): string {
  if (app.entitlementBadges?.planLabel?.trim()) {
    return app.entitlementBadges.planLabel.trim();
  }
  if (app.status === 'coming_soon') return 'Coming soon';
  return 'Available';
}

function AppSidebarListRow({
  app,
  classNames,
  onNavigate,
  launchApp,
  launchingAppId,
  currentAppId,
}: AppActionProps & { currentAppId?: string | null }): ReactElement {
  const isLaunching = launchingAppId === app.id;
  const disabled = isDisabledApp(app);
  const isCurrent = currentAppId != null && app.id === currentAppId;
  const tier = resolveAppTierLabel(app);
  const rowClass = [
    classNames.appsPopoverRow,
    disabled ? classNames.appsPopoverRowDisabled : '',
    isCurrent ? classNames.appsPopoverRowCurrent : '',
  ]
    .filter(Boolean)
    .join(' ');

  const body = (
    <>
      <AppIcon app={app} classNames={classNames} variant="popover" />
      <span className={classNames.appsPopoverRowText}>
        <span className={classNames.appsPopoverRowName}>
          {isLaunching ? 'Opening…' : app.name}
        </span>
        <span className={classNames.appsPopoverRowMeta}>{tier}</span>
      </span>
      {isCurrent ? (
        <span className={classNames.appsPopoverRowCheck} aria-hidden>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M5.6 10.4 2.3 7.1l1.05-1.05L5.6 8.3l5.05-5.05L11.7 4.3 5.6 10.4Z" />
          </svg>
        </span>
      ) : null}
    </>
  );

  // Current app row closes the overlay (acts as the transformed trigger with check).
  if (isCurrent) {
    return (
      <button
        type="button"
        className={rowClass}
        role="menuitem"
        aria-current="true"
        onClick={() => onNavigate?.()}
      >
        {body}
      </button>
    );
  }

  if (isLaunchableApp(app)) {
    return (
      <button
        type="button"
        className={rowClass}
        role="menuitem"
        disabled={isLaunching}
        onClick={() => {
          onNavigate?.();
          void launchApp(app.launchTarget!, '/dashboard');
        }}
      >
        {body}
      </button>
    );
  }

  if (isHrefApp(app)) {
    return (
      <a
        href={app.href}
        className={rowClass}
        role="menuitem"
        onClick={() => onNavigate?.()}
      >
        {body}
      </a>
    );
  }

  return (
    <div className={rowClass} role="menuitem" aria-disabled="true">
      {body}
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
  popoverLayout = 'tiles',
  currentAppId,
}: Omit<ZenformedAppListProps, 'variant'>): ReactElement {
  const { launcherApps, accountApp } = partitionLauncherApps(apps, accountAppId);
  const accountLabel =
    accountHomeLabel ?? labels.accountHomeLabel ?? accountApp?.name ?? 'Zenformed Home';
  const accountEntry =
    showAccountSection !== false && accountApp != null
      ? { ...accountApp, name: accountLabel }
      : null;

  if (popoverLayout === 'sidebarList') {
    const current = currentAppId != null ? apps.find((app) => app.id === currentAppId) : null;
    const rest = currentAppId != null ? apps.filter((app) => app.id !== currentAppId) : apps;
    const ordered = current != null ? [current, ...rest] : apps;
    return (
      <div className={classNames.appsPopoverList}>
        {launchError ? <p className={classNames.appsLaunchError}>{launchError}</p> : null}
        <div className={classNames.appsPopoverSidebarList} role="none">
          {ordered.map((app) => (
            <AppSidebarListRow
              key={app.id}
              app={app}
              classNames={classNames}
              onNavigate={onNavigate}
              launchApp={launchApp}
              launchingAppId={launchingAppId}
              currentAppId={currentAppId}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={classNames.appsPopoverList}>
      {launchError ? <p className={classNames.appsLaunchError}>{launchError}</p> : null}
      <div
        className={classNames.appsPopoverAppsPanel}
        aria-label={resolveAppsSectionTitle(labels)}
      >
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
      </div>
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
  popoverLayout,
  currentAppId,
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
        popoverLayout={popoverLayout}
        currentAppId={currentAppId}
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
