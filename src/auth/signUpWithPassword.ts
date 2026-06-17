import type { Session, User } from '@supabase/supabase-js';
import type { ZenformedAuthSupabaseClient } from './zenformedAuthSupabaseClient';

export type SignUpWithPasswordOptions = {
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  /** When true, Supabase user metadata requests personal default org bootstrap on signup. */
  readonly bootstrapDefaultOrganization?: boolean;
  /** Absolute URL Supabase should redirect to after the user confirms their email. */
  readonly emailRedirectTo?: string | null;
  /** When true, never keep an active session; user must verify email before signing in. */
  readonly requireEmailConfirmation?: boolean;
};

export type SignUpWithPasswordResult =
  | {
      readonly ok: true;
      readonly session: Session | null;
      readonly user: User;
      readonly pendingEmailVerification?: boolean;
      readonly message?: string;
    }
  | { readonly ok: false; readonly error: string; readonly needsEmailConfirmation?: boolean };

const REGISTER_EMAIL_VERIFICATION_MESSAGE =
  'Check your email to verify your account. After verifying, return to login.';

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
  const emailRedirectTo = options?.emailRedirectTo?.trim() ?? '';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      ...(emailRedirectTo ? { emailRedirectTo } : {}),
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

  if (options?.requireEmailConfirmation) {
    if (data.session) {
      await supabase.auth.signOut();
    }
    if (data.user) {
      return {
        ok: true,
        session: null,
        user: data.user,
        pendingEmailVerification: true,
        message: REGISTER_EMAIL_VERIFICATION_MESSAGE,
      };
    }
    return { ok: false, error: 'Account could not be created.' };
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
