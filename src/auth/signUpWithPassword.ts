import type { Session, User } from '@supabase/supabase-js';
import type { ZenformedAuthSupabaseClient } from './zenformedAuthSupabaseClient';

export type SignUpWithPasswordOptions = {
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  /** When true, Supabase user metadata requests personal default org bootstrap on signup. */
  readonly bootstrapDefaultOrganization?: boolean;
};

export type SignUpWithPasswordResult =
  | { readonly ok: true; readonly session: Session | null; readonly user: User }
  | { readonly ok: false; readonly error: string; readonly needsEmailConfirmation?: boolean };

/** Shared Supabase email/password sign-up helper. */
export async function signUpWithPassword(
  supabase: ZenformedAuthSupabaseClient,
  email: string,
  password: string,
  options?: SignUpWithPasswordOptions
): Promise<SignUpWithPasswordResult> {
  const firstName = options?.firstName?.trim() ?? '';
  const lastName = options?.lastName?.trim() ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        ...(firstName ? { first_name: firstName } : {}),
        ...(lastName ? { last_name: lastName } : {}),
        ...(fullName ? { full_name: fullName } : {}),
        ...(options?.bootstrapDefaultOrganization
          ? { bootstrap_default_organization: 'true' }
          : {}),
      },
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  if (data.session && data.user) {
    return { ok: true, session: data.session, user: data.user };
  }

  if (data.user && !data.session) {
    return {
      ok: false,
      needsEmailConfirmation: true,
      error: 'Check your email to confirm your account before signing in.',
    };
  }

  return { ok: false, error: 'Account could not be created.' };
}
