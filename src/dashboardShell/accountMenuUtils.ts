/**
 * Pure helpers for dashboard account avatar initials/color (no React, no I/O).
 */

export type AccountMenuUserIdentity = {
  email: string;
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

export function getUserInitials(email: string): string {
  const local = (email || '').split('@')[0] || '';
  if (local.length >= 2) return local.slice(0, 2).toUpperCase();
  return local.slice(0, 1).toUpperCase() || '?';
}

export function userCircleColor(email: string): string {
  let h = 0;
  for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360}, 55%, 42%)`;
}

/** Display label for account menu (display name or first/last name only — never email). */
export function resolveAccountMenuDisplayName(user: AccountMenuUserIdentity): string {
  const display = user.displayName?.trim();
  if (display) return display;

  const first = user.firstName?.trim() ?? '';
  const last = user.lastName?.trim() ?? '';
  if (first && last) return `${first} ${last}`;
  if (first) return first;
  if (last) return last;

  return '';
}
