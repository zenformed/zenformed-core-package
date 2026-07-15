/**
 * Client-side destination URL safety for notification navigation.
 * Host `onNavigate` still owns routing; this only decides interactivity.
 */

const LOCAL_HTTP_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export function isSafeNotificationDestinationUrl(url: string | null | undefined): boolean {
  if (url == null) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith('/')) {
    // Relative app route — reject protocol-relative `//`.
    if (trimmed.startsWith('//')) return false;
    return true;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }

  const protocol = parsed.protocol.toLowerCase();
  if (protocol === 'https:') return true;
  if (protocol === 'http:') {
    return LOCAL_HTTP_HOSTS.has(parsed.hostname.toLowerCase());
  }
  return false;
}

export function warnUnsafeNotificationDestination(url: string): void {
  const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
    ?.NODE_ENV;
  if (nodeEnv === 'development') {
    console.warn(
      '[@zenformed/core/dashboard-shell] Ignoring unsafe notification destination URL.'
    );
  }
  void url;
}
