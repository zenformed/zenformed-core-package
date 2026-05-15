'use client';

import { useCallback, useRef, useState, type ChangeEvent } from 'react';
import type {
  UseOrganizationLogoUploadOptions,
  UseOrganizationLogoUploadResult,
} from './types';

/**
 * Sidebar logo upload via app `POST /api/branding` (Core relay when configured).
 * Apps supply API URL, JWT accessor, and refetch — no direct Core calls from this package.
 */
export function useOrganizationLogoUpload({
  brandingApiUrl,
  getAccessToken,
  refetchBranding,
  logoSaveFailedFallback,
  onUploadError,
}: UseOrganizationLogoUploadOptions): UseOrganizationLogoUploadResult {
  const [logoUploading, setLogoUploading] = useState(false);
  const headerLogoFileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file || file.size === 0) return;
      setLogoUploading(true);
      try {
        const formData = new FormData();
        formData.set('logo', file);
        const token = getAccessToken();
        const headers: HeadersInit = token != null ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(brandingApiUrl, { method: 'POST', body: formData, headers });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error ?? logoSaveFailedFallback);
        }
        await refetchBranding();
      } catch (err) {
        const message = err instanceof Error ? err.message : logoSaveFailedFallback;
        onUploadError?.(message);
      } finally {
        setLogoUploading(false);
      }
    },
    [brandingApiUrl, getAccessToken, refetchBranding, logoSaveFailedFallback, onUploadError]
  );

  return { logoUploading, headerLogoFileInputRef, handleLogoFileChange };
}
