import type { SupabaseClient } from '@supabase/supabase-js';

export type RequestPasswordResetInput = {
  readonly supabase: SupabaseClient;
  readonly email: string;
  readonly redirectTo: string;
};

export type RequestPasswordResetResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: string };

const GENERIC_ERROR = 'Unable to send reset email. Try again later.';

/**
 * Sends a Supabase password recovery email. Always returns a privacy-safe outcome:
 * callers should show the same success copy whether or not the email is registered.
 */
export async function requestPasswordResetEmail(
  input: RequestPasswordResetInput
): Promise<RequestPasswordResetResult> {
  const email = input.email.trim();
  if (!email || !input.redirectTo.trim()) {
    return { ok: false, error: GENERIC_ERROR };
  }

  try {
    const { error } = await input.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: input.redirectTo,
    });
    if (error) {
      return { ok: false, error: GENERIC_ERROR };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
}
