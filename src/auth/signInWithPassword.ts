import type { Session, User } from '@supabase/supabase-js';
import type { ZenformedAuthSupabaseClient } from './zenformedAuthSupabaseClient';

export type SignInWithPasswordResult =
  | { readonly ok: true; readonly session: Session; readonly user: User }
  | { readonly ok: false; readonly error: string };

/** Shared Supabase email/password sign-in helper. */
export async function signInWithPassword(
  supabase: ZenformedAuthSupabaseClient,
  email: string,
  password: string
): Promise<SignInWithPasswordResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, error: error.message };
  }
  if (!data.session || !data.user) {
    return { ok: false, error: 'No user returned' };
  }
  return { ok: true, session: data.session, user: data.user };
}
