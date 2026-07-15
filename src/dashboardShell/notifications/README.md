# Platform notifications (Phase 2 — shared UI)

`@zenformed/core/dashboard-shell` owns the reusable inbox UI and client adapter for ZenformedCore consumer notification APIs.

**Does not create notifications in the browser.** Creation stays on authenticated first-party server/BFF flows against Core.

## Host integration

### 1. Create an API adapter

Point `baseUrl` at ZenformedCore **or** a thin host BFF that proxies the same org routes:

```ts
import { createZenformedNotificationsApi } from '@zenformed/core/dashboard-shell';

const notificationsApi = createZenformedNotificationsApi({
  baseUrl: process.env.NEXT_PUBLIC_ZENFORMED_CORE_API_URL!, // or '/api/zenformed-core'
  getAccessToken: () => session?.access_token ?? null,
});
```

Routes used (Bearer JWT):

| Adapter method | Core path |
|----------------|-----------|
| `getLatest` | `GET /organizations/:organizationId/notifications/latest` |
| `getUnreadCount` | `GET /organizations/:organizationId/notifications/unread-count` |
| `getPage` | `GET /organizations/:organizationId/notifications?limit=&cursor=` |
| `markRead` | `POST /organizations/:organizationId/notifications/:id/read` |
| `markAllRead` | `POST /organizations/:organizationId/notifications/read-all` |

You may inject a custom `ZenformedNotificationsApi` instead of the fetch factory.

### 2. Enable the header envelope (opt-in)

```tsx
<ZenformedDashboardHeader
  /* …existing props… */
  notifications={{
    organizationId: activeOrganizationId,
    api: notificationsApi,
    notificationsPageHref: '/notifications',
    onNavigate: (url) => {
      // Host-owned navigation (Next router, window.location, cross-app, etc.)
      if (url.startsWith('/')) router.push(url);
      else window.location.assign(url);
    },
  }}
/>
```

Omit `notifications` to leave existing apps unchanged. Placement: after `themeToggle` / apps controls, immediately before the account avatar.

### 3. Mount the shared page body

```tsx
// app/(dashboard)/notifications/page.tsx (host-owned route)
<ZenformedNotificationsPage
  organizationId={activeOrganizationId}
  api={notificationsApi}
  onNavigate={handleNotificationNavigate}
/>
```

## Behavior

| Topic | Rule |
|-------|------|
| Scope | Authenticated user + active organization |
| Polling | Unread count every 30s; pause while `document.hidden`; refresh on focus / visibility / dropdown open |
| Dropdown open | Refreshes latest + unread; **does not** mark read |
| Full page open | **Does not** mark read |
| Checkmark | Marks that item read only; keeps dropdown open |
| Row click | Optimistic mark-read if unread, then `onNavigate` (does not wait) |
| Mark all | Explicit control only |
| Org change | Controller resets and refetches |

## Expected host BFF work (Phase 3)

For BuildCore / Platform:

1. Thin authenticated proxy routes that forward the five consumer endpoints (or call Core with the user Bearer).
2. Pass `organizationId` from the active membership context.
3. Wire `notifications` on `ZenformedDashboardHeader`.
4. Add `/notifications` route mounting `ZenformedNotificationsPage`.
5. Implement `onNavigate` for in-app relative paths and absolute Zenformed URLs.
6. Later: server-side producers that call Core `POST .../notifications` after business actions (not from this package).

## Styles

Components ship with `notifications.module.css` (theme tokens). Optional import:

```ts
import '@zenformed/core/dashboard-shell/notifications.module.css';
```

(Usually unnecessary — components import the module directly when the host transpiles `@zenformed/core`.)

## Fixtures

`ZENFORMED_NOTIFICATION_FIXTURES` / `ZENFORMED_NOTIFICATION_FIXTURE_LIST` are for demos/tests only.
