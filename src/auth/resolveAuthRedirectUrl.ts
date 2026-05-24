export type ResolveAuthRedirectUrlInput = {
  /** App origin without trailing slash, e.g. `https://app.example.com` or `http://localhost:3020`. */
  readonly appOrigin: string;
  /** App-relative path, e.g. `/reset-password`. */
  readonly path: string;
};

/** Builds an absolute redirect URL for Supabase auth callbacks (password recovery, etc.). */
export function resolveAuthRedirectUrl(input: ResolveAuthRedirectUrlInput): string {
  const origin = input.appOrigin.trim().replace(/\/+$/, '');
  const path = input.path.trim();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${normalizedPath}`;
}

/** Browser origin when available; otherwise optional configured fallback (e.g. `NEXT_PUBLIC_APP_URL`). */
export function resolveAppOrigin(fallbackOrigin?: string | null): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  const fallback = fallbackOrigin?.trim();
  return fallback ? fallback.replace(/\/+$/, '') : '';
}
