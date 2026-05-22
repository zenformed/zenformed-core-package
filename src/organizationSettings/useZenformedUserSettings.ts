'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  SettingsSaveStatus,
  ZenformedUserSettingsDto,
  ZenformedUserSettingsPatch,
} from './userSettingsTypes';

type SettingsRelayResponse = {
  relay?: string;
  settings?: ZenformedUserSettingsDto;
  error?: string;
  message?: string;
};

function parseSettingsDto(raw: unknown): ZenformedUserSettingsDto | null {
  if (raw == null || typeof raw !== 'object') return null;
  const s = (raw as Record<string, unknown>).settings;
  if (s == null || typeof s !== 'object') return null;
  const o = s as Record<string, unknown>;
  const email = o.email;
  if (email != null && typeof email !== 'string') return null;
  const firstName = o.firstName;
  if (firstName != null && typeof firstName !== 'string') return null;
  const lastName = o.lastName;
  if (lastName != null && typeof lastName !== 'string') return null;
  if (typeof o.marketingEmailOptIn !== 'boolean') return null;
  if (typeof o.smsOptIn !== 'boolean') return null;
  return {
    email: email ?? null,
    firstName: firstName ?? null,
    lastName: lastName ?? null,
    marketingEmailOptIn: o.marketingEmailOptIn,
    smsOptIn: o.smsOptIn,
  };
}

export type UseZenformedUserSettingsOptions = {
  readonly settingsApiUrl: string;
  readonly getAccessToken: () => string | null | undefined;
  readonly enabled?: boolean;
};

export type UseZenformedUserSettingsResult = {
  readonly settings: ZenformedUserSettingsDto | null;
  readonly isLoading: boolean;
  readonly loadError: string | null;
  readonly hasLiveData: boolean;
  readonly accountSaveStatus: SettingsSaveStatus;
  readonly notificationsSaveStatus: SettingsSaveStatus;
  readonly saveErrorMessage: string | null;
  readonly refetch: () => Promise<void>;
  readonly saveAccount: (payload: { firstName: string; lastName: string }) => Promise<boolean>;
  readonly saveNotifications: (payload: {
    marketingEmailOptIn: boolean;
    smsOptIn: boolean;
  }) => Promise<boolean>;
};

export function useZenformedUserSettings({
  settingsApiUrl,
  getAccessToken,
  enabled = true,
}: UseZenformedUserSettingsOptions): UseZenformedUserSettingsResult {
  const [settings, setSettings] = useState<ZenformedUserSettingsDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLiveData, setHasLiveData] = useState(false);
  const [accountSaveStatus, setAccountSaveStatus] = useState<SettingsSaveStatus>('idle');
  const [notificationsSaveStatus, setNotificationsSaveStatus] =
    useState<SettingsSaveStatus>('idle');
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const savedAccountTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedNotificationsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSavedTimer = (ref: typeof savedAccountTimer) => {
    if (ref.current != null) {
      clearTimeout(ref.current);
      ref.current = null;
    }
  };

  const fetchSettings = useCallback(async () => {
    const token = getAccessToken()?.trim();
    if (!token) {
      setLoadError('Not signed in');
      setHasLiveData(false);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(settingsApiUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      let json: unknown;
      try {
        json = await res.json();
      } catch {
        setLoadError('Invalid response from server');
        setHasLiveData(false);
        return;
      }
      if (!res.ok) {
        const msg =
          typeof (json as Record<string, unknown>)?.message === 'string'
            ? String((json as Record<string, unknown>).message)
            : `Failed to load settings (${res.status})`;
        setLoadError(msg);
        setHasLiveData(false);
        return;
      }
      const body = json as SettingsRelayResponse;
      if (body.relay === 'client_supabase_deprecated') {
        setLoadError('Platform settings API is not configured');
        setHasLiveData(false);
        return;
      }
      const parsed = parseSettingsDto(json);
      if (parsed == null) {
        setLoadError('Invalid settings payload');
        setHasLiveData(false);
        return;
      }
      setSettings(parsed);
      setHasLiveData(true);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load settings';
      setLoadError(message);
      setHasLiveData(false);
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken, settingsApiUrl]);

  useEffect(() => {
    if (!enabled) return;
    void fetchSettings();
  }, [enabled, fetchSettings]);

  useEffect(
    () => () => {
      clearSavedTimer(savedAccountTimer);
      clearSavedTimer(savedNotificationsTimer);
    },
    []
  );

  const patchSettings = useCallback(
    async (patch: ZenformedUserSettingsPatch, section: 'account' | 'notifications') => {
      const token = getAccessToken()?.trim();
      if (!token) {
        setSaveErrorMessage('Not signed in');
        return false;
      }
      const setStatus =
        section === 'account' ? setAccountSaveStatus : setNotificationsSaveStatus;
      const timerRef = section === 'account' ? savedAccountTimer : savedNotificationsTimer;
      setStatus('saving');
      setSaveErrorMessage(null);
      try {
        const res = await fetch(settingsApiUrl, {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(patch),
        });
        let json: unknown;
        try {
          json = await res.json();
        } catch {
          setSaveErrorMessage('Invalid response from server');
          setStatus('error');
          return false;
        }
        if (!res.ok) {
          const msg =
            typeof (json as Record<string, unknown>)?.message === 'string'
              ? String((json as Record<string, unknown>).message)
              : `Save failed (${res.status})`;
          setSaveErrorMessage(msg);
          setStatus('error');
          return false;
        }
        const parsed = parseSettingsDto(json);
        if (parsed != null) {
          setSettings(parsed);
          setHasLiveData(true);
        }
        setStatus('saved');
        clearSavedTimer(timerRef);
        timerRef.current = setTimeout(() => setStatus('idle'), 2000);
        return true;
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Save failed';
        setSaveErrorMessage(message);
        setStatus('error');
        return false;
      }
    },
    [getAccessToken, settingsApiUrl]
  );

  const saveAccount = useCallback(
    async (payload: { firstName: string; lastName: string }) =>
      patchSettings(
        {
          firstName: payload.firstName.trim() || null,
          lastName: payload.lastName.trim() || null,
        },
        'account'
      ),
    [patchSettings]
  );

  const saveNotifications = useCallback(
    async (payload: { marketingEmailOptIn: boolean; smsOptIn: boolean }) =>
      patchSettings(
        {
          marketingEmailOptIn: payload.marketingEmailOptIn,
          smsOptIn: payload.smsOptIn,
        },
        'notifications'
      ),
    [patchSettings]
  );

  return {
    settings,
    isLoading,
    loadError,
    hasLiveData,
    accountSaveStatus,
    notificationsSaveStatus,
    saveErrorMessage,
    refetch: fetchSettings,
    saveAccount,
    saveNotifications,
  };
}
