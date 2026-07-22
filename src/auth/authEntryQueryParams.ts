import { sanitizePostAuthDestination } from './sanitizeAuthReturnPath';

export type AuthEntryQueryParams = {
  readonly app: string | null;
  readonly plan: string | null;
  readonly returnTo: string | null;
  /** Legacy alias used by BuildCore login (`?redirect=`). */
  readonly redirect: string | null;
};

type SearchParamReader = {
  get(name: string): string | null;
};

function readTrimmedParam(reader: SearchParamReader, name: string): string | null {
  const value = reader.get(name)?.trim();
  return value ? value : null;
}

/** Parses platform auth entry query params from URL search params. */
export function parseAuthEntryQueryParams(reader: SearchParamReader): AuthEntryQueryParams {
  return {
    app: readTrimmedParam(reader, 'app'),
    plan: readTrimmedParam(reader, 'plan'),
    returnTo: readTrimmedParam(reader, 'returnTo'),
    redirect: readTrimmedParam(reader, 'redirect'),
  };
}

/** Builds an app-relative auth href preserving entry query params. */
export function buildAuthEntryHref(
  path: string,
  params: Partial<AuthEntryQueryParams> | null | undefined
): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const search = new URLSearchParams();

  const app = params?.app?.trim();
  const plan = params?.plan?.trim();
  const returnTo = params?.returnTo?.trim();
  const redirect = params?.redirect?.trim();

  if (app) search.set('app', app);
  if (plan) search.set('plan', plan);
  if (returnTo) search.set('returnTo', returnTo);
  if (redirect) search.set('redirect', redirect);

  const query = search.toString();
  return query ? `${normalizedPath}?${query}` : normalizedPath;
}

/**
 * Resolves the post-auth in-app redirect target.
 * Prefers `returnTo`, then legacy `redirect`, then `defaultPath`.
 * Rejects absolute / protocol-relative / backslash paths and auth-entry pages
 * (`/login`, `/register`, `/auth/*`, forgot/reset password).
 */
export function resolvePostAuthRedirectTarget(
  params: AuthEntryQueryParams,
  defaultPath: string
): string {
  const candidate = sanitizePostAuthDestination(params.returnTo ?? params.redirect);
  if (candidate) return candidate;
  const fallback = defaultPath.startsWith('/') ? defaultPath : `/${defaultPath}`;
  return sanitizePostAuthDestination(fallback) ?? '/dashboard';
}
