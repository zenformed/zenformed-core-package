import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

/**
 * Minimal Supabase auth surface used by `@zenformed/core/auth`.
 * Structural typing avoids duplicate `@supabase/supabase-js` class identity issues in monorepos.
 */
export type ZenformedAuthSupabaseClient = {
  auth: {
    getSession(): Promise<{ data: { session: Session | null } }>;
    onAuthStateChange(
      callback: (event: AuthChangeEvent, session: Session | null) => void
    ): { data: { subscription: { unsubscribe(): void } } };
    signInWithPassword(credentials: {
      email: string;
      password: string;
    }): Promise<{
      data: { session: Session | null; user: User | null };
      error: { message: string } | null;
    }>;
    signUp(credentials: {
      email: string;
      password: string;
      options?: {
        data?: Record<string, string>;
      };
    }): Promise<{
      data: { session: Session | null; user: User | null };
      error: { message: string } | null;
    }>;
    updateUser(attributes: { password: string }): Promise<{ error: { message: string } | null }>;
    resetPasswordForEmail(
      email: string,
      options: { redirectTo: string }
    ): Promise<{ error: { message: string } | null }>;
  };
};
