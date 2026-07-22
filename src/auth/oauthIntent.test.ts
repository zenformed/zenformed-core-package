import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildZenformedOAuthIntent,
  consumeZenformedOAuthIntent,
  isZenformedOAuthIntentExpired,
  saveZenformedOAuthIntent,
  ZENFORMED_OAUTH_INTENT_STORAGE_KEY,
} from './oauthIntent';
import { sanitizeAuthReturnPath } from './sanitizeAuthReturnPath';
import { extractGoogleProfileNames, mergeProfileNamesFromGoogle } from './googleProfileMetadata';
import { resolvePostAuthRedirectTarget } from './authEntryQueryParams';

describe('sanitizeAuthReturnPath', () => {
  it('accepts relative internal paths', () => {
    assert.equal(sanitizeAuthReturnPath('/dashboard'), '/dashboard');
    assert.equal(sanitizeAuthReturnPath('/accept-invite?token=abc'), '/accept-invite?token=abc');
  });

  it('rejects unsafe return paths', () => {
    assert.equal(sanitizeAuthReturnPath('https://evil.example'), null);
    assert.equal(sanitizeAuthReturnPath('//evil.example'), null);
    assert.equal(sanitizeAuthReturnPath('/\\evil'), null);
    assert.equal(sanitizeAuthReturnPath('dashboard'), null);
  });
});

describe('oauth intent', () => {
  it('serializes and sanitizes fields', () => {
    const intent = buildZenformedOAuthIntent({
      app: 'buildcore',
      plan: 'pro',
      returnTo: '/dashboard',
      redirect: 'https://evil.example',
      inviteToken: ' inv-1 ',
      checkoutContinuation: ' cart-1 ',
    }, 1_000);
    assert.deepEqual(intent, {
      app: 'buildcore',
      plan: 'pro',
      returnTo: '/dashboard',
      redirect: null,
      inviteToken: 'inv-1',
      checkoutContinuation: 'cart-1',
      createdAt: 1_000,
    });
  });

  it('expires after the TTL', () => {
    const intent = buildZenformedOAuthIntent({ returnTo: '/dashboard' }, 0);
    assert.equal(isZenformedOAuthIntentExpired(intent, 11 * 60 * 1000), true);
    assert.equal(isZenformedOAuthIntentExpired(intent, 5 * 60 * 1000), false);
  });

  it('saves and consumes from sessionStorage when available', () => {
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

    saveZenformedOAuthIntent({
      app: 'buildcore',
      returnTo: '/accept-invite?token=t1',
      redirect: '//bad',
    });
    assert.ok(store.has(ZENFORMED_OAUTH_INTENT_STORAGE_KEY));
    const consumed = consumeZenformedOAuthIntent(Date.now());
    assert.equal(consumed?.app, 'buildcore');
    assert.equal(consumed?.returnTo, '/accept-invite?token=t1');
    assert.equal(consumed?.redirect, null);
    assert.equal(store.has(ZENFORMED_OAUTH_INTENT_STORAGE_KEY), false);
  });
});

describe('google profile metadata', () => {
  it('prefers given/family names', () => {
    assert.deepEqual(
      extractGoogleProfileNames({ given_name: 'Ada', family_name: 'Lovelace' }),
      { firstName: 'Ada', lastName: 'Lovelace' }
    );
  });

  it('splits full_name when given/family missing', () => {
    assert.deepEqual(extractGoogleProfileNames({ full_name: 'Grace Hopper' }), {
      firstName: 'Grace',
      lastName: 'Hopper',
    });
  });

  it('does not overwrite existing non-empty profile names', () => {
    const merged = mergeProfileNamesFromGoogle({
      existingFirstName: 'Existing',
      existingLastName: null,
      userMetadata: { given_name: 'Google', family_name: 'User' },
    });
    assert.deepEqual(merged, {
      firstName: 'Existing',
      lastName: 'User',
      changed: true,
    });
  });
});

describe('resolvePostAuthRedirectTarget', () => {
  it('rejects unsafe return paths and uses default', () => {
    assert.equal(
      resolvePostAuthRedirectTarget(
        { app: null, plan: null, returnTo: 'https://evil.example', redirect: null },
        '/dashboard'
      ),
      '/dashboard'
    );
  });
});
