import type { ZenformedAuthSupabaseClient } from './zenformedAuthSupabaseClient';

export type UpdateRecoveredPasswordInput = {
  readonly supabase: ZenformedAuthSupabaseClient;
  readonly password: string;
};

export type UpdateRecoveredPasswordResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: string };

export async function updateRecoveredPassword(
  input: UpdateRecoveredPasswordInput
): Promise<UpdateRecoveredPasswordResult> {
  const password = input.password;
  if (password.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters' };
  }

  try {
    const { error } = await input.supabase.auth.updateUser({ password });
    if (error) {
      return { ok: false, error: error.message || 'Unable to update password. Try again.' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Unable to update password. Try again.' };
  }
}
