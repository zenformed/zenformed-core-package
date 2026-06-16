'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface ZenformedUserAvatarIdentity {
  email?: string | null;
}

export interface ZenformedUserAvatarMeResponse {
  hasPhoto?: boolean;
  avatarRevision?: string | null;
}

export interface UseZenformedUserAvatarOptions {
  getAccessToken?: () => string | null;
  /**
   * Optional in-memory blob cache (BuildCore sessionBlobCache).
   * When omitted, blob URLs are created directly in hook state.
   */
  loadAvatarBlob?: (
    cacheKey: string,
    fetchBlob: () => Promise<Blob | null>
  ) => Promise<string | null>;
  peekAvatarBlob?: (cacheKey: string) => string | null | undefined;
}

export interface UseZenformedUserAvatarResult {
  avatarUrl: string | null;
  hasPhoto: boolean;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

function selfAvatarBlobCacheKey(revision: string): string {
  return `auth-avatar:self:${revision}`;
}

/**
 * Loads current-user avatar via `/api/auth/me` (hasPhoto + avatarRevision) then
 * `/api/auth/avatar?t={avatarRevision}`. Uses server revision for cache busting so
 * production browser caches cannot serve stale bytes after refresh.
 */
export function useZenformedUserAvatar(
  user: ZenformedUserAvatarIdentity | null,
  options: UseZenformedUserAvatarOptions = {}
): UseZenformedUserAvatarResult {
  const { getAccessToken, loadAvatarBlob, peekAvatarBlob } = options;
  const [hasPhoto, setHasPhoto] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarRevision, setAvatarRevision] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const getAccessTokenRef = useRef(getAccessToken);
  getAccessTokenRef.current = getAccessToken;

  const revokeBlobUrl = useCallback(() => {
    if (blobUrlRef.current != null) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  const authHeaders = useCallback((): HeadersInit => {
    const token = getAccessTokenRef.current?.() ?? null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchPhotoStatus = useCallback(async (): Promise<void> => {
    if (!user?.email) {
      setHasPhoto(false);
      setAvatarRevision(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
        headers: authHeaders(),
      });
      const data = (await res.json()) as ZenformedUserAvatarMeResponse;
      setHasPhoto(Boolean(data.hasPhoto));
      const revision =
        typeof data.avatarRevision === 'string' && data.avatarRevision.trim() !== ''
          ? data.avatarRevision.trim()
          : data.hasPhoto
            ? '0'
            : null;
      setAvatarRevision(revision);
    } catch {
      setHasPhoto(false);
      setAvatarRevision(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email, authHeaders]);

  useEffect(() => {
    if (!user?.email) {
      setHasPhoto(false);
      setAvatarRevision(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    void fetchPhotoStatus();
  }, [user?.email, fetchPhotoStatus]);

  useEffect(() => {
    if (!user?.email || !hasPhoto || avatarRevision == null) {
      revokeBlobUrl();
      setAvatarUrl(null);
      return;
    }

    const cacheKey = selfAvatarBlobCacheKey(avatarRevision);
    const cached = peekAvatarBlob?.(cacheKey);
    if (cached !== undefined) {
      revokeBlobUrl();
      setAvatarUrl(cached);
      return;
    }

    let cancelled = false;

    const fetchBlob = async (): Promise<Blob | null> => {
      const res = await fetch(`/api/auth/avatar?t=${encodeURIComponent(avatarRevision)}`, {
        credentials: 'include',
        cache: 'no-store',
        headers: authHeaders(),
      });
      if (!res.ok) return null;
      return res.blob();
    };

    const applyBlobUrl = (url: string | null) => {
      if (cancelled) return;
      if (url == null) {
        revokeBlobUrl();
        setAvatarUrl(null);
        return;
      }
      if (!loadAvatarBlob) {
        revokeBlobUrl();
        blobUrlRef.current = url;
      }
      setAvatarUrl(url);
    };

    if (loadAvatarBlob) {
      void loadAvatarBlob(cacheKey, fetchBlob).then(applyBlobUrl);
    } else {
      void fetchBlob().then((blob) => {
        if (cancelled || blob == null) {
          applyBlobUrl(null);
          return;
        }
        revokeBlobUrl();
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        applyBlobUrl(url);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [user?.email, hasPhoto, avatarRevision, authHeaders, loadAvatarBlob, peekAvatarBlob, revokeBlobUrl]);

  useEffect(() => () => revokeBlobUrl(), [revokeBlobUrl]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchPhotoStatus();
    } finally {
      setIsLoading(false);
    }
  }, [fetchPhotoStatus]);

  return { avatarUrl, hasPhoto, isLoading, refetch };
}
