import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type BrowserSupabaseAuthClientConfig = {
  url: string;
  anonKey: string;
  /**
   * Optional per-app auth storage key. Use when multiple Zenformed consuming apps share a host
   * (e.g. localhost) so sessions do not collide.
   */
  storageKey?: string;
};

const clientsByCacheKey = new Map<string, SupabaseClient>();

function cacheKey(config: BrowserSupabaseAuthClientConfig): string {
  return `${config.storageKey ?? 'default'}|${config.url}`;
}

/**
 * Single browser Supabase auth client per `(storageKey, url)`.
 * Sign-in, `SaaSProfileProvider`, and entitlement readers must share this instance — never call
 * `createClient` again in `SupabaseAuthAdapter` or hooks.
 */
export function getOrCreateBrowserSupabaseAuthClient(
  config: BrowserSupabaseAuthClientConfig
): SupabaseClient {
  const key = cacheKey(config);
  let client = clientsByCacheKey.get(key);
  if (client == null) {
    client = createClient(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        ...(config.storageKey != null ? { storageKey: config.storageKey } : {}),
      },
    });
    clientsByCacheKey.set(key, client);
  }
  return client;
}
