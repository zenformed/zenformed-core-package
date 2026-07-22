import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  appendSessionEndToLoginUrl,
  classifySupabaseAuthInvalidation,
  consumeSessionEndReason,
  getSessionEndMessage,
  markVoluntarySignOut,
  parseSessionEndReasonParam,
  peekSessionEndReason,
  recordSessionInvalidation,
  resolveSessionEndMessageForLogin,
  saveSessionEndReason,
  ZENFORMED_SESSION_END_QUERY_PARAM,
  ZENFORMED_SESSION_END_SKIP_KEY,
  ZENFORMED_SESSION_END_STORAGE_KEY,
} from './sessionInvalidation';

function installMemorySessionStorage(): Map<string, string> {
  const store = new Map<string, string>();
  (globalThis as { sessionStorage?: Storage }).sessionStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  };
  return store;
}

describe('classifySupabaseAuthInvalidation', () => {
  it('detects single-session / revoked refresh signals', () => {
    assert.equal(
      classifySupabaseAuthInvalidation({ message: 'Invalid Refresh Token: Refresh Token Not Found' }),
      'single_session'
    );
    assert.equal(
      classifySupabaseAuthInvalidation({ code: 'session_not_found', message: 'Session from session_id claim in JWT does not exist' }),
      'single_session'
    );
  });

  it('detects expired and inactive signals', () => {
    assert.equal(classifySupabaseAuthInvalidation({ message: 'JWT expired' }), 'expired');
    assert.equal(
      classifySupabaseAuthInvalidation({ message: 'Session terminated due to inactivity' }),
      'inactive'
    );
  });
});

describe('session end storage and login messaging', () => {
  it('saves, peeks, and consumes reasons', () => {
    const store = installMemorySessionStorage();
    saveSessionEndReason('expired');
    assert.ok(store.has(ZENFORMED_SESSION_END_STORAGE_KEY));
    assert.equal(peekSessionEndReason(), 'expired');
    assert.equal(consumeSessionEndReason(), 'expired');
    assert.equal(consumeSessionEndReason(), null);
  });

  it('skips messaging after voluntary sign-out', () => {
    installMemorySessionStorage();
    saveSessionEndReason('single_session');
    markVoluntarySignOut();
    assert.equal(peekSessionEndReason(), null);
    assert.equal(consumeSessionEndReason(), null);
  });

  it('resolves login message from query or storage', () => {
    installMemorySessionStorage();
    assert.equal(
      resolveSessionEndMessageForLogin('inactive'),
      getSessionEndMessage('inactive')
    );
    recordSessionInvalidation({ message: 'JWT expired' });
    assert.equal(
      resolveSessionEndMessageForLogin(null),
      getSessionEndMessage('expired')
    );
  });

  it('appends sessionEnd to login URLs', () => {
    installMemorySessionStorage();
    saveSessionEndReason('single_session');
    const url = appendSessionEndToLoginUrl('/login?returnTo=%2Fdashboard');
    assert.ok(url.includes(`${ZENFORMED_SESSION_END_QUERY_PARAM}=single_session`));
    assert.ok(url.includes('returnTo='));
  });

  it('parses only known reason params', () => {
    assert.equal(parseSessionEndReasonParam('single_session'), 'single_session');
    assert.equal(parseSessionEndReasonParam('nope'), null);
  });

  it('clears skip key on consume after voluntary mark', () => {
    const store = installMemorySessionStorage();
    markVoluntarySignOut();
    assert.equal(store.get(ZENFORMED_SESSION_END_SKIP_KEY), '1');
    consumeSessionEndReason();
    assert.equal(store.has(ZENFORMED_SESSION_END_SKIP_KEY), false);
  });
});
