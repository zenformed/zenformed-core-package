/** Presence status types shared by Platform and BuildCore. */

export const PRESENCE_STATUS_MODES = [
  'automatic',
  'online',
  'away',
  'busy',
  'appear_offline',
] as const;

export type PresenceStatusMode = (typeof PRESENCE_STATUS_MODES)[number];

export const PRESENCE_EFFECTIVE_STATUSES = ['online', 'away', 'busy', 'offline'] as const;

export type PresenceEffectiveStatus = (typeof PRESENCE_EFFECTIVE_STATUSES)[number];

export type PresenceAutomaticState = 'online' | 'away';

export type PresenceClientState = {
  readonly userId: string;
  readonly appSlug: string;
  readonly clientId: string;
  readonly automaticState: PresenceAutomaticState;
  readonly statusMode: PresenceStatusMode;
  readonly lastActiveAt: string;
};

export const PRESENCE_AWAY_AFTER_MS = 5 * 60 * 1000;
export const PRESENCE_ACTIVITY_THROTTLE_MS = 15_000;
export const PRESENCE_TRACK_THROTTLE_MS = 30_000;
export const PRESENCE_RECONNECT_GRACE_MS = 4_000;

export const PRESENCE_STATUS_MODE_LABELS: Record<PresenceStatusMode, string> = {
  automatic: 'Automatic',
  online: 'Online',
  away: 'Away',
  busy: 'Busy',
  appear_offline: 'Appear offline',
};

export const PRESENCE_EFFECTIVE_STATUS_LABELS: Record<PresenceEffectiveStatus, string> = {
  online: 'Online',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline',
};

export function isPresenceStatusMode(value: unknown): value is PresenceStatusMode {
  return (
    typeof value === 'string' &&
    (PRESENCE_STATUS_MODES as readonly string[]).includes(value)
  );
}

export function parsePresenceStatusMode(
  value: unknown,
  fallback: PresenceStatusMode = 'automatic'
): PresenceStatusMode {
  return isPresenceStatusMode(value) ? value : fallback;
}

export function organizationPresenceTopic(organizationId: string): string {
  return `organization-presence:${organizationId.trim()}`;
}

export function createPresenceClientId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `client-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
