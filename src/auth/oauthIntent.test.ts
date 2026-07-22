import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildZenformedOAuthIntent,
  consumeZenformedOAuthIntent,
  isZenformedOAuthIntentExpired,
  saveZenformedOAuthIntent,
  ZENFORMED_OAUTH_INTENT_STORAGE_KEY,
} from './oauthIntent';
import {
  isAuthEntryReturnPath,
  sanitizeAuthReturnPath,
  sanitizePostAuthDestination,
} from './sanitizeAuthReturnPath';
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

describe('sanitizePostAuthDestination', () => {
  it('rejects auth-entry pages', () => {
    assert.equal(sanitizePostAuthDestination('/login'), null);
    assert.equal(sanitizePostAuthDestination('/register'), null);
    assert.equal(sanitizePostAuthDestination('/register?plan=pro'), null);
    assert.equal(sanitizePostAuthDestination('/auth/google'), null);
    assert.equal(sanitizePostAuthDestination('/auth/callback'), null);
    assert.equal(sanitizePostAuthDestination('/forgot-password'), null);
    assert.equal(sanitizePostAuthDestination('/reset-password'), null);
    assert.equal(isAuthEntryReturnPath('/login'), true);
  });

  it('keeps business destinations', () => {
    assert.equal(sanitizePostAuthDestination('/dashboard'), '/dashboard');
    assert.equal(sanitizePostAuthDestination('/cart'), '/cart');
    assert.equal(sanitizePostAuthDestination('/checkout/success'), '/checkout/success');
    assert.equal(
      sanitizePostAuthDestination('/accept-invite?token=abc'),
      '/accept-invite?token=abc'
    );
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

  it('drops auth-entry returnTo when building intent', () => {
    const intent = buildZenformedOAuthIntent({
      returnTo: '/register',
      redirect: '/login',
    });
    assert.equal(intent.returnTo, null);
    assert.equal(intent.redirect, null);
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

  it('clears malformed intent and yields null', () => {
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

    store.set(ZENFORMED_OAUTH_INTENT_STORAGE_KEY, '{not-json');
    assert.equal(consumeZenformedOAuthIntent(), null);
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

  it('login Google with no continuation → dashboard', () => {
    assert.equal(
      resolvePostAuthRedirectTarget(
        { app: null, plan: null, returnTo: null, redirect: null },
        '/dashboard'
      ),
      '/dashboard'
    );
  });

  it('register Google with no continuation → dashboard', () => {
    assert.equal(
      resolvePostAuthRedirectTarget(
        { app: null, plan: null, returnTo: null, redirect: null },
        '/dashboard'
      ),
      '/dashboard'
    );
  });

  it('stale intent containing /register → dashboard', () => {
    assert.equal(
      resolvePostAuthRedirectTarget(
        { app: null, plan: null, returnTo: '/register', redirect: null },
        '/dashboard'
      ),
      '/dashboard'
    );
  });

  it('malformed intent paths → dashboard', () => {
    assert.equal(
      resolvePostAuthRedirectTarget(
        { app: null, plan: null, returnTo: '//evil', redirect: '/login' },
        '/dashboard'
      ),
      '/dashboard'
    );
  });

  it('BuildCore handoff params keep app and business returnTo', () => {
    const target = resolvePostAuthRedirectTarget(
      {
        app: 'buildcore',
        plan: null,
        returnTo: '/reports/map',
        redirect: null,
      },
      '/dashboard'
    );
    assert.equal(target, '/reports/map');
  });

  it('invite continuation path is preserved', () => {
    assert.equal(
      resolvePostAuthRedirectTarget(
        {
          app: 'buildcore',
          plan: null,
          returnTo: '/accept-invite?token=abc',
          redirect: null,
        },
        '/dashboard'
      ),
      '/accept-invite?token=abc'
    );
  });

  it('cart continuation is preserved', () => {
    assert.equal(
      resolvePostAuthRedirectTarget(
        { app: null, plan: null, returnTo: '/cart', redirect: null },
        '/dashboard'
      ),
      '/cart'
    );
  });
});
