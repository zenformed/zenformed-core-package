'use client';

import { useSyncExternalStore } from 'react';

export const ZENFORMED_MOBILE_SHELL_BREAKPOINT_PX = 768;

const MOBILE_SHELL_MEDIA_QUERY = `(max-width: ${ZENFORMED_MOBILE_SHELL_BREAKPOINT_PX - 1}px)`;

function subscribeMobileShell(onStoreChange: () => void): () => void {
  const mediaQuery = window.matchMedia(MOBILE_SHELL_MEDIA_QUERY);
  mediaQuery.addEventListener('change', onStoreChange);
  return () => mediaQuery.removeEventListener('change', onStoreChange);
}

function getMobileShellSnapshot(): boolean {
  return window.matchMedia(MOBILE_SHELL_MEDIA_QUERY).matches;
}

/** True when the dashboard should use the mobile shell (no sidebar rail). */
export function useZenformedMobileShellLayout(): boolean {
  return useSyncExternalStore(subscribeMobileShell, getMobileShellSnapshot, () => false);
}
