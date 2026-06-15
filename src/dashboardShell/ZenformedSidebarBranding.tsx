'use client';

import type { ReactElement } from 'react';
import { companyCircleColor, getCompanyInitial } from './brandingUtils';
import type { ZenformedSidebarBrandingProps } from './types';

export function ZenformedSidebarBranding({
  classNames,
  appName,
  appIconSrc,
  appAltText,
}: ZenformedSidebarBrandingProps): ReactElement {
  const displayName = appName.trim();
  const initialFallback = displayName.charAt(0).toUpperCase() || 'Z';
  const alt = appAltText?.trim() || displayName || 'App';

  return (
    <div className={classNames.sidebarAppBranding} title={displayName}>
      <div className={classNames.sidebarLogoCircleWrap}>
        <div
          className={classNames.sidebarLogoCircle}
          style={
            appIconSrc
              ? undefined
              : { backgroundColor: companyCircleColor(displayName || initialFallback) }
          }
        >
          {appIconSrc ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={appIconSrc} alt={alt} className={classNames.sidebarLogoImg} />
          ) : (
            <span className={classNames.sidebarLogoInitial} aria-hidden>
              {getCompanyInitial(displayName, initialFallback)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
