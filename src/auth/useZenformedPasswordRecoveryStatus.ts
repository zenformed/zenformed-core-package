'use client';

import { useEffect, useState } from 'react';
import type { ZenformedAuthSupabaseClient } from './zenformedAuthSupabaseClient';
import { hasAuthRecoveryCallback } from './authRecoveryCallback';

export type PasswordRecoveryStatus = 'loading' | 'ready' | 'invalid';

/**
 * Resolves whether the current page has a usable Supabase password-recovery session.
 */
export function useZenformedPasswordRecoveryStatus(
  supabase: ZenformedAuthSupabaseClient
): PasswordRecoveryStatus {
  const [status, setStatus] = useState<PasswordRecoveryStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    async function resolveRecoveryStatus(): Promise<void> {
      if (hasAuthRecoveryCallback()) {
        await new Promise((resolve) => window.setTimeout(resolve, 250));
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;

      if (session) {
        setStatus('ready');
        return;
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, newSession) => {
        if (cancelled) return;
        if (event === 'PASSWORD_RECOVERY' || newSession) {
          setStatus('ready');
        }
      });
      unsubscribe = () => subscription.unsubscribe();

      window.setTimeout(async () => {
        if (cancelled) return;
        const {
          data: { session: delayedSession },
        } = await supabase.auth.getSession();
        if (cancelled) return;
        setStatus(delayedSession ? 'ready' : 'invalid');
      }, 750);
    }

    void resolveRecoveryStatus();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [supabase]);

  return status;
}
