'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  invalidateSessionBlob,
  loadSessionBlob,
} from '../organizationBranding/sessionBlobCache';
import { resolveDefaultTimezone } from './timezoneData';
import type { OrganizationBrandingProfileDto } from './types';
import type { SettingsSaveStatus } from './userSettingsTypes';

type BrandingApiResponse = {
  legalName?: string;
  displayName?: string | null;
  publicDisplayName?: string;
  shopName?: string;
  canEditOrganizationProfile?: boolean;
  hasLogo?: boolean;
  industry?: string | null;
  timezone?: string | null;
  relay?: string;
  error?: string;
  message?: string;
};

function parseBrandingProfile(json: unknown, logoUrl: string | null): OrganizationBrandingProfileDto | null {
  if (json == null || typeof json !== 'object') return null;
  const o = json as BrandingApiResponse;
  if (typeof o.legalName !== 'string') return null;
  if (typeof o.hasLogo !== 'boolean') return null;
  const industry = o.industry;
  const timezone = o.timezone;
  if (industry != null && typeof industry !== 'string') return null;
  if (timezone != null && typeof timezone !== 'string') return null;
  const storedDisplayName =
    o.displayName === null
      ? ''
      : typeof o.displayName === 'string'
        ? o.displayName
        : typeof o.shopName === 'string' && o.legalName !== o.shopName
          ? o.shopName
          : '';
  const publicDisplayName =
    typeof o.publicDisplayName === 'string'
      ? o.publicDisplayName
      : typeof o.shopName === 'string'
        ? o.shopName
        : storedDisplayName.trim() || o.legalName;
  return {
    legalName: o.legalName,
    displayName: storedDisplayName,
    publicDisplayName,
    canEditOrganizationProfile: o.canEditOrganizationProfile === true,
    hasLogo: o.hasLogo,
    industry: industry ?? null,
    timezone: timezone ?? null,
    logoUrl,
  };
}

export type UseZenformedOrganizationBrandingOptions = {
  readonly brandingApiUrl: string;
  readonly brandingLogoApiUrl: string;
  readonly getAccessToken: () => string | null | undefined;
  readonly enabled?: boolean;
};

export type UseZenformedOrganizationBrandingResult = {
  readonly profile: OrganizationBrandingProfileDto | null;
  readonly isLoading: boolean;
  readonly loadError: string | null;
  readonly hasLiveData: boolean;
  readonly profileSaveStatus: SettingsSaveStatus;
  readonly saveErrorMessage: string | null;
  readonly refetch: () => Promise<void>;
  readonly saveOrganizationProfile: (payload: {
    legalName: string;
    displayName: string;
    industry: string | null;
    timezone: string | null;
  }) => Promise<boolean>;
};

export function useZenformedOrganizationBranding({
  brandingApiUrl,
  brandingLogoApiUrl,
  getAccessToken,
  enabled = true,
}: UseZenformedOrganizationBrandingOptions): UseZenformedOrganizationBrandingResult {
  const [profile, setProfile] = useState<OrganizationBrandingProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLiveData, setHasLiveData] = useState(false);
  const [profileSaveStatus, setProfileSaveStatus] = useState<SettingsSaveStatus>('idle');
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

const ORGANIZATION_SETTINGS_LOGO_CACHE_KEY = 'branding-logo:organization-settings';

  const fetchLogoBlob = useCallback(
    async (token: string, hasLogo: boolean): Promise<string | null> => {
      if (!hasLogo) return null;
      invalidateSessionBlob(ORGANIZATION_SETTINGS_LOGO_CACHE_KEY);
      return loadSessionBlob(ORGANIZATION_SETTINGS_LOGO_CACHE_KEY, async () => {
        try {
          const res = await fetch(brandingLogoApiUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) return null;
          return res.blob();
        } catch {
          return null;
        }
      });
    },
    [brandingLogoApiUrl]
  );

  const fetchBranding = useCallback(async () => {
    const token = getAccessToken()?.trim();
    if (!token) {
      setLoadError('Not signed in');
      setHasLiveData(false);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(brandingApiUrl, {
        cache: 'no-store',
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      });
      let json: unknown;
      try {
        json = await res.json();
      } catch {
        setLoadError('Invalid branding response');
        setHasLiveData(false);
        return;
      }
      if (!res.ok) {
        const msg =
          typeof (json as BrandingApiResponse)?.message === 'string'
            ? String((json as BrandingApiResponse).message)
            : `Failed to load organization profile (${res.status})`;
        setLoadError(msg);
        setHasLiveData(false);
        return;
      }
      const body = json as BrandingApiResponse;
      if (body.relay === 'client_supabase_deprecated') {
        setLoadError('Organization branding API is not configured');
        setHasLiveData(false);
        return;
      }
      const logoUrl = await fetchLogoBlob(token, Boolean(body.hasLogo));
      const parsed = parseBrandingProfile(json, logoUrl);
      if (parsed == null) {
        setLoadError('Invalid organization profile payload');
        setHasLiveData(false);
        return;
      }
      setProfile({
        ...parsed,
        timezone: resolveDefaultTimezone(parsed.timezone),
      });
      setHasLiveData(true);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load organization profile');
      setHasLiveData(false);
    } finally {
      setIsLoading(false);
    }
  }, [brandingApiUrl, fetchLogoBlob, getAccessToken]);

  useEffect(() => {
    if (!enabled) return;
    void fetchBranding();
  }, [enabled, fetchBranding]);

  const saveOrganizationProfile = useCallback(
    async (payload: {
      legalName: string;
      displayName: string;
      industry: string | null;
      timezone: string | null;
    }) => {
      if (profile?.canEditOrganizationProfile !== true) {
        setSaveErrorMessage('You do not have permission to edit organization settings.');
        return false;
      }
      const token = getAccessToken()?.trim();
      if (!token) {
        setSaveErrorMessage('Not signed in');
        return false;
      }
      setProfileSaveStatus('saving');
      setSaveErrorMessage(null);
      try {
        const trimmedLegal = payload.legalName.trim();
        const trimmedDisplay = payload.displayName.trim();
        const res = await fetch(brandingApiUrl, {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            legalName: trimmedLegal,
            displayName: trimmedDisplay.length > 0 ? trimmedDisplay : '',
            industry: payload.industry,
            timezone: payload.timezone,
          }),
        });
        let json: unknown;
        try {
          json = await res.json();
        } catch {
          setSaveErrorMessage('Invalid response from server');
          setProfileSaveStatus('error');
          return false;
        }
        if (!res.ok) {
          const msg =
            typeof (json as BrandingApiResponse)?.message === 'string'
              ? String((json as BrandingApiResponse).message)
              : `Save failed (${res.status})`;
          setSaveErrorMessage(msg);
          setProfileSaveStatus('error');
          return false;
        }
        await fetchBranding();
        setProfileSaveStatus('saved');
        setTimeout(() => setProfileSaveStatus('idle'), 2000);
        return true;
      } catch (e) {
        setSaveErrorMessage(e instanceof Error ? e.message : 'Save failed');
        setProfileSaveStatus('error');
        return false;
      }
    },
    [brandingApiUrl, fetchBranding, getAccessToken, profile?.canEditOrganizationProfile]
  );

  return {
    profile,
    isLoading,
    loadError,
    hasLiveData,
    profileSaveStatus,
    saveErrorMessage,
    refetch: fetchBranding,
    saveOrganizationProfile,
  };
}
