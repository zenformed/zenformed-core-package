import type { SupabaseClient } from '@supabase/supabase-js';
import { parsePresenceStatusMode, type PresenceStatusMode } from './types';

const TABLE = 'platform_user_presence_preferences';

export async function fetchPresenceStatusMode(
  supabase: SupabaseClient,
  userId: string
): Promise<PresenceStatusMode> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('status_mode')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return parsePresenceStatusMode(data?.status_mode, 'automatic');
}

export async function savePresenceStatusMode(
  supabase: SupabaseClient,
  userId: string,
  statusMode: PresenceStatusMode
): Promise<PresenceStatusMode> {
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      {
        user_id: userId,
        status_mode: statusMode,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select('status_mode')
    .single();

  if (error) {
    throw error;
  }

  return parsePresenceStatusMode(data?.status_mode, statusMode);
}
