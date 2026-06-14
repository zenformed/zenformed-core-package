'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { isBrandingRelayUnreachable, parseBrandingRelayBody } from './brandingRelay';
import {
  brandingLogoCacheKey,
  invalidateSessionBlob,
  loadSessionBlob,
  peekSessionBlobUrl,
} from './sessionBlobCache';
import { invalidateSessionRequestCache, runSessionRequestCached } from './sessionRequestCache';
import type {
  ZenformedOrganizationBrandingProviderProps,
  ZenformedOrganizationBrandingShellState,
} from './types';

const CORE_PLATFORM_REFETCH_COOLDOWN_MS = 30_000;

const BrandingShellContext = createContext<ZenformedOrganizationBrandingShellState | null>(null);

function brandingAuthHeaders(accessToken: string | null): HeadersInit {
  return accessToken != null ? { Authorization: `Bearer ${accessToken}` } : {};
}

function deferNonCriticalWork(fn: () => void): () => void {
  if (typeof requestAnimationFrame === 'function') {
    const id = requestAnimationFrame(() => fn());
    return () => cancelAnimationFrame(id);
  }
  const id = globalThis.setTimeout(fn, 0);
  return () => clearTimeout(id);
}

function createCooldownGate(cooldownMs: number): { canRun: boolean; markRan: () => void } {
  let lastRan = 0;
  return {
    canRun: Date.now() - lastRan >= cooldownMs,
    markRan: () => {
      lastRan = Date.now();
    },
  };
}

export function ZenformedOrganizationBrandingProvider({
  children,
  defaultDisplayNameFallback,
  brandingApiUrl = '/api/branding',
  brandingLogoApiUrl = '/api/branding/logo',
  getAccessToken,
  sessionUserId,
  requireAuthForLogo = false,
  corePlatformAvailable = false,
}: ZenformedOrganizationBrandingProviderProps & { children: ReactNode }): ReactElement {
  const accessTokenRef = useRef<string | null>(null);
  accessTokenRef.current = getAccessToken();

  const [shopName, setShopName] = useState<string>(defaultDisplayNameFallback);
  const [hasLogo, setHasLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logoVersion, setLogoVersion] = useState(0);
  const coreUnreachableRef = useRef(false);
  const refetchCooldownRef = useRef(createCooldownGate(CORE_PLATFORM_REFETCH_COOLDOWN_MS));
  const cachedBrandingRef = useRef<{ shopName: string; hasLogo: boolean } | null>(null);

  const applyCachedBranding = useCallback(() => {
    if (cachedBrandingRef.current != null) {
      setShopName(cachedBrandingRef.current.shopName);
      setHasLogo(cachedBrandingRef.current.hasLogo);
      return;
    }
    setShopName(defaultDisplayNameFallback);
    setHasLogo(false);
  }, [defaultDisplayNameFallback]);

  const fetchBrandingMeta = useCallback(
    async (options?: { force?: boolean }) => {
      if (coreUnreachableRef.current) {
        if (!options?.force || !refetchCooldownRef.current.canRun) {
          applyCachedBranding();
          return;
        }
        refetchCooldownRef.current.markRan();
      }

      const token = accessTokenRef.current;
      const cacheKey = `branding:meta:${sessionUserId ?? 'anonymous'}`;
      try {
        await runSessionRequestCached(
          cacheKey,
          async () => {
            const res = await fetch(brandingApiUrl, {
              cache: 'no-store',
              headers: brandingAuthHeaders(token),
            });
            let body: Record<string, unknown> = {};
            try {
              body = (await res.json()) as Record<string, unknown>;
            } catch {
              body = {};
            }
            const relay = parseBrandingRelayBody(body);
            if (isBrandingRelayUnreachable(res, relay)) {
              coreUnreachableRef.current = true;
              applyCachedBranding();
              return null;
            }
            coreUnreachableRef.current = false;
            const data = res.ok ? body : {};
            const nextShopName =
              typeof data.shopName === 'string' ? data.shopName : defaultDisplayNameFallback;
            const nextHasLogo = Boolean(data.hasLogo);
            cachedBrandingRef.current = { shopName: nextShopName, hasLogo: nextHasLogo };
            setShopName(nextShopName);
            setHasLogo(nextHasLogo);
            return { shopName: nextShopName, hasLogo: nextHasLogo };
          },
          { force: options?.force }
        );
      } catch {
        applyCachedBranding();
      }
    },
    [applyCachedBranding, brandingApiUrl, defaultDisplayNameFallback, sessionUserId]
  );

  useEffect(() => {
    if (coreUnreachableRef.current || !hasLogo) {
      setLogoUrl(null);
      return;
    }
    if (requireAuthForLogo && accessTokenRef.current == null) {
      setLogoUrl(null);
      return;
    }

    const cacheKey = brandingLogoCacheKey(sessionUserId, logoVersion);
    const cached = peekSessionBlobUrl(cacheKey);
    if (cached !== undefined) {
      setLogoUrl(cached);
      return;
    }

    let cancelled = false;
    const cancelDefer = deferNonCriticalWork(() => {
      const token = accessTokenRef.current;
      const logoUrlWithVersion = `${brandingLogoApiUrl}${brandingLogoApiUrl.includes('?') ? '&' : '?'}t=${logoVersion}`;
      void loadSessionBlob(cacheKey, async () => {
        const res = await fetch(logoUrlWithVersion, {
          cache: 'no-store',
          headers: brandingAuthHeaders(token),
        });
        if (!res.ok) return null;
        return res.blob();
      }).then((url) => {
        if (!cancelled) setLogoUrl(url);
      });
    });

    return () => {
      cancelled = true;
      cancelDefer();
    };
  }, [brandingLogoApiUrl, hasLogo, logoVersion, requireAuthForLogo, sessionUserId]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    invalidateSessionRequestCache(`branding:meta:${sessionUserId ?? 'anonymous'}`);
    invalidateSessionBlob(brandingLogoCacheKey(sessionUserId, logoVersion));
    await fetchBrandingMeta({ force: true });
    setLogoVersion((v) => v + 1);
    setIsLoading(false);
  }, [fetchBrandingMeta, logoVersion, sessionUserId]);

  useEffect(() => {
    if (corePlatformAvailable) {
      coreUnreachableRef.current = false;
    }
  }, [corePlatformAvailable]);

  useEffect(() => {
    if (!sessionUserId) {
      coreUnreachableRef.current = false;
      cachedBrandingRef.current = null;
      setShopName(defaultDisplayNameFallback);
      setHasLogo(false);
      setLogoUrl(null);
      setIsLoading(false);
      return;
    }
    if (coreUnreachableRef.current && !refetchCooldownRef.current.canRun) {
      applyCachedBranding();
      return;
    }
    setIsLoading(true);
    return deferNonCriticalWork(() => {
      void fetchBrandingMeta().finally(() => {
        setIsLoading(false);
      });
    });
  }, [applyCachedBranding, fetchBrandingMeta, sessionUserId, corePlatformAvailable]);

  const value: ZenformedOrganizationBrandingShellState = {
    shopName,
    logoUrl,
    hasLogo,
    isLoading,
    refetch,
  };

  return <BrandingShellContext.Provider value={value}>{children}</BrandingShellContext.Provider>;
}

export function useZenformedOrganizationBrandingShell(): ZenformedOrganizationBrandingShellState {
  const ctx = useContext(BrandingShellContext);
  if (ctx == null) {
    throw new Error(
      'useZenformedOrganizationBrandingShell must be used within ZenformedOrganizationBrandingProvider'
    );
  }
  return ctx;
}
