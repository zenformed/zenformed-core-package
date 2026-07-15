export class ZenformedNotificationsApiError extends Error {
  readonly status: number;
  readonly code: string | null;

  constructor(message: string, status: number, code: string | null = null) {
    super(message);
    this.name = 'ZenformedNotificationsApiError';
    this.status = status;
    this.code = code;
  }
}

export function readNotificationsApiErrorMessage(
  json: unknown,
  fallback: string
): { message: string; code: string | null } {
  if (json != null && typeof json === 'object' && !Array.isArray(json)) {
    const o = json as Record<string, unknown>;
    const message =
      typeof o.message === 'string' && o.message.trim()
        ? o.message.trim()
        : typeof o.error === 'string' && o.error.trim()
          ? o.error.trim()
          : fallback;
    const code =
      typeof o.error === 'string' && o.error.trim() && o.error !== message
        ? o.error.trim()
        : typeof o.error === 'string' && typeof o.message === 'string'
          ? o.error.trim()
          : null;
    return { message, code };
  }
  return { message: fallback, code: null };
}

/** User-facing copy — never surface raw API payloads. */
export function toUserFacingNotificationsError(error: unknown): string {
  if (error instanceof ZenformedNotificationsApiError) {
    if (error.status === 401) return 'Sign in to view notifications.';
    if (error.status === 403) return 'You do not have access to these notifications.';
    if (error.status === 404) return 'Notifications are unavailable.';
    if (error.status >= 500) return 'Could not load notifications. Try again.';
    return 'Could not load notifications. Try again.';
  }
  if (error instanceof Error && error.name === 'AbortError') {
    return 'Request cancelled.';
  }
  return 'Could not load notifications. Try again.';
}
