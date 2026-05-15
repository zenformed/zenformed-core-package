import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Anon Supabase project connection (public URL + anon key), read lazily per client build. */
export type EntitlementReaderSupabaseConnection = {
  getSupabaseUrl: () => string;
  getSupabaseAnonKey: () => string;
};

/** Returns the shared browser Supabase client (session-aware). */
export type EntitlementReaderBrowserSupabaseProvider = () => SupabaseClient;

/** Injectable deps for {@link ProfilesColumnEntitlementReader} / {@link PlatformTableEntitlementReader}. */
export type EntitlementReaderSupabaseDeps = {
  connection: EntitlementReaderSupabaseConnection;
  getBrowserSupabaseClient: EntitlementReaderBrowserSupabaseProvider;
};

/**
 * JWT-bound anon client when `accessToken` is non-empty, otherwise the browser singleton from
 * `getBrowserSupabaseClient`. Reads URL/anon key from `connection` getters on each call.
 */
export function createJwtAwareAnonSupabaseClient(
  deps: EntitlementReaderSupabaseDeps,
  accessToken?: string | null
): SupabaseClient {
  const { connection, getBrowserSupabaseClient } = deps;
  const supabaseUrl = connection.getSupabaseUrl();
  const supabaseAnonKey = connection.getSupabaseAnonKey();
  return accessToken != null && String(accessToken).trim() !== ''
    ? createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      })
    : getBrowserSupabaseClient();
}
