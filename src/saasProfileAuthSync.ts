import type { AuthChangeEvent } from '@supabase/supabase-js';

/**
 * How {@link SaaSProfileProvider} (in consuming apps) should react to Supabase auth events.
 *
 * - `token_only` — update in-memory session/user; no profile HTTP, no loading shell
 * - `sign_out` — clear auth/profile state
 * - `silent_session` — same user already bootstrapped; sync session only
 * - `load_soft` — background profile refresh without full-page loading
 * - `load_full` — initial bootstrap (may show loading shell)
 */
export type SaasProfileAuthReaction =
  | 'token_only'
  | 'sign_out'
  | 'silent_session'
  | 'load_soft'
  | 'load_full';

export type ResolveSaasProfileAuthReactionInput = {
  event: AuthChangeEvent;
  /** `session?.user?.id` from the auth callback. */
  userId: string | null;
  /** `profile?.id` already in React state (stable user identity for focus/refresh). */
  profileUserId?: string | null;
  /** User id for whom profile/bootstrap already completed successfully. */
  bootstrappedUserId?: string | null;
  /** Whether a profile row is already in React state. */
  hasProfile: boolean;
};

export type SessionWithAccessToken = { access_token?: string | null } | null;

/** True when an auth callback session can be applied without clearing UI state. */
export function shouldApplyAuthCallbackSession<T extends SessionWithAccessToken>(
  session: T
): session is T & { access_token: string } {
  return typeof session?.access_token === 'string' && session.access_token.length > 0;
}

/**
 * Full-page gate loading only for true cold bootstrap (no profile mounted yet).
 */
export function shouldShowSaasProfileFullPageLoading(soft: boolean, hasExistingProfile: boolean): boolean {
  return !soft && !hasExistingProfile;
}

/**
 * Supabase may emit `INITIAL_SESSION` or duplicate `SIGNED_IN` when the tab regains focus after
 * token refresh. Treat those as silent session sync when the same user already has profile state.
 */
export function resolveSaasProfileAuthReaction(
  input: ResolveSaasProfileAuthReactionInput
): SaasProfileAuthReaction {
  const { event, userId, profileUserId, bootstrappedUserId, hasProfile } = input;

  if (event === 'TOKEN_REFRESHED') {
    return 'token_only';
  }

  if (event === 'SIGNED_OUT') {
    return 'sign_out';
  }

  const stableUserId = profileUserId ?? bootstrappedUserId ?? null;
  const sameUserWithProfile =
    userId != null && hasProfile && stableUserId != null && userId === stableUserId;

  if (sameUserWithProfile) {
    return 'silent_session';
  }

  if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
    return 'load_full';
  }

  return 'load_soft';
}
