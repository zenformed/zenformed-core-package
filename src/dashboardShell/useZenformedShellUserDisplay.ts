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
  const [displayName, setDisplayName] = useState(() =>
    user ? resolveAccountMenuDisplayName(user) : ''
  );

  useEffect(() => {
    if (!user) {
      setDisplayName('');
      return;
    }

    const syncName = resolveAccountMenuDisplayName(user);
    if (!enabled || !sessionUserId) {
      setDisplayName(syncName);
      return;
    }

    const token = getAccessToken()?.trim();
    if (!token) {
      setDisplayName(syncName);
      return;
    }

    let cancelled = false;
    if (syncName) {
      setDisplayName(syncName);
    }

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
        const resolved = resolveAccountMenuDisplayName({
          email: user.email,
          displayName: user.displayName,
          firstName:
            settings != null && typeof settings.firstName === 'string'
              ? settings.firstName
              : user.firstName ?? null,
          lastName:
            settings != null && typeof settings.lastName === 'string'
              ? settings.lastName
              : user.lastName ?? null,
        });
        setDisplayName(resolved || syncName);
      })
      .catch(() => {
        if (!cancelled) setDisplayName(syncName);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, getAccessToken, sessionUserId, settingsApiUrl, user]);

  return displayName;
}
