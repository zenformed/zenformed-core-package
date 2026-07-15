/**
 * Pure lifecycle rules for unread-count freshness.
 * Background unread polling must not depend on the envelope dropdown being open.
 */

export function shouldFetchUnreadOnControllerMount(
  enabled: boolean,
  organizationId: string
): boolean {
  return enabled && organizationId.trim().length > 0;
}

/** Interval ticks should skip while the document is hidden. */
export function shouldRunUnreadPollTick(documentHidden: boolean): boolean {
  return !documentHidden;
}

/** Visibility restore and focus should refresh unread immediately. */
export function shouldRefreshUnreadOnVisibilityState(visibilityState: string): boolean {
  return visibilityState === 'visible';
}

/** Latest-10 fetch remains dropdown-open only (not background-polled). */
export function shouldFetchLatestOnDropdownOpen(dropdownOpen: boolean): boolean {
  return dropdownOpen;
}

/**
 * Unstable API/object identity in refresh deps causes abort/in-flight races that
 * can skip the mount fetch until a later manual trigger (e.g. opening the dropdown).
 * Controllers must keep `api` in a ref and omit it from callback identities.
 */
export const UNREAD_POLL_API_IDENTITY_NOTE =
  'Unread poll callbacks must not re-create when the host re-memoizes the API adapter.';
