/**
 * Injection boundary for {@link resolveCapabilityEntitlementPayload}.
 *
 * Callers supply any `SupabaseClient` (anon + JWT, privileged server client, etc.). No app env or client factories here.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export type CapabilityEntitlementResolverDataClient = SupabaseClient;
