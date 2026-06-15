'use client';

import type { ReactElement } from 'react';
import { companyCircleColor, getCompanyInitial } from './brandingUtils';
import type { ZenformedSidebarBrandingProps } from './types';

function resolveSidebarDisplayName(props: ZenformedSidebarBrandingProps): string {
  return (props.appName ?? props.shopName ?? props.defaultShopNameFallback ?? '').trim();
}

function resolveSidebarIconSrc(props: ZenformedSidebarBrandingProps): string | undefined {
  const appIcon = props.appIconSrc?.trim();
  if (appIcon) return appIcon;
  const legacyLogo = props.logoUrl?.trim();
  if (legacyLogo) return legacyLogo;
  return undefined;
}

export function ZenformedSidebarBranding(props: ZenformedSidebarBrandingProps): ReactElement {
  const { classNames, appAltText, brandingLoading } = props;
  const displayName = resolveSidebarDisplayName(props);
  const initialFallback = displayName.charAt(0).toUpperCase() || 'Z';
  const alt = appAltText?.trim() || displayName || 'App';
  const iconSrc = resolveSidebarIconSrc(props);
  const showInitial = !iconSrc && !brandingLoading;

  return (
    <div className={classNames.sidebarAppBranding || undefined} title={displayName || undefined}>
      <div className={classNames.sidebarLogoCircleWrap}>
        <div
          className={classNames.sidebarLogoCircle}
          style={
            iconSrc
              ? undefined
              : brandingLoading
                ? { backgroundColor: 'rgba(148, 163, 184, 0.3)' }
                : { backgroundColor: companyCircleColor(displayName || initialFallback) }
          }
        >
          {iconSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={iconSrc} alt={alt} className={classNames.sidebarLogoImg} />
          ) : showInitial ? (
            <span className={classNames.sidebarLogoInitial} aria-hidden>
              {getCompanyInitial(displayName, initialFallback)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
