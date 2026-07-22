import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  aggregatePresenceByUserId,
  aggregateUserPresence,
  parsePresenceClientState,
} from './aggregateUserPresence';
import {
  deriveEffectiveStatusFromPreference,
  isPresenceStatusMode,
  parsePresenceStatusMode,
} from './types';
import type { PresenceClientState } from './types';

function client(
  overrides: Partial<PresenceClientState> & Pick<PresenceClientState, 'clientId'>
): PresenceClientState {
  return {
    userId: 'user-1',
    appSlug: 'buildcore',
    automaticState: 'online',
    statusMode: 'automatic',
    lastActiveAt: '2026-07-22T15:00:00.000Z',
    ...overrides,
  };
}

describe('aggregateUserPresence', () => {
  it('returns offline when there are no clients', () => {
    assert.equal(aggregateUserPresence([]), 'offline');
  });

  it('uses the newest lastActiveAt client as source of truth', () => {
    assert.equal(
      aggregateUserPresence([
        client({
          clientId: 'stale-busy',
          statusMode: 'busy',
          lastActiveAt: '2026-07-22T15:00:00.000Z',
        }),
        client({
          clientId: 'fresh-automatic',
          statusMode: 'automatic',
          automaticState: 'online',
          lastActiveAt: '2026-07-22T15:01:00.000Z',
        }),
      ]),
      'online'
    );
  });

  it('appear_offline on the newest client wins', () => {
    assert.equal(
      aggregateUserPresence([
        client({
          clientId: 'a',
          statusMode: 'online',
          lastActiveAt: '2026-07-22T15:00:00.000Z',
        }),
        client({
          clientId: 'b',
          statusMode: 'appear_offline',
          lastActiveAt: '2026-07-22T15:02:00.000Z',
        }),
      ]),
      'offline'
    );
  });

  it('returns online for manual online', () => {
    assert.equal(
      aggregateUserPresence([client({ clientId: 'a', statusMode: 'online', automaticState: 'away' })]),
      'online'
    );
  });

  it('returns away for manual away', () => {
    assert.equal(
      aggregateUserPresence([client({ clientId: 'a', statusMode: 'away', automaticState: 'online' })]),
      'away'
    );
  });

  it('automatic: newest active client → online', () => {
    assert.equal(
      aggregateUserPresence([
        client({
          clientId: 'a',
          statusMode: 'automatic',
          automaticState: 'away',
          lastActiveAt: '2026-07-22T15:00:00.000Z',
        }),
        client({
          clientId: 'b',
          statusMode: 'automatic',
          automaticState: 'online',
          lastActiveAt: '2026-07-22T15:01:00.000Z',
        }),
      ]),
      'online'
    );
  });

  it('automatic: only away clients → away', () => {
    assert.equal(
      aggregateUserPresence([
        client({ clientId: 'a', statusMode: 'automatic', automaticState: 'away' }),
        client({ clientId: 'b', statusMode: 'automatic', automaticState: 'away' }),
      ]),
      'away'
    );
  });

  it('aggregates multiple users independently', () => {
    const map = aggregatePresenceByUserId([
      client({ userId: 'u1', clientId: 'a', statusMode: 'busy' }),
      client({ userId: 'u2', clientId: 'b', statusMode: 'automatic', automaticState: 'away' }),
    ]);
    assert.equal(map.get('u1'), 'busy');
    assert.equal(map.get('u2'), 'away');
    assert.equal(map.has('u3'), false);
  });
});

describe('parsePresenceClientState', () => {
  it('parses valid metadata and rejects incomplete rows', () => {
    const ok = parsePresenceClientState({
      userId: 'u1',
      appSlug: 'platform',
      clientId: 'c1',
      automaticState: 'online',
      statusMode: 'automatic',
      lastActiveAt: '2026-07-22T15:00:00.000Z',
    });
    assert.ok(ok);
    assert.equal(ok?.userId, 'u1');
    assert.equal(parsePresenceClientState({ userId: 'u1' }), null);
  });
});

describe('status mode validation', () => {
  it('validates and parses status modes', () => {
    assert.equal(isPresenceStatusMode('automatic'), true);
    assert.equal(isPresenceStatusMode('nope'), false);
    assert.equal(parsePresenceStatusMode('busy'), 'busy');
    assert.equal(parsePresenceStatusMode('nope'), 'automatic');
  });
});

describe('deriveEffectiveStatusFromPreference', () => {
  it('maps manual modes and automatic activity', () => {
    assert.equal(deriveEffectiveStatusFromPreference('online', 'away'), 'online');
    assert.equal(deriveEffectiveStatusFromPreference('away', 'online'), 'away');
    assert.equal(deriveEffectiveStatusFromPreference('busy', 'online'), 'busy');
    assert.equal(deriveEffectiveStatusFromPreference('appear_offline', 'online'), 'offline');
    assert.equal(deriveEffectiveStatusFromPreference('automatic', 'online'), 'online');
    assert.equal(deriveEffectiveStatusFromPreference('automatic', 'away'), 'away');
  });
});
