/**
 * Validates an in-app return/redirect path for auth handoffs.
 * Rejects absolute URLs, protocol-relative URLs, and backslash escapes.
 */
export function sanitizeAuthReturnPath(candidate: string | null | undefined): string | null {
  if (candidate == null) return null;
  const trimmed = candidate.trim();
  if (!trimmed) return null;
  if (!trimmed.startsWith('/')) return null;
  if (trimmed.startsWith('//')) return null;
  if (trimmed.includes('://')) return null;
  if (trimmed.includes('\\')) return null;
  return trimmed;
}

/**
 * Auth-entry / recovery routes that must never be final post-auth destinations.
 * Matched on pathname only (query string ignored).
 */
export const AUTH_ENTRY_PATH_PREFIXES = [
  '/login',
  '/register',
  '/auth/google',
  '/auth/callback',
  '/forgot-password',
  '/reset-password',
] as const;

function pathnameOf(path: string): string {
  const noHash = path.split('#')[0] ?? path;
  const noQuery = noHash.split('?')[0] ?? noHash;
  if (noQuery.length > 1 && noQuery.endsWith('/')) {
    return noQuery.slice(0, -1);
  }
  return noQuery || '/';
}

/** True when the path is a Platform auth-entry or password-recovery page. */
export function isAuthEntryReturnPath(candidate: string | null | undefined): boolean {
  const safe = sanitizeAuthReturnPath(candidate);
  if (safe == null) return false;
  const pathname = pathnameOf(safe);
  return AUTH_ENTRY_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * Post-auth destination sanitizer for Platform navigation after login/OAuth.
 * Rejects open redirects and auth-entry pages (`/login`, `/register`, etc.).
 * Use {@link sanitizeAuthReturnPath} alone for BuildCore handoff return paths.
 */
export function sanitizePostAuthDestination(
  candidate: string | null | undefined
): string | null {
  const safe = sanitizeAuthReturnPath(candidate);
  if (safe == null) return null;
  if (isAuthEntryReturnPath(safe)) return null;
  return safe;
}
