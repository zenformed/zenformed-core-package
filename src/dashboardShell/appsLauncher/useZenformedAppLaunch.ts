'use client';

import { useCallback, useState } from 'react';

function readErrorMessage(json: unknown, fallback: string): string {
  if (json != null && typeof json === 'object') {
    const o = json as Record<string, unknown>;
    if (typeof o.message === 'string' && o.message.trim()) return o.message;
    if (typeof o.error === 'string' && o.error.trim()) return o.error;
  }
  return fallback;
}

export type UseZenformedAppLaunchOptions = {
  readonly launchApiUrl: string;
  readonly getAccessToken: () => string | null | undefined;
};

export type UseZenformedAppLaunchResult = {
  launchApp: (targetApp: string, returnPath?: string) => Promise<void>;
  launchingAppId: string | null;
  launchError: string | null;
  clearLaunchError: () => void;
};

export function useZenformedAppLaunch({
  launchApiUrl,
  getAccessToken,
}: UseZenformedAppLaunchOptions): UseZenformedAppLaunchResult {
  const [launchingAppId, setLaunchingAppId] = useState<string | null>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const clearLaunchError = useCallback(() => {
    setLaunchError(null);
  }, []);

  const launchApp = useCallback(
    async (targetApp: string, returnPath = '/dashboard'): Promise<void> => {
      const accessToken = getAccessToken()?.trim();
      if (!accessToken) {
        setLaunchingAppId(null);
        setLaunchError('Sign in to open apps.');
        return;
      }

      setLaunchingAppId(targetApp);
      setLaunchError(null);
      try {
        const res = await fetch(launchApiUrl, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ targetApp, returnPath }),
        });
        const json: unknown = await res.json();
        if (!res.ok) {
          setLaunchingAppId(null);
          setLaunchError(readErrorMessage(json, 'Could not open app.'));
          return;
        }
        if (
          json != null &&
          typeof json === 'object' &&
          typeof (json as { launchUrl?: string }).launchUrl === 'string'
        ) {
          window.location.assign((json as { launchUrl: string }).launchUrl);
          return;
        }
        setLaunchingAppId(null);
        setLaunchError('Could not open app.');
      } catch {
        setLaunchingAppId(null);
        setLaunchError('Could not open app.');
      }
    },
    [getAccessToken, launchApiUrl]
  );

  return {
    launchApp,
    launchingAppId,
    launchError,
    clearLaunchError,
  };
}
