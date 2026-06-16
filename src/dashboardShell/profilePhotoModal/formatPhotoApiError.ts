/** Safe client-facing message from `/api/auth/me/photo` error JSON. */
export function formatPhotoApiError(body: unknown, fallback: string): string {
  if (body == null || typeof body !== 'object') return fallback;
  const data = body as Record<string, unknown>;
  const code = typeof data.error === 'string' && data.error.trim() !== '' ? data.error.trim() : fallback;

  const detail = data.detail ?? data.message;
  if (typeof detail === 'string' && detail.trim() !== '') {
    return `${code}: ${detail.trim()}`;
  }
  if (detail != null && typeof detail === 'object') {
    const nested = detail as Record<string, unknown>;
    const nestedMessage =
      typeof nested.message === 'string'
        ? nested.message
        : typeof nested.error === 'string'
          ? nested.error
          : null;
    if (nestedMessage != null && nestedMessage.trim() !== '') {
      return `${code}: ${nestedMessage.trim()}`;
    }
  }

  if (code === 'Unauthorized') {
    return 'Session expired — sign in again and retry.';
  }
  if (code === 'avatar_upload_rejected') {
    return 'Photo was rejected — use PNG or JPEG under 2 MB.';
  }
  if (code === 'avatar_upload_failed') {
    return 'Avatar upload failed — try again in a moment.';
  }
  if (code === 'Failed to fetch avatar') {
    return 'Could not load built-in avatar — try again.';
  }

  return code;
}
