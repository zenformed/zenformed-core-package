# @zenformed/core

Zenformed platform types, entitlement helpers, and shared dashboard shell UI.

## Package entries

| Import | Purpose |
|--------|---------|
| `@zenformed/core` | Browser-safe entitlements / catalogs |
| `@zenformed/core/server` | Capability resolver (`node:crypto`) |
| `@zenformed/core/dashboard-shell` | Shared header, apps launcher, **platform notifications UI** |
| `@zenformed/core/organization-settings` | Org settings overlay |
| `@zenformed/core/organization-branding` | Branding provider |
| `@zenformed/core/auth` | Shared auth forms |
| `@zenformed/core/legal` | Legal documents |

## Platform notifications (Phase 2)

See [`src/dashboardShell/notifications/README.md`](src/dashboardShell/notifications/README.md).

Hosts opt into the header envelope via optional `notifications` on `ZenformedDashboardHeader`, and mount `ZenformedNotificationsPage` on their `/notifications` route. Browser code does **not** create notifications.
