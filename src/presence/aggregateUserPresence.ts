import type {
  PresenceClientState,
  PresenceEffectiveStatus,
} from './types';
import { deriveEffectiveStatusFromPreference } from './types';

function lastActiveMs(client: PresenceClientState): number {
  const ms = Date.parse(client.lastActiveAt);
  return Number.isFinite(ms) ? ms : 0;
}

/**
 * Aggregate every connected client for one user into a single effective status.
 *
 * Uses the newest `lastActiveAt` client as source of truth so switching to
 * Automatic (or any mode) on the active window immediately beats a stale
 * Busy/Online track from another tab or app.
 */
export function aggregateUserPresence(
  clients: readonly PresenceClientState[]
): PresenceEffectiveStatus {
  if (clients.length === 0) return 'offline';

  let newest = clients[0]!;
  for (let i = 1; i < clients.length; i += 1) {
    const candidate = clients[i]!;
    if (lastActiveMs(candidate) >= lastActiveMs(newest)) {
      newest = candidate;
    }
  }

  return deriveEffectiveStatusFromPreference(newest.statusMode, newest.automaticState);
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
