import {
  readNotificationsApiErrorMessage,
  ZenformedNotificationsApiError,
} from './notificationErrors';
import {
  parseUnreadCount,
  parseZenformedNotificationsList,
  parseZenformedNotificationsPage,
} from './parseNotificationApi';
import type { ZenformedNotificationsApi } from './types';

export type CreateZenformedNotificationsApiOptions = {
  /**
   * API origin or BFF prefix (no trailing slash), e.g. `https://core.example.com`
   * or `/api/zenformed-core`. Paths append Core org notification routes.
   */
  readonly baseUrl: string;
  readonly getAccessToken: () => string | null | undefined;
  readonly fetchImpl?: typeof fetch;
};

function trimBase(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, '');
}

function orgNotificationsPath(baseUrl: string, organizationId: string, suffix = ''): string {
  const org = encodeURIComponent(organizationId);
  return `${trimBase(baseUrl)}/organizations/${org}/notifications${suffix}`;
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function requireOkJson(
  res: Response,
  fallbackMessage: string
): Promise<unknown> {
  const json = await parseJsonSafe(res);
  if (!res.ok) {
    const { message, code } = readNotificationsApiErrorMessage(json, fallbackMessage);
    throw new ZenformedNotificationsApiError(message, res.status, code);
  }
  return json;
}

/**
 * Fetch-based adapter for ZenformedCore (or host BFF) consumer notification APIs.
 * Does not expose notification creation.
 */
export function createZenformedNotificationsApi(
  options: CreateZenformedNotificationsApiOptions
): ZenformedNotificationsApi {
  const fetchImpl = options.fetchImpl ?? fetch;

  async function authedFetch(
    url: string,
    init: RequestInit & { signal?: AbortSignal }
  ): Promise<Response> {
    const accessToken = options.getAccessToken()?.trim();
    if (!accessToken) {
      throw new ZenformedNotificationsApiError('Sign in required.', 401, 'unauthorized');
    }
    const headers = new Headers(init.headers);
    headers.set('Accept', 'application/json');
    headers.set('Authorization', `Bearer ${accessToken}`);
    if (init.body != null && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    return fetchImpl(url, { ...init, headers });
  }

  return {
    async getLatest({ organizationId, limit, signal }) {
      const params = new URLSearchParams();
      if (limit != null) params.set('limit', String(limit));
      const qs = params.toString();
      const url = `${orgNotificationsPath(options.baseUrl, organizationId, '/latest')}${
        qs ? `?${qs}` : ''
      }`;
      const res = await authedFetch(url, { method: 'GET', signal });
      const json = await requireOkJson(res, 'Could not load notifications.');
      return parseZenformedNotificationsList(json);
    },

    async getUnreadCount({ organizationId, signal }) {
      const url = orgNotificationsPath(options.baseUrl, organizationId, '/unread-count');
      const res = await authedFetch(url, { method: 'GET', signal });
      const json = await requireOkJson(res, 'Could not load unread count.');
      return parseUnreadCount(json);
    },

    async getPage({ organizationId, limit, cursor, signal }) {
      const params = new URLSearchParams();
      if (limit != null) params.set('limit', String(limit));
      if (cursor) params.set('cursor', cursor);
      const qs = params.toString();
      const url = `${orgNotificationsPath(options.baseUrl, organizationId)}${qs ? `?${qs}` : ''}`;
      const res = await authedFetch(url, { method: 'GET', signal });
      const json = await requireOkJson(res, 'Could not load notifications.');
      return parseZenformedNotificationsPage(json);
    },

    async markRead({ organizationId, notificationId, signal }) {
      const url = orgNotificationsPath(
        options.baseUrl,
        organizationId,
        `/${encodeURIComponent(notificationId)}/read`
      );
      const res = await authedFetch(url, { method: 'POST', signal, body: '{}' });
      await requireOkJson(res, 'Could not mark notification as read.');
    },

    async markAllRead({ organizationId, signal }) {
      const url = orgNotificationsPath(options.baseUrl, organizationId, '/read-all');
      const res = await authedFetch(url, { method: 'POST', signal, body: '{}' });
      const json = await requireOkJson(res, 'Could not mark notifications as read.');
      const o =
        json != null && typeof json === 'object' && !Array.isArray(json)
          ? (json as Record<string, unknown>)
          : null;
      const n = o?.updatedCount;
      if (typeof n === 'number' && Number.isFinite(n) && n >= 0) return Math.floor(n);
      return 0;
    },
  };
}
