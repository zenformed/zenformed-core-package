import type { Session, User } from '@supabase/supabase-js';
import type { ZenformedAuthSupabaseClient } from './zenformedAuthSupabaseClient';

export type SignInWithPasswordResult =
  | { readonly ok: true; readonly session: Session; readonly user: User }
  | { readonly ok: false; readonly error: string };

const EMAIL_NOT_VERIFIED_MESSAGE =
  'Please verify your email before signing in. Check your inbox for the confirmation link.';

function isEmailNotConfirmedAuthError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('email not confirmed') ||
    normalized.includes('email address not confirmed') ||
    normalized.includes('not confirmed')
  );
}

/** Shared Supabase email/password sign-in helper. */
export async function signInWithPassword(
  supabase: ZenformedAuthSupabaseClient,
  email: string,
  password: string
): Promise<SignInWithPasswordResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (isEmailNotConfirmedAuthError(error.message)) {
      return { ok: false, error: EMAIL_NOT_VERIFIED_MESSAGE };
    }
    return { ok: false, error: error.message };
  }
  if (!data.session || !data.user) {
    return { ok: false, error: 'No user returned' };
  }
  if (!data.user.email_confirmed_at) {
    await supabase.auth.signOut();
    return { ok: false, error: EMAIL_NOT_VERIFIED_MESSAGE };
  }
  return { ok: true, session: data.session, user: data.user };
}
