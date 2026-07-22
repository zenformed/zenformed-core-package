import type {
  PresenceClientState,
  PresenceEffectiveStatus,
  PresenceStatusMode,
} from './types';

/**
 * Aggregate every connected client for one user into a single effective status.
 *
 * Rules (in order):
 * 1. No connections → offline
 * 2. appear_offline (any client) → offline
 * 3. busy (any connection) → busy
 * 4. manual online (any connection) → online
 * 5. manual away (any connection) → away
 * 6. automatic with any active (online) client → online
 * 7. automatic with only away clients → away
 */
export function aggregateUserPresence(
  clients: readonly PresenceClientState[]
): PresenceEffectiveStatus {
  if (clients.length === 0) return 'offline';

  const modes = new Set(clients.map((client) => client.statusMode));

  if (modes.has('appear_offline')) return 'offline';
  if (modes.has('busy')) return 'busy';
  if (modes.has('online')) return 'online';
  if (modes.has('away')) return 'away';

  // Remaining clients should be automatic (or unknown treated as automatic).
  const automaticClients = clients.filter(
    (client) => client.statusMode === 'automatic' || !isManualMode(client.statusMode)
  );
  if (automaticClients.some((client) => client.automaticState === 'online')) {
    return 'online';
  }
  if (automaticClients.length > 0) return 'away';

  return 'offline';
}

function isManualMode(mode: PresenceStatusMode): boolean {
  return mode === 'online' || mode === 'away' || mode === 'busy' || mode === 'appear_offline';
}

/**
 * Build a map of userId → effective status from raw presence client rows.
 */
export function aggregatePresenceByUserId(
  clients: readonly PresenceClientState[]
): ReadonlyMap<string, PresenceEffectiveStatus> {
  const byUser = new Map<string, PresenceClientState[]>();
  for (const client of clients) {
    const userId = client.userId.trim();
    if (!userId) continue;
    const list = byUser.get(userId);
    if (list) list.push(client);
    else byUser.set(userId, [client]);
  }

  const result = new Map<string, PresenceEffectiveStatus>();
  for (const [userId, userClients] of byUser) {
    result.set(userId, aggregateUserPresence(userClients));
  }
  return result;
}

export function parsePresenceClientState(raw: unknown): PresenceClientState | null {
  if (raw == null || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  // Some Realtime payloads nest custom fields; unwrap a single level if needed.
  const nested =
    row.payload != null && typeof row.payload === 'object'
      ? (row.payload as Record<string, unknown>)
      : null;
  const source = nested ?? row;

  const userId =
    typeof source.userId === 'string'
      ? source.userId.trim()
      : typeof source.user_id === 'string'
        ? source.user_id.trim()
        : '';
  const appSlug =
    typeof source.appSlug === 'string'
      ? source.appSlug.trim()
      : typeof source.app_slug === 'string'
        ? source.app_slug.trim()
        : '';
  const clientId =
    typeof source.clientId === 'string'
      ? source.clientId.trim()
      : typeof source.client_id === 'string'
        ? source.client_id.trim()
        : '';
  const automaticStateRaw = source.automaticState ?? source.automatic_state;
  const automaticState =
    automaticStateRaw === 'online' || automaticStateRaw === 'away' ? automaticStateRaw : null;
  const statusModeRaw = source.statusMode ?? source.status_mode;
  const statusMode =
    statusModeRaw === 'automatic' ||
    statusModeRaw === 'online' ||
    statusModeRaw === 'away' ||
    statusModeRaw === 'busy' ||
    statusModeRaw === 'appear_offline'
      ? statusModeRaw
      : null;
  const lastActiveRaw = source.lastActiveAt ?? source.last_active_at;
  const lastActiveAt =
    typeof lastActiveRaw === 'string'
      ? lastActiveRaw
      : typeof lastActiveRaw === 'number'
        ? new Date(lastActiveRaw).toISOString()
        : '';

  if (!userId || !appSlug || !clientId || !automaticState || !statusMode || !lastActiveAt) {
    return null;
  }

  return {
    userId,
    appSlug,
    clientId,
    automaticState,
    statusMode,
    lastActiveAt,
  };
}
