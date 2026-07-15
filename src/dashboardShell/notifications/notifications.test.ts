import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createZenformedNotificationsApi } from './createZenformedNotificationsApi';
import { isSafeNotificationDestinationUrl } from './destinationUrlSafety';
import { formatNotificationRelativeTime } from './formatNotificationRelativeTime';
import {
  mergeNotificationPages,
  withAllOptimisticReadAt,
  withOptimisticReadAt,
} from './notificationListHelpers';
import {
  parseUnreadCount,
  parseZenformedNotification,
  parseZenformedNotificationsPage,
} from './parseNotificationApi';
import {
  resolveNotificationAppDisplayName,
  stripRedundantAppNameBodyPrefix,
} from './notificationAppDisplayName';
import {
  clampUnreadCount,
  decrementUnreadCount,
  formatNotificationsTriggerAriaLabel,
  formatUnreadBadgeLabel,
} from './notificationStateHelpers';
import { ZenformedNotificationsApiError } from './notificationErrors';
import type { ZenformedNotification } from './types';

const SAMPLE: ZenformedNotification = {
  id: 'n1',
  appSlug: 'buildcore',
  type: 'workflow_task.assigned',
  title: 'Task assigned',
  body: 'Hello',
  destinationUrl: '/projects/a',
  actorUserId: null,
  entityType: null,
  entityId: null,
  metadata: {},
  readAt: null,
  createdAt: '2026-07-15T12:00:00.000Z',
};

describe('parse notification API', () => {
  it('maps Core notificationType to client type and strips omitted internals', () => {
    const parsed = parseZenformedNotification({
      id: '1',
      appSlug: 'buildcore',
      notificationType: 'workflow_task.assigned',
      title: 'T',
      body: 'B',
      destinationUrl: '/x',
      actorUserId: null,
      entityType: null,
      entityId: null,
      metadata: { a: 1 },
      readAt: null,
      createdAt: '2026-07-15T12:00:00.000Z',
      recipientUserId: 'should-not-appear',
      idempotencyKey: 'secret',
    });
    assert.ok(parsed);
    if (!parsed) return;
    assert.equal(parsed.type, 'workflow_task.assigned');
    assert.equal(parsed.destinationUrl, '/x');
    assert.equal('recipientUserId' in parsed, false);
    assert.equal('idempotencyKey' in parsed, false);
  });

  it('treats empty destination as null', () => {
    const parsed = parseZenformedNotification({
      ...SAMPLE,
      destinationUrl: '  ',
    });
    assert.ok(parsed);
    if (!parsed) return;
    assert.equal(parsed.destinationUrl, null);
  });

  it('parses page cursor metadata', () => {
    const page = parseZenformedNotificationsPage({
      notifications: [SAMPLE],
      nextCursor: 'abc',
      hasMore: true,
    });
    assert.equal(page.notifications.length, 1);
    assert.equal(page.nextCursor, 'abc');
    assert.equal(page.hasMore, true);
  });

  it('parses unread count', () => {
    assert.equal(parseUnreadCount({ unreadCount: 4 }), 4);
    assert.equal(parseUnreadCount({ unreadCount: -2 }), 0);
    assert.equal(parseUnreadCount({}), 0);
  });
});

describe('createZenformedNotificationsApi', () => {
  it('sends Bearer token and parses latest / unread / page / mark endpoints', async () => {
    const calls: Array<{ url: string; method: string; auth: string | null }> = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      const headers = new Headers(init?.headers);
      calls.push({
        url,
        method: (init?.method ?? 'GET').toUpperCase(),
        auth: headers.get('Authorization'),
      });

      if (url.includes('/latest')) {
        return new Response(
          JSON.stringify({
            notifications: [{ ...SAMPLE, notificationType: SAMPLE.type }],
            hasMore: false,
          }),
          { status: 200 }
        );
      }
      if (url.includes('/unread-count')) {
        return new Response(JSON.stringify({ unreadCount: 3 }), { status: 200 });
      }
      if (url.includes('/read-all')) {
        return new Response(JSON.stringify({ updatedCount: 2 }), { status: 200 });
      }
      if (url.includes('/read')) {
        return new Response(JSON.stringify({ notification: SAMPLE, alreadyRead: false }), {
          status: 200,
        });
      }
      if (url.includes('cursor=c1')) {
        return new Response(
          JSON.stringify({
            notifications: [{ ...SAMPLE, id: 'n2' }],
            nextCursor: null,
            hasMore: false,
          }),
          { status: 200 }
        );
      }
      return new Response(
        JSON.stringify({ notifications: [SAMPLE], nextCursor: 'c1', hasMore: true }),
        { status: 200 }
      );
    };

    const api = createZenformedNotificationsApi({
      baseUrl: 'https://core.example/api',
      getAccessToken: () => 'token-abc',
      fetchImpl,
    });

    const latest = await api.getLatest({ organizationId: 'org-1', limit: 10 });
    assert.equal(latest.length, 1);
    assert.equal(latest[0]?.type, 'workflow_task.assigned');

    const unread = await api.getUnreadCount({ organizationId: 'org-1' });
    assert.equal(unread, 3);

    const page = await api.getPage({ organizationId: 'org-1', limit: 20 });
    assert.equal(page.hasMore, true);
    assert.equal(page.nextCursor, 'c1');

    const page2 = await api.getPage({ organizationId: 'org-1', cursor: 'c1' });
    assert.equal(page2.notifications[0]?.id, 'n2');

    await api.markRead({ organizationId: 'org-1', notificationId: 'n1' });
    const updated = await api.markAllRead({ organizationId: 'org-1' });
    assert.equal(updated, 2);

    assert.ok(calls.every((c) => c.auth === 'Bearer token-abc'));
    assert.ok(calls.some((c) => c.url.includes('/organizations/org-1/notifications/latest')));
    assert.ok(calls.some((c) => c.url.includes('/unread-count')));
    assert.ok(calls.some((c) => c.method === 'POST' && c.url.endsWith('/n1/read')));
    assert.ok(calls.some((c) => c.method === 'POST' && c.url.endsWith('/read-all')));
  });

  it('throws typed errors on non-2xx', async () => {
    const api = createZenformedNotificationsApi({
      baseUrl: 'https://core.example',
      getAccessToken: () => 't',
      fetchImpl: async () =>
        new Response(JSON.stringify({ error: 'forbidden', message: 'Nope' }), { status: 403 }),
    });

    await assert.rejects(
      () => api.getUnreadCount({ organizationId: 'org' }),
      (err: unknown) =>
        err instanceof ZenformedNotificationsApiError && err.status === 403
    );
  });

  it('requires an access token', async () => {
    const api = createZenformedNotificationsApi({
      baseUrl: 'https://core.example',
      getAccessToken: () => null,
      fetchImpl: async () => new Response('{}', { status: 200 }),
    });
    await assert.rejects(
      () => api.getUnreadCount({ organizationId: 'org' }),
      (err: unknown) => err instanceof ZenformedNotificationsApiError && err.status === 401
    );
  });
});

describe('unread badge and aria labels', () => {
  it('hides at zero, shows counts, and caps at 99+', () => {
    assert.equal(formatUnreadBadgeLabel(0), null);
    assert.equal(formatUnreadBadgeLabel(4), '4');
    assert.equal(formatUnreadBadgeLabel(99), '99');
    assert.equal(formatUnreadBadgeLabel(100), '99+');
    assert.equal(formatNotificationsTriggerAriaLabel(0), 'Notifications');
    assert.equal(formatNotificationsTriggerAriaLabel(1), 'Notifications, 1 unread');
    assert.equal(formatNotificationsTriggerAriaLabel(4), 'Notifications, 4 unread');
    assert.equal(
      formatNotificationsTriggerAriaLabel(120),
      'Notifications, more than 99 unread'
    );
  });

  it('never decrements unread below zero', () => {
    assert.equal(decrementUnreadCount(0, 1), 0);
    assert.equal(decrementUnreadCount(1, 1), 0);
    assert.equal(clampUnreadCount(-5), 0);
  });
});

describe('optimistic list helpers', () => {
  it('marks one and all read without removing items', () => {
    const readAt = '2026-07-15T13:00:00.000Z';
    const one = withOptimisticReadAt([SAMPLE, { ...SAMPLE, id: 'n2' }], 'n1', readAt);
    assert.equal(one[0]?.readAt, readAt);
    assert.equal(one[1]?.readAt, null);
    assert.equal(one.length, 2);

    const all = withAllOptimisticReadAt(one, readAt);
    assert.ok(all.every((n) => n.readAt === readAt));
  });

  it('merges pages without duplicates', () => {
    const merged = mergeNotificationPages([SAMPLE], [SAMPLE, { ...SAMPLE, id: 'n2' }]);
    assert.equal(merged.length, 2);
    assert.equal(merged[1]?.id, 'n2');
  });
});

describe('destination safety and app identity', () => {
  it('allows relative and https destinations; rejects javascript', () => {
    assert.equal(isSafeNotificationDestinationUrl('/projects/a'), true);
    assert.equal(isSafeNotificationDestinationUrl('https://app.zenformed.com/x'), true);
    assert.equal(isSafeNotificationDestinationUrl('http://localhost:3000/x'), true);
    assert.equal(isSafeNotificationDestinationUrl('javascript:alert(1)'), false);
    assert.equal(isSafeNotificationDestinationUrl('//evil.com'), false);
    assert.equal(isSafeNotificationDestinationUrl(null), false);
  });

  it('resolves known and unknown app display names', () => {
    assert.equal(resolveNotificationAppDisplayName('buildcore'), 'BuildCore');
    assert.equal(resolveNotificationAppDisplayName('platform'), 'Zenformed Home');
    assert.equal(resolveNotificationAppDisplayName('future_app'), 'Future App');
  });

  it('strips only an exact leading app-name dash prefix from body', () => {
    assert.equal(
      stripRedundantAppNameBodyPrefix('BuildCore — Julie assigned you', 'BuildCore'),
      'Julie assigned you'
    );
    assert.equal(
      stripRedundantAppNameBodyPrefix('Julie assigned you on BuildCore', 'BuildCore'),
      'Julie assigned you on BuildCore'
    );
  });
});

describe('relative time', () => {
  it('formats compact relative times and handles invalid dates', () => {
    const now = Date.parse('2026-07-15T12:00:00.000Z');
    assert.equal(
      formatNotificationRelativeTime(new Date(now - 30_000).toISOString(), now),
      'Just now'
    );
    assert.equal(
      formatNotificationRelativeTime(new Date(now - 4 * 60_000).toISOString(), now),
      '4m ago'
    );
    assert.equal(
      formatNotificationRelativeTime(new Date(now - 2 * 3600_000).toISOString(), now),
      '2h ago'
    );
    assert.equal(formatNotificationRelativeTime('not-a-date', now), 'Unknown time');
  });
});
