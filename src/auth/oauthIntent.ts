import type { AuthEntryQueryParams } from './authEntryQueryParams';
import { sanitizeAuthReturnPath } from './sanitizeAuthReturnPath';

export const ZENFORMED_OAUTH_INTENT_STORAGE_KEY = 'zenformed-oauth-intent';
export const ZENFORMED_OAUTH_INTENT_TTL_MS = 10 * 60 * 1000;

export type ZenformedOAuthIntent = {
  readonly app: string | null;
  readonly plan: string | null;
  readonly returnTo: string | null;
  readonly redirect: string | null;
  /** Invite accept token when OAuth started from an invite flow. */
  readonly inviteToken: string | null;
  /** Opaque checkout/cart continuation hint already used by Platform login. */
  readonly checkoutContinuation: string | null;
  readonly createdAt: number;
};

export type SaveZenformedOAuthIntentInput = {
  readonly app?: string | null;
  readonly plan?: string | null;
  readonly returnTo?: string | null;
  readonly redirect?: string | null;
  readonly inviteToken?: string | null;
  readonly checkoutContinuation?: string | null;
};

function readOptionalTrimmed(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Builds a validated OAuth intent payload (does not touch storage). */
export function buildZenformedOAuthIntent(
  input: SaveZenformedOAuthIntentInput,
  nowMs: number = Date.now()
): ZenformedOAuthIntent {
  return {
    app: readOptionalTrimmed(input.app),
    plan: readOptionalTrimmed(input.plan),
    returnTo: sanitizeAuthReturnPath(input.returnTo),
    redirect: sanitizeAuthReturnPath(input.redirect),
    inviteToken: readOptionalTrimmed(input.inviteToken),
    checkoutContinuation: readOptionalTrimmed(input.checkoutContinuation),
    createdAt: nowMs,
  };
}

export function isZenformedOAuthIntentExpired(
  intent: Pick<ZenformedOAuthIntent, 'createdAt'>,
  nowMs: number = Date.now(),
  ttlMs: number = ZENFORMED_OAUTH_INTENT_TTL_MS
): boolean {
  if (!Number.isFinite(intent.createdAt)) return true;
  return nowMs - intent.createdAt > ttlMs;
}

function parseIntent(raw: unknown): ZenformedOAuthIntent | null {
  if (raw == null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.createdAt !== 'number' || !Number.isFinite(o.createdAt)) return null;
  return buildZenformedOAuthIntent({
    app: typeof o.app === 'string' ? o.app : null,
    plan: typeof o.plan === 'string' ? o.plan : null,
    returnTo: typeof o.returnTo === 'string' ? o.returnTo : null,
    redirect: typeof o.redirect === 'string' ? o.redirect : null,
    inviteToken: typeof o.inviteToken === 'string' ? o.inviteToken : null,
    checkoutContinuation:
      typeof o.checkoutContinuation === 'string' ? o.checkoutContinuation : null,
  }, o.createdAt);
}

export function saveZenformedOAuthIntent(input: SaveZenformedOAuthIntentInput): ZenformedOAuthIntent {
  const intent = buildZenformedOAuthIntent(input);
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(ZENFORMED_OAUTH_INTENT_STORAGE_KEY, JSON.stringify(intent));
  }
  return intent;
}

export function saveZenformedOAuthIntentFromAuthEntry(
  params: AuthEntryQueryParams,
  extra?: {
    readonly inviteToken?: string | null;
    readonly checkoutContinuation?: string | null;
  }
): ZenformedOAuthIntent {
  return saveZenformedOAuthIntent({
    app: params.app,
    plan: params.plan,
    returnTo: params.returnTo,
    redirect: params.redirect,
    inviteToken: extra?.inviteToken,
    checkoutContinuation: extra?.checkoutContinuation,
  });
}

/**
 * Reads, validates, and removes the saved OAuth intent.
 * Expired or invalid payloads are discarded.
 */
export function consumeZenformedOAuthIntent(
  nowMs: number = Date.now()
): ZenformedOAuthIntent | null {
  if (typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(ZENFORMED_OAUTH_INTENT_STORAGE_KEY);
  sessionStorage.removeItem(ZENFORMED_OAUTH_INTENT_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = parseIntent(JSON.parse(raw) as unknown);
    if (parsed == null) return null;
    if (isZenformedOAuthIntentExpired(parsed, nowMs)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearZenformedOAuthIntent(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(ZENFORMED_OAUTH_INTENT_STORAGE_KEY);
}

/** Maps a consumed intent back to AuthEntryQueryParams for existing redirect/handoff helpers. */
export function authEntryParamsFromOAuthIntent(
  intent: ZenformedOAuthIntent | null
): AuthEntryQueryParams {
  return {
    app: intent?.app ?? null,
    plan: intent?.plan ?? null,
    returnTo: intent?.returnTo ?? null,
    redirect: intent?.redirect ?? null,
  };
}
