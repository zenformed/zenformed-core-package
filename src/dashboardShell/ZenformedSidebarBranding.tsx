'use client';

import type { ReactElement } from 'react';
import { companyCircleColor, getCompanyInitial } from './brandingUtils';
import type { ZenformedSidebarBrandingProps } from './types';
import { ZenformedSidebarBrandingCameraIcon } from './ZenformedSidebarBrandingCameraIcon';

export function ZenformedSidebarBranding({
  classNames,
  shopName,
  defaultShopNameFallback,
  logoUrl,
  brandingLoading,
  logoUploading,
  showCameraButton,
  fileInputRef,
  onLogoFileChange,
  companyLogoChangeTitle,
  companyLogoChangeAriaLabel,
  cameraIcon,
}: ZenformedSidebarBrandingProps): ReactElement {
  const displayName = shopName || defaultShopNameFallback;
  const initialFallback = defaultShopNameFallback.trim().charAt(0).toUpperCase() || 'Z';

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
        onChange={onLogoFileChange}
        className={classNames.accountMenuLogoFileInput}
        aria-hidden
        tabIndex={-1}
        style={{ position: 'absolute', left: -9999 }}
      />
      <div className={classNames.sidebarLogoCircleWrap}>
        <div
          className={classNames.sidebarLogoCircle}
          style={
            brandingLoading
              ? { backgroundColor: 'rgba(148, 163, 184, 0.3)' }
              : !logoUrl
                ? { backgroundColor: companyCircleColor(displayName) }
                : undefined
          }
        >
          {logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={logoUrl} alt="" className={classNames.sidebarLogoImg} />
          ) : !brandingLoading ? (
            <span className={classNames.sidebarLogoInitial} aria-hidden>
              {getCompanyInitial(displayName, initialFallback)}
            </span>
          ) : null}
        </div>
        {showCameraButton && (
          <button
            type="button"
            className={classNames.sidebarLogoCameraBtn}
            onClick={() => fileInputRef.current?.click()}
            disabled={logoUploading}
            title={companyLogoChangeTitle}
            aria-label={companyLogoChangeAriaLabel}
          >
            {cameraIcon ?? <ZenformedSidebarBrandingCameraIcon />}
          </button>
        )}
      </div>
    </>
  );
}
