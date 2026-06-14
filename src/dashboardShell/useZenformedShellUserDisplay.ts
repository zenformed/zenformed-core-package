'use client';

import { useEffect, useState } from 'react';
import {
  resolveAccountMenuDisplayName,
  type AccountMenuUserIdentity,
} from './accountMenuUtils';

export type UseZenformedShellUserDisplayOptions = {
  readonly settingsApiUrl: string;
  readonly getAccessToken: () => string | null;
  readonly sessionUserId: string | null;
  readonly user: AccountMenuUserIdentity | null;
  readonly enabled?: boolean;
};

export function useZenformedShellUserDisplay({
  settingsApiUrl,
  getAccessToken,
  sessionUserId,
  user,
  enabled = true,
}: UseZenformedShellUserDisplayOptions): string {
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (!user) {
      setDisplayName('');
      return;
    }

    const fallback = resolveAccountMenuDisplayName(user);
    if (!enabled || !sessionUserId) {
      setDisplayName(fallback);
      return;
    }

    const token = getAccessToken()?.trim();
    if (!token) {
      setDisplayName(fallback);
      return;
    }

    let cancelled = false;
    setDisplayName(fallback);

    void fetch(settingsApiUrl, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) return null;
        try {
          return (await res.json()) as Record<string, unknown>;
        } catch {
          return null;
        }
      })
      .then((json) => {
        if (cancelled) return;
        const settings =
          json != null && typeof json.settings === 'object'
            ? (json.settings as Record<string, unknown>)
            : null;
        if (settings == null) {
          setDisplayName(fallback);
          return;
        }
        setDisplayName(
          resolveAccountMenuDisplayName({
            email: user.email,
            displayName: user.displayName,
            firstName: typeof settings.firstName === 'string' ? settings.firstName : null,
            lastName: typeof settings.lastName === 'string' ? settings.lastName : null,
          })
        );
      })
      .catch(() => {
        if (!cancelled) setDisplayName(fallback);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, getAccessToken, sessionUserId, settingsApiUrl, user]);

  return displayName;
}
