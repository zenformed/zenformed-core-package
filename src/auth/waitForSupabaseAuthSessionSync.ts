import type { ZenformedAuthSupabaseClient } from './zenformedAuthSupabaseClient';

const DEFAULT_TIMEOUT_MS = 5_000;

/**
 * Waits until the Supabase client exposes an access token (post sign-in / URL callback).
 */
export async function waitForSupabaseAuthSessionSync(
  supabase: ZenformedAuthSupabaseClient,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) return;

  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = (): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      subscription.unsubscribe();
      resolve();
    };

    const timeout = setTimeout(finish, timeoutMs);
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (
        (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') &&
        nextSession?.access_token
      ) {
        finish();
      }
    });
  });
}
