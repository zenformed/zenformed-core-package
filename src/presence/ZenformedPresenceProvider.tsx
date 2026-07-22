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
      if (parsed) clients.push(parsed);
    }
  }
  return clients;
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
  const clearGraceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusModeRef = useRef<PresenceStatusMode>('automatic');
  const automaticStateRef = useRef<PresenceAutomaticState>('online');

  const [ready, setReady] = useState(false);
  const [statusMode, setStatusModeState] = useState<PresenceStatusMode>('automatic');
  const [automaticState, setAutomaticState] = useState<PresenceAutomaticState>('online');
  const [effectiveByUserId, setEffectiveByUserId] = useState<
    ReadonlyMap<string, PresenceEffectiveStatus>
  >(() => new Map());

  statusModeRef.current = statusMode;
  automaticStateRef.current = automaticState;

  const applyPresenceClients = useCallback((clients: readonly PresenceClientState[], soft = false) => {
    const next = aggregatePresenceByUserId(clients);
    setEffectiveByUserId((prev) => {
      if (soft && next.size === 0 && prev.size > 0) return prev;
      return next;
    });
  }, []);

  const trackPresence = useCallback(async (force = false): Promise<void> => {
    const channel = channelRef.current;
    if (!channel || !trackedRef.current || !normalizedUserId) return;

    const payload: PresenceClientState = {
      userId: normalizedUserId,
      appSlug: normalizedAppSlug,
      clientId: clientIdRef.current,
      automaticState: automaticStateRef.current,
      statusMode: statusModeRef.current,
      lastActiveAt: new Date().toISOString(),
    };

    const now = Date.now();
    const prev = lastPayloadRef.current;
    const unchanged =
      prev != null &&
      prev.automaticState === payload.automaticState &&
      prev.statusMode === payload.statusMode;
    if (!force && unchanged && now - lastTrackAtRef.current < PRESENCE_TRACK_THROTTLE_MS) {
      return;
    }

    lastTrackAtRef.current = now;
    lastPayloadRef.current = payload;
    try {
      await channel.track(payload);
    } catch {
      // Reconnect path will re-track.
    }
  }, [normalizedAppSlug, normalizedUserId]);

  useEffect(() => {
    if (!active || !supabase || !normalizedUserId) {
      setStatusModeState('automatic');
      setReady(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const mode = await fetchPresenceStatusMode(supabase, normalizedUserId);
        if (!cancelled) {
          setStatusModeState(mode);
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          setStatusModeState('automatic');
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [active, normalizedUserId, supabase]);

  useEffect(() => {
    if (!active) return;
    const controller = createPresenceActivityController({
      onAutomaticStateChange: (state) => {
        setAutomaticState(state);
      },
    });
    setAutomaticState(controller.getAutomaticState());
    return () => controller.dispose();
  }, [active]);

  useEffect(() => {
    if (!active || !supabase || !normalizedOrgId || !normalizedUserId) {
      return;
    }

    let cancelled = false;
    const topic = organizationPresenceTopic(normalizedOrgId);
    const channel = supabase.channel(topic, {
      config: {
        private: true,
        presence: { key: clientIdRef.current },
      },
    });
    channelRef.current = channel;
    trackedRef.current = false;

    const refreshFromChannel = (soft = false): void => {
      const state = channel.presenceState();
      applyPresenceClients(flattenPresenceState(state as Record<string, unknown>), soft);
    };

    channel
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

    void channel.subscribe(async (status) => {
      if (cancelled) return;
      if (status === 'SUBSCRIBED') {
        trackedRef.current = true;
        await trackPresence(true);
        refreshFromChannel(false);
        return;
      }
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        trackedRef.current = false;
        if (clearGraceTimerRef.current) clearTimeout(clearGraceTimerRef.current);
        clearGraceTimerRef.current = setTimeout(() => {
          if (!cancelled && !trackedRef.current) {
            applyPresenceClients([], true);
          }
        }, PRESENCE_RECONNECT_GRACE_MS);
      }
    });

    return () => {
      cancelled = true;
      if (clearGraceTimerRef.current) {
        clearTimeout(clearGraceTimerRef.current);
        clearGraceTimerRef.current = null;
      }
      trackedRef.current = false;
      channelRef.current = null;
      void channel.untrack().finally(() => {
        void supabase.removeChannel(channel);
      });
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
      return effectiveByUserId.get(key) ?? 'offline';
    },
    [effectiveByUserId]
  );

  const currentEffectiveStatus = useMemo((): PresenceEffectiveStatus => {
    if (!normalizedUserId) return 'offline';
    return getEffectiveStatus(normalizedUserId);
  }, [getEffectiveStatus, normalizedUserId]);

  const value = useMemo<ZenformedPresenceContextValue>(
    () => ({
      ready: active && ready,
      statusMode,
      setStatusMode,
      effectiveByUserId,
      getEffectiveStatus,
      currentUserId: normalizedUserId,
      currentEffectiveStatus,
    }),
    [
      active,
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

export function useUserPresence(userId: string | null | undefined): PresenceEffectiveStatus {
  const presence = useZenformedPresenceOptional();
  const id = userId?.trim() || '';
  if (!id || presence == null) return 'offline';
  return presence.getEffectiveStatus(id);
}
