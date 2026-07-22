'use client';

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { createPresenceActivityController } from './activityDetection';
import {
  aggregatePresenceByUserId,
  parsePresenceClientState,
} from './aggregateUserPresence';
import {
  fetchPresenceStatusMode,
  savePresenceStatusMode,
} from './presencePreferenceApi';
import {
  createPresenceClientId,
  deriveEffectiveStatusFromPreference,
  organizationPresenceTopic,
  PRESENCE_RECONNECT_GRACE_MS,
  PRESENCE_TRACK_THROTTLE_MS,
  type PresenceAutomaticState,
  type PresenceClientState,
  type PresenceEffectiveStatus,
  type PresenceStatusMode,
} from './types';

export type ZenformedPresenceContextValue = {
  readonly ready: boolean;
  readonly statusMode: PresenceStatusMode;
  readonly setStatusMode: (mode: PresenceStatusMode) => Promise<void>;
  readonly effectiveByUserId: ReadonlyMap<string, PresenceEffectiveStatus>;
  readonly getEffectiveStatus: (userId: string) => PresenceEffectiveStatus;
  readonly currentUserId: string | null;
  readonly currentEffectiveStatus: PresenceEffectiveStatus;
};

const ZenformedPresenceContext = createContext<ZenformedPresenceContextValue | null>(null);

export type ZenformedPresenceProviderProps = {
  readonly supabase: SupabaseClient | null;
  readonly userId: string | null | undefined;
  readonly organizationId: string | null | undefined;
  readonly appSlug: string;
  readonly enabled?: boolean;
  readonly children: ReactNode;
};

const PRESENCE_DEBUG =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

function presenceDebug(...args: unknown[]): void {
  if (PRESENCE_DEBUG) {
    // Temporary development tracing for Realtime Presence → avatar status.
    console.info('[zenformed-presence]', ...args);
  }
}

function flattenPresenceState(state: Record<string, unknown>): PresenceClientState[] {
  const clients: PresenceClientState[] = [];
  for (const value of Object.values(state)) {
    const metas = Array.isArray(value)
      ? value
      : value != null &&
          typeof value === 'object' &&
          Array.isArray((value as { metas?: unknown }).metas)
        ? (value as { metas: unknown[] }).metas
        : [value];
    for (const meta of metas) {
      const parsed = parsePresenceClientState(meta);
      if (parsed) {
        clients.push(parsed);
      } else if (PRESENCE_DEBUG && meta != null) {
        presenceDebug('skip unparsable presence meta', meta);
      }
    }
  }
  return clients;
}

function mapToObject(map: ReadonlyMap<string, PresenceEffectiveStatus>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of map) out[key] = value;
  return out;
}

export function ZenformedPresenceProvider({
  supabase,
  userId,
  organizationId,
  appSlug,
  enabled = true,
  children,
}: ZenformedPresenceProviderProps): ReactElement {
  const normalizedUserId = userId?.trim() || null;
  const normalizedOrgId = organizationId?.trim() || null;
  const normalizedAppSlug = appSlug.trim() || 'unknown';
  const active =
    enabled &&
    supabase != null &&
    normalizedUserId != null &&
    normalizedOrgId != null &&
    normalizedAppSlug.length > 0;

  const clientIdRef = useRef<string>(createPresenceClientId());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const trackedRef = useRef(false);
  const lastTrackAtRef = useRef(0);
  const lastPayloadRef = useRef<PresenceClientState | null>(null);
  const lastSentRef = useRef<{
    statusMode: PresenceStatusMode;
    automaticState: PresenceAutomaticState;
  } | null>(null);
  const clearGraceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusModeRef = useRef<PresenceStatusMode>('automatic');
  const automaticStateRef = useRef<PresenceAutomaticState>('online');
  const usingPrivateRef = useRef(true);

  const [ready, setReady] = useState(false);
  const [statusMode, setStatusModeState] = useState<PresenceStatusMode>('automatic');
  const [automaticState, setAutomaticState] = useState<PresenceAutomaticState>('online');
  const [effectiveByUserId, setEffectiveByUserId] = useState<
    ReadonlyMap<string, PresenceEffectiveStatus>
  >(() => new Map());

  statusModeRef.current = statusMode;
  automaticStateRef.current = automaticState;

  const applyPresenceClients = useCallback(
    (clients: readonly PresenceClientState[], soft = false) => {
      const local = lastPayloadRef.current;
      const merged =
        local != null
          ? [
              ...clients.filter((client) => client.clientId !== local.clientId),
              local,
            ]
          : [...clients];
      const next = new Map(aggregatePresenceByUserId(merged));
      // Always publish local preference for self — dots must not wait on Realtime echo.
      if (normalizedUserId) {
        next.set(
          normalizedUserId,
          deriveEffectiveStatusFromPreference(
            statusModeRef.current,
            automaticStateRef.current
          )
        );
      }
      presenceDebug('aggregated status by userId', mapToObject(next), {
        clientCount: merged.length,
        soft,
      });
      setEffectiveByUserId((prev) => {
        if (soft && next.size === 0 && prev.size > 0) return prev;
        return next;
      });
    },
    [normalizedUserId]
  );

  const publishLocalSelfStatus = useCallback(() => {
    if (!normalizedUserId) return;
    const selfStatus = deriveEffectiveStatusFromPreference(
      statusModeRef.current,
      automaticStateRef.current
    );
    presenceDebug('publishLocalSelfStatus', {
      userId: normalizedUserId,
      statusMode: statusModeRef.current,
      automaticState: automaticStateRef.current,
      selfStatus,
    });
    setEffectiveByUserId((prev) => {
      if (prev.get(normalizedUserId) === selfStatus && prev.size > 0) return prev;
      const next = new Map(prev);
      next.set(normalizedUserId, selfStatus);
      return next;
    });
  }, [normalizedUserId]);

  const trackPresence = useCallback(
    async (force = false): Promise<void> => {
      if (!normalizedUserId) return;

      const payload: PresenceClientState = {
        userId: normalizedUserId,
        appSlug: normalizedAppSlug,
        clientId: clientIdRef.current,
        automaticState: automaticStateRef.current,
        statusMode: statusModeRef.current,
        lastActiveAt: new Date().toISOString(),
      };

      // Always update local self status from preference (avatar must follow selector/DB).
      lastPayloadRef.current = payload;
      publishLocalSelfStatus();

      const channel = channelRef.current;
      if (!channel || !trackedRef.current) {
        presenceDebug('track skipped (local status published)', {
          hasChannel: !!channel,
          tracked: trackedRef.current,
          userId: normalizedUserId,
          statusMode: payload.statusMode,
        });
        return;
      }

      const now = Date.now();
      const lastSent = lastSentRef.current;
      if (
        !force &&
        now - lastTrackAtRef.current < PRESENCE_TRACK_THROTTLE_MS &&
        lastSent != null &&
        lastSent.automaticState === payload.automaticState &&
        lastSent.statusMode === payload.statusMode
      ) {
        return;
      }

      lastTrackAtRef.current = now;
      lastSentRef.current = {
        statusMode: payload.statusMode,
        automaticState: payload.automaticState,
      };
      applyPresenceClients(
        flattenPresenceState(
          (channel.presenceState() as Record<string, unknown>) ?? {}
        ),
        false
      );

      try {
        const trackResult = await channel.track(payload);
        presenceDebug('channel.track result', trackResult, {
          statusMode: payload.statusMode,
          automaticState: payload.automaticState,
          userId: payload.userId,
          clientId: payload.clientId,
        });
        applyPresenceClients(
          flattenPresenceState(
            (channel.presenceState() as Record<string, unknown>) ?? {}
          ),
          false
        );
      } catch (error) {
        presenceDebug('channel.track error', error);
      }
    },
    [
      applyPresenceClients,
      normalizedAppSlug,
      normalizedUserId,
      publishLocalSelfStatus,
    ]
  );

  useEffect(() => {
    if (!enabled || !supabase || !normalizedUserId) {
      if (!normalizedUserId) {
        setStatusModeState('automatic');
        setReady(false);
      }
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const mode = await fetchPresenceStatusMode(supabase, normalizedUserId);
        if (!cancelled) {
          setStatusModeState(mode);
          setReady(true);
          presenceDebug('loaded statusMode preference', mode, { userId: normalizedUserId });
        }
      } catch (error) {
        presenceDebug('load statusMode preference failed', error);
        if (!cancelled) {
          setStatusModeState('automatic');
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, normalizedUserId, supabase]);

  // Preference → avatar: never wait on Realtime for the logged-in user.
  useEffect(() => {
    if (!normalizedUserId) return;
    publishLocalSelfStatus();
  }, [normalizedUserId, statusMode, automaticState, publishLocalSelfStatus]);

  useEffect(() => {
    if (!enabled || !normalizedUserId) return;
    const controller = createPresenceActivityController({
      onAutomaticStateChange: (state) => {
        setAutomaticState(state);
      },
    });
    setAutomaticState(controller.getAutomaticState());
    return () => controller.dispose();
  }, [enabled, normalizedUserId]);

  useEffect(() => {
    if (!active || !supabase || !normalizedOrgId || !normalizedUserId) {
      presenceDebug('channel effect idle', {
        active,
        orgId: normalizedOrgId,
        userId: normalizedUserId,
      });
      return;
    }

    let cancelled = false;
    let channel: RealtimeChannel | null = null;
    let subscribeGeneration = 0;
    let privateFallbackStarted = false;
    const topic = organizationPresenceTopic(normalizedOrgId);

    const refreshFromChannel = (soft = false): void => {
      if (!channel) return;
      const state = channel.presenceState() as Record<string, unknown>;
      presenceDebug('raw presenceState', state);
      applyPresenceClients(flattenPresenceState(state), soft);
    };

    const attachPresenceHandlers = (target: RealtimeChannel): void => {
      target
        .on('presence', { event: 'sync' }, () => {
          if (clearGraceTimerRef.current) {
            clearTimeout(clearGraceTimerRef.current);
            clearGraceTimerRef.current = null;
          }
          refreshFromChannel(false);
        })
        .on('presence', { event: 'join' }, () => {
          refreshFromChannel(false);
        })
        .on('presence', { event: 'leave' }, () => {
          refreshFromChannel(false);
        });
    };

    const ensureRealtimeAuth = async (): Promise<void> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token?.trim();
      if (!token) {
        presenceDebug('realtime.setAuth skipped — no session token');
        return;
      }
      // Private channels require the JWT on the Realtime socket (RLS on realtime.messages).
      await supabase.realtime.setAuth(token);
      presenceDebug('realtime.setAuth ok', {
        userId: session?.user?.id ?? null,
        tokenLength: token.length,
      });
    };

    const startChannel = async (usePrivate: boolean): Promise<void> => {
      if (cancelled) return;
      usingPrivateRef.current = usePrivate;
      const generation = ++subscribeGeneration;

      if (channel) {
        trackedRef.current = false;
        channelRef.current = null;
        try {
          await channel.untrack();
        } catch {
          // ignore
        }
        await supabase.removeChannel(channel);
        channel = null;
      }

      await ensureRealtimeAuth();
      if (cancelled || generation !== subscribeGeneration) return;

      channel = supabase.channel(topic, {
        config: {
          private: usePrivate,
          // One presence slot per user so the latest statusMode/automaticState wins.
          presence: { key: normalizedUserId },
        },
      });
      channelRef.current = channel;
      trackedRef.current = false;
      attachPresenceHandlers(channel);
      presenceDebug('subscribing', { topic, private: usePrivate, clientId: clientIdRef.current });

      channel.subscribe(async (status, err) => {
        if (cancelled || generation !== subscribeGeneration) return;
        presenceDebug('channel subscription status', status, err ?? null, {
          topic,
          private: usingPrivateRef.current,
        });

        if (status === 'SUBSCRIBED') {
          trackedRef.current = true;
          await trackPresence(true);
          refreshFromChannel(false);
          return;
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          trackedRef.current = false;
          if (
            status === 'CHANNEL_ERROR' &&
            usePrivate &&
            !privateFallbackStarted &&
            !cancelled
          ) {
            privateFallbackStarted = true;
            presenceDebug(
              'private channel failed — retrying as public presence topic',
              err ?? null
            );
            void startChannel(false);
            return;
          }
          if (clearGraceTimerRef.current) clearTimeout(clearGraceTimerRef.current);
          clearGraceTimerRef.current = setTimeout(() => {
            if (!cancelled && !trackedRef.current && generation === subscribeGeneration) {
              applyPresenceClients([], true);
            }
          }, PRESENCE_RECONNECT_GRACE_MS);
        }
      });
    };

    void startChannel(false);

    return () => {
      cancelled = true;
      if (clearGraceTimerRef.current) {
        clearTimeout(clearGraceTimerRef.current);
        clearGraceTimerRef.current = null;
      }
      trackedRef.current = false;
      channelRef.current = null;
      const closing = channel;
      channel = null;
      if (closing) {
        void closing.untrack().finally(() => {
          void supabase.removeChannel(closing);
        });
      }
    };
  }, [
    active,
    applyPresenceClients,
    normalizedOrgId,
    normalizedUserId,
    supabase,
    trackPresence,
  ]);

  useEffect(() => {
    if (!active) return;
    void trackPresence(true);
  }, [active, automaticState, statusMode, trackPresence]);

  const setStatusMode = useCallback(
    async (mode: PresenceStatusMode): Promise<void> => {
      if (!supabase || !normalizedUserId) return;
      setStatusModeState(mode);
      try {
        const saved = await savePresenceStatusMode(supabase, normalizedUserId, mode);
        setStatusModeState(saved);
      } catch {
        // Keep optimistic local mode; next load will reconcile.
      }
      await trackPresence(true);
    },
    [normalizedUserId, supabase, trackPresence]
  );

  const getEffectiveStatus = useCallback(
    (id: string): PresenceEffectiveStatus => {
      const key = id.trim();
      if (!key) return 'offline';
      if (normalizedUserId && key === normalizedUserId) {
        return deriveEffectiveStatusFromPreference(statusMode, automaticState);
      }
      return effectiveByUserId.get(key) ?? 'offline';
    },
    [automaticState, effectiveByUserId, normalizedUserId, statusMode]
  );

  const currentEffectiveStatus = useMemo((): PresenceEffectiveStatus => {
    if (!normalizedUserId) return 'offline';
    return deriveEffectiveStatusFromPreference(statusMode, automaticState);
  }, [automaticState, normalizedUserId, statusMode]);

  useEffect(() => {
    if (!PRESENCE_DEBUG) return;
    presenceDebug('currentEffectiveStatus', currentEffectiveStatus, {
      userId: normalizedUserId,
      statusMode,
      ready: active && ready,
    });
  }, [active, currentEffectiveStatus, normalizedUserId, ready, statusMode]);

  const value = useMemo<ZenformedPresenceContextValue>(
    () => ({
      ready,
      statusMode,
      setStatusMode,
      effectiveByUserId,
      getEffectiveStatus,
      currentUserId: normalizedUserId,
      currentEffectiveStatus,
    }),
    [
      ready,
      statusMode,
      setStatusMode,
      effectiveByUserId,
      getEffectiveStatus,
      normalizedUserId,
      currentEffectiveStatus,
    ]
  );

  return createElement(ZenformedPresenceContext.Provider, { value }, children);
}

export function useZenformedPresenceOptional(): ZenformedPresenceContextValue | null {
  return useContext(ZenformedPresenceContext);
}

export function useZenformedPresence(): ZenformedPresenceContextValue {
  const value = useZenformedPresenceOptional();
  if (value == null) {
    throw new Error('useZenformedPresence must be used within ZenformedPresenceProvider');
  }
  return value;
}

export function useOrganizationPresence(): {
  readonly ready: boolean;
  readonly effectiveByUserId: ReadonlyMap<string, PresenceEffectiveStatus>;
  readonly getEffectiveStatus: (userId: string) => PresenceEffectiveStatus;
} {
  const presence = useZenformedPresenceOptional();
  return {
    ready: presence?.ready ?? false,
    effectiveByUserId: presence?.effectiveByUserId ?? new Map(),
    getEffectiveStatus: presence?.getEffectiveStatus ?? (() => 'offline' as const),
  };
}

const lastUserPresenceLog = new Map<string, PresenceEffectiveStatus>();

export function useUserPresence(userId: string | null | undefined): PresenceEffectiveStatus {
  const presence = useZenformedPresenceOptional();
  const id = userId?.trim() || '';
  if (!id || presence == null) {
    if (PRESENCE_DEBUG && id && lastUserPresenceLog.get(id) !== 'offline') {
      lastUserPresenceLog.set(id, 'offline');
      presenceDebug('useUserPresence fallback offline — no provider', { userId: id });
    }
    return 'offline';
  }
  const status = presence.getEffectiveStatus(id);
  if (PRESENCE_DEBUG && lastUserPresenceLog.get(id) !== status) {
    lastUserPresenceLog.set(id, status);
    presenceDebug('useUserPresence', { userId: id, status });
  }
  return status;
}
