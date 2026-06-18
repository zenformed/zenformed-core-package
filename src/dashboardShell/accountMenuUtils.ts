/**
 * Pure helpers for dashboard account avatar initials/color (no React, no I/O).
 */

export type AccountMenuUserIdentity = {
  email: string;
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

function firstInitial(value: string): string {
  const trimmed = value.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '';
}

function initialsFromNameParts(parts: readonly string[]): string {
  if (parts.length >= 2) {
    return `${firstInitial(parts[0])}${firstInitial(parts[parts.length - 1])}`;
  }
  const single = parts[0]?.trim() ?? '';
  if (!single) return '';
  if (single.length >= 2) return single.slice(0, 2).toUpperCase();
  return firstInitial(single);
}

function initialsFromEmail(email: string): string {
  const local = email.split('@')[0]?.trim() ?? '';
  if (local.length >= 2) return local.slice(0, 2).toUpperCase();
  return firstInitial(local) || '?';
}

/** Resolve two-letter initials from a display label or email string. */
export function resolveInitialsFromLabel(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return '?';
  if (trimmed.includes('@')) {
    return initialsFromEmail(trimmed);
  }
  return initialsFromNameParts(trimmed.split(/\s+/).filter(Boolean)) || '?';
}

/** Avatar initials prefer first + last name, then parsed display name, then email local-part. */
export function getUserInitials(
  user: AccountMenuUserIdentity,
  displayNameFallback?: string | null
): string {
  const first = user.firstName?.trim() ?? '';
  const last = user.lastName?.trim() ?? '';
  if (first && last) {
    return `${firstInitial(first)}${firstInitial(last)}`;
  }

  const nameCandidate =
    user.displayName?.trim() ||
    displayNameFallback?.trim() ||
    first ||
    last ||
    '';

  if (nameCandidate) {
    const fromName = resolveInitialsFromLabel(nameCandidate);
    if (fromName !== '?') return fromName;
  }

  return initialsFromEmail(user.email);
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

export function readNameFieldsFromUserMetadata(
  metadata: unknown
): Pick<AccountMenuUserIdentity, 'firstName' | 'lastName' | 'displayName'> {
  if (metadata == null || typeof metadata !== 'object') {
    return { firstName: null, lastName: null, displayName: null };
  }

  const record = metadata as Record<string, unknown>;
  const firstName =
    typeof record.first_name === 'string' && record.first_name.trim() !== ''
      ? record.first_name.trim()
      : null;
  const lastName =
    typeof record.last_name === 'string' && record.last_name.trim() !== ''
      ? record.last_name.trim()
      : null;
  const displayName =
    typeof record.display_name === 'string' && record.display_name.trim() !== ''
      ? record.display_name.trim()
      : typeof record.full_name === 'string' && record.full_name.trim() !== ''
        ? record.full_name.trim()
        : typeof record.name === 'string' && record.name.trim() !== ''
          ? record.name.trim()
          : null;

  return { firstName, lastName, displayName };
}

export function resolveAccountMenuUser(
  email: string,
  metadata?: unknown,
  overrides?: Partial<Pick<AccountMenuUserIdentity, 'firstName' | 'lastName' | 'displayName'>>
): AccountMenuUserIdentity {
  const fromMetadata = readNameFieldsFromUserMetadata(metadata);
  return {
    email,
    firstName: overrides?.firstName ?? fromMetadata.firstName,
    lastName: overrides?.lastName ?? fromMetadata.lastName,
    displayName: overrides?.displayName ?? fromMetadata.displayName ?? null,
  };
}

export function userCircleColor(email: string): string {
  let h = 0;
  for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360}, 55%, 42%)`;
}
