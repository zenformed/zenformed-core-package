import {
  PRESENCE_ACTIVITY_THROTTLE_MS,
  PRESENCE_AWAY_AFTER_MS,
  type PresenceAutomaticState,
} from './types';

export type PresenceActivityController = {
  readonly getAutomaticState: () => PresenceAutomaticState;
  readonly dispose: () => void;
};

/**
 * Tracks user activity and emits automatic online/away transitions.
 * Activity events are throttled; becoming online is immediate after idle away.
 */
export function createPresenceActivityController(input: {
  readonly awayAfterMs?: number;
  readonly throttleMs?: number;
  readonly onAutomaticStateChange: (state: PresenceAutomaticState) => void;
  readonly target?: Document | null;
  readonly win?: Window | null;
}): PresenceActivityController {
  const awayAfterMs = input.awayAfterMs ?? PRESENCE_AWAY_AFTER_MS;
  const throttleMs = input.throttleMs ?? PRESENCE_ACTIVITY_THROTTLE_MS;
  const doc = input.target ?? (typeof document !== 'undefined' ? document : null);
  const win = input.win ?? (typeof window !== 'undefined' ? window : null);

  let automaticState: PresenceAutomaticState = 'online';
  let lastActivityAt = Date.now();
  let lastHandledAt = 0;
  let awayTimer: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;

  const setState = (next: PresenceAutomaticState): void => {
    if (disposed || next === automaticState) return;
    automaticState = next;
    input.onAutomaticStateChange(next);
  };

  const scheduleAway = (): void => {
    if (awayTimer != null) clearTimeout(awayTimer);
    const remaining = Math.max(0, awayAfterMs - (Date.now() - lastActivityAt));
    awayTimer = setTimeout(() => {
      awayTimer = null;
      if (Date.now() - lastActivityAt >= awayAfterMs) {
        setState('away');
      } else {
        scheduleAway();
      }
    }, remaining);
  };

  const noteActivity = (force = false): void => {
    if (disposed) return;
    const now = Date.now();
    if (!force && now - lastHandledAt < throttleMs && automaticState === 'online') {
      lastActivityAt = now;
      scheduleAway();
      return;
    }
    lastHandledAt = now;
    lastActivityAt = now;
    setState('online');
    scheduleAway();
  };

  const onVisibility = (): void => {
    if (doc?.visibilityState === 'visible') {
      noteActivity(true);
    }
  };

  const onFocus = (): void => {
    noteActivity(true);
  };

  const onPointer = (): void => {
    noteActivity(false);
  };

  const onKey = (): void => {
    noteActivity(false);
  };

  const onScroll = (): void => {
    noteActivity(false);
  };

  if (doc) {
    doc.addEventListener('pointerdown', onPointer, { passive: true });
    doc.addEventListener('mousemove', onPointer, { passive: true });
    doc.addEventListener('keydown', onKey, { passive: true });
    doc.addEventListener('touchstart', onPointer, { passive: true });
    doc.addEventListener('scroll', onScroll, { passive: true, capture: true });
    doc.addEventListener('visibilitychange', onVisibility);
  }
  if (win) {
    win.addEventListener('focus', onFocus);
  }

  scheduleAway();

  return {
    getAutomaticState: () => automaticState,
    dispose: () => {
      disposed = true;
      if (awayTimer != null) clearTimeout(awayTimer);
      if (doc) {
        doc.removeEventListener('pointerdown', onPointer);
        doc.removeEventListener('mousemove', onPointer);
        doc.removeEventListener('keydown', onKey);
        doc.removeEventListener('touchstart', onPointer);
        doc.removeEventListener('scroll', onScroll, true);
        doc.removeEventListener('visibilitychange', onVisibility);
      }
      if (win) {
        win.removeEventListener('focus', onFocus);
      }
    },
  };
}
