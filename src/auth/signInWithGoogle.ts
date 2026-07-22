import type { ZenformedAuthSupabaseClient } from './zenformedAuthSupabaseClient';

export type SignInWithGoogleOptions = {
  /**
   * Absolute Platform OAuth callback URL, e.g.
   * `http://localhost:3030/auth/callback` or `https://core.zenformed.com/auth/callback`.
   */
  readonly redirectTo: string;
  /** Optional scopes; defaults to Supabase/Google defaults when omitted. */
  readonly scopes?: string;
};

export type SignInWithGoogleResult =
  | { readonly ok: true; readonly url: string }
  | { readonly ok: false; readonly error: string };

/**
 * Starts Google OAuth via Supabase. Does not expose or persist Google provider tokens.
 * Caller must save OAuth intent before invoking when post-auth context must survive the redirect.
 */
export async function signInWithGoogle(
  supabase: ZenformedAuthSupabaseClient,
  options: SignInWithGoogleOptions
): Promise<SignInWithGoogleResult> {
  const redirectTo = options.redirectTo.trim();
  if (!redirectTo) {
    return { ok: false, error: 'OAuth callback URL is required.' };
  }
  if (!redirectTo.startsWith('http://') && !redirectTo.startsWith('https://')) {
    return { ok: false, error: 'OAuth callback URL must be absolute.' };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      // Always show Google's account picker so users can switch Google accounts
      // after app sign-out (browser Google session is otherwise reused silently).
      queryParams: { prompt: 'select_account' },
      ...(options.scopes?.trim() ? { scopes: options.scopes.trim() } : {}),
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const url = data.url?.trim() ?? '';
  if (!url) {
    return { ok: false, error: 'Google sign-in did not return a redirect URL.' };
  }

  return { ok: true, url };
}
