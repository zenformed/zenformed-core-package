/**
 * Friendly handling for Supabase-invalidated sessions (single-session eviction,
 * inactivity timeout, lifetime expiry, revoked refresh tokens).
 * Does not replace Supabase session management — only classifies and surfaces UX.
 */

export type SessionEndReason =
  | 'single_session'
  | 'expired'
  | 'inactive'
  | 'ended';

export const ZENFORMED_SESSION_END_STORAGE_KEY = 'zenformed-session-end';
export const ZENFORMED_SESSION_END_SKIP_KEY = 'zenformed-session-end-skip';
export const ZENFORMED_SESSION_END_QUERY_PARAM = 'sessionEnd';

const SESSION_END_MESSAGES: Record<SessionEndReason, string> = {
  single_session:
    'This account was signed in from another device. Please sign in again.',
  expired: 'Your session has expired. Please sign in again.',
  inactive: 'You were signed out after a period of inactivity.',
  ended: 'Your session has ended. Please sign in again.',
};

const VALID_REASONS = new Set<string>([
  'single_session',
  'expired',
  'inactive',
  'ended',
]);

export function isSessionEndReason(value: string | null | undefined): value is SessionEndReason {
  return value != null && VALID_REASONS.has(value);
}

export function getSessionEndMessage(reason: SessionEndReason): string {
  return SESSION_END_MESSAGES[reason];
}

/**
 * Maps Supabase auth / refresh errors to a user-facing session-end reason.
 * Never returns raw Supabase text to the UI.
 */
export function classifySupabaseAuthInvalidation(
  error: { readonly message?: string; readonly code?: string; readonly status?: number } | string | null | undefined
): SessionEndReason {
  const code = typeof error === 'string' ? '' : (error?.code ?? '').toLowerCase();
  const message = (
    typeof error === 'string' ? error : (error?.message ?? '')
  ).toLowerCase();
  const combined = `${code} ${message}`;

  if (
    combined.includes('inactive') ||
    combined.includes('inactivity') ||
    combined.includes('idle timeout') ||
    combined.includes('idle_timeout')
  ) {
    return 'inactive';
  }

  if (
    combined.includes('session_not_found') ||
    combined.includes('session from session_id') ||
    combined.includes('refresh_token_already_used') ||
    combined.includes('already used') ||
    combined.includes('concurrent session') ||
    combined.includes('single session') ||
    combined.includes('replaced by a newer')
  ) {
    return 'single_session';
  }

  if (
    combined.includes('jwt expired') ||
    combined.includes('token is expired') ||
    combined.includes('session_expired') ||
    combined.includes('access token expired') ||
    (combined.includes('expired') && combined.includes('session'))
  ) {
    return 'expired';
  }

  // Revoked / missing refresh token is the usual client signal when another
  // login invalidated this session, or the session was fully torn down.
  if (
    combined.includes('refresh_token_not_found') ||
    combined.includes('invalid refresh token') ||
    combined.includes('invalid_grant') ||
    combined.includes('refresh token not found')
  ) {
    return 'single_session';
  }

  if (combined.includes('expired')) {
    return 'expired';
  }

  return 'ended';
}

export type SavedSessionEnd = {
  readonly reason: SessionEndReason;
  readonly createdAt: number;
};

export function saveSessionEndReason(reason: SessionEndReason): void {
  if (typeof sessionStorage === 'undefined') return;
  const payload: SavedSessionEnd = { reason, createdAt: Date.now() };
  sessionStorage.setItem(ZENFORMED_SESSION_END_STORAGE_KEY, JSON.stringify(payload));
}

/** Marks the next SIGNED_OUT as user-initiated so no eviction banner is shown. */
export function markVoluntarySignOut(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(ZENFORMED_SESSION_END_SKIP_KEY, '1');
  sessionStorage.removeItem(ZENFORMED_SESSION_END_STORAGE_KEY);
}

export function clearSessionEndReason(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(ZENFORMED_SESSION_END_STORAGE_KEY);
  sessionStorage.removeItem(ZENFORMED_SESSION_END_SKIP_KEY);
}

/**
 * Reads and clears a stored session-end reason (unless voluntary sign-out skip is set).
 */
export function consumeSessionEndReason(): SessionEndReason | null {
  if (typeof sessionStorage === 'undefined') return null;
  if (sessionStorage.getItem(ZENFORMED_SESSION_END_SKIP_KEY) === '1') {
    sessionStorage.removeItem(ZENFORMED_SESSION_END_SKIP_KEY);
    sessionStorage.removeItem(ZENFORMED_SESSION_END_STORAGE_KEY);
    return null;
  }
  const raw = sessionStorage.getItem(ZENFORMED_SESSION_END_STORAGE_KEY);
  sessionStorage.removeItem(ZENFORMED_SESSION_END_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SavedSessionEnd>;
    if (isSessionEndReason(parsed.reason)) return parsed.reason;
  } catch {
    // ignore
  }
  return null;
}

/** Peek without clearing — used when appending reason to a login redirect URL. */
export function peekSessionEndReason(): SessionEndReason | null {
  if (typeof sessionStorage === 'undefined') return null;
  if (sessionStorage.getItem(ZENFORMED_SESSION_END_SKIP_KEY) === '1') return null;
  const raw = sessionStorage.getItem(ZENFORMED_SESSION_END_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SavedSessionEnd>;
    if (isSessionEndReason(parsed.reason)) return parsed.reason;
  } catch {
    // ignore
  }
  return null;
}

export function parseSessionEndReasonParam(
  value: string | null | undefined
): SessionEndReason | null {
  const trimmed = value?.trim();
  return isSessionEndReason(trimmed) ? trimmed : null;
}

/**
 * Resolves the message to show on the login screen from query param and/or storage.
 * Prefer query param; consume storage so it is not reused after display.
 */
export function resolveSessionEndMessageForLogin(
  queryReason: string | null | undefined
): string | null {
  const fromQuery = parseSessionEndReasonParam(queryReason);
  const fromStorage = consumeSessionEndReason();
  const reason = fromQuery ?? fromStorage;
  return reason != null ? getSessionEndMessage(reason) : null;
}

/**
 * Appends `sessionEnd` to a login URL when a reason is pending (does not consume).
 */
export function appendSessionEndToLoginUrl(
  loginUrl: string,
  reason: SessionEndReason | null = peekSessionEndReason()
): string {
  if (reason == null) return loginUrl;
  try {
    const absolute =
      loginUrl.startsWith('http://') || loginUrl.startsWith('https://')
        ? new URL(loginUrl)
        : new URL(loginUrl, 'https://zenformed.invalid');
    absolute.searchParams.set(ZENFORMED_SESSION_END_QUERY_PARAM, reason);
    if (loginUrl.startsWith('http://') || loginUrl.startsWith('https://')) {
      return absolute.toString();
    }
    return `${absolute.pathname}${absolute.search}${absolute.hash}`;
  } catch {
    const join = loginUrl.includes('?') ? '&' : '?';
    return `${loginUrl}${join}${ZENFORMED_SESSION_END_QUERY_PARAM}=${encodeURIComponent(reason)}`;
  }
}

/**
 * Call when the app detects an invalidated session (refresh failure, etc.).
 * Stores a friendly reason for the next login screen.
 */
export function recordSessionInvalidation(
  error: { readonly message?: string; readonly code?: string } | string | null | undefined,
  fallback: SessionEndReason = 'ended'
): SessionEndReason {
  const reason =
    error == null || (typeof error === 'string' && !error.trim())
      ? fallback
      : classifySupabaseAuthInvalidation(error);
  saveSessionEndReason(reason);
  return reason;
}

/**
 * Unexpected SIGNED_OUT while the user still looked authenticated locally.
 * Prefer a previously stored reason; otherwise fall back to `ended`.
 * No-ops when a voluntary sign-out was marked.
 */
export function recordUnexpectedSignedOut(): SessionEndReason | null {
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(ZENFORMED_SESSION_END_SKIP_KEY) === '1') {
    return null;
  }
  const existing = peekSessionEndReason();
  if (existing != null) return existing;
  saveSessionEndReason('ended');
  return 'ended';
}
