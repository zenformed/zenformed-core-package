# Organization Settings — future data & APIs

This module is UI-first. The following are expected platform migrations and APIs.

## User / account profile

- Implemented: `first_name`, `last_name`, `marketing_email_opt_in`, `sms_opt_in` on `profiles`
- Implemented: ZenformedCore `GET|PATCH /users/me/settings` + app BFF `/api/internal/users-me-settings`
- Password change via auth provider API (not in settings drawer yet)

## Organization

- `organizations` profile: name, logo, industry, timezone
- Organization branding sync with existing shop/tenant branding hooks

## Membership & invites

- `organization_members` (user_id, org_id, role)
- `organization_invites` (email, status, sent_at, invited_by)
- Seat counts from subscription / entitlement service
- Invite send/resend/cancel APIs (no email infra in first pass)

## App entitlements

- `organization_app_entitlements` (app_id, plan, status)
- Per-app upgrade/buy flows via billing provider

## Billing

- Stripe (or provider) customer portal, invoices
- Plan tier, seat limits, subscription status

## Permissions (later)

- Org roles vs app-level roles
- Audit logs, API keys, integrations, SSO, device management

## Suggested API surface (illustrative)

- `GET/PATCH /api/organization/settings`
- `GET/PATCH /api/account/profile`
- `GET/PATCH /api/account/notification-preferences`
- `GET/POST/DELETE /api/organization/members`, `/invites`
- `GET /api/organization/apps`, `/billing`
