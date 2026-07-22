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
