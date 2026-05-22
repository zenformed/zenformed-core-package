# Organization Settings — future data & APIs

## Implemented

### User / account profile

- `first_name`, `last_name`, `marketing_email_opt_in`, `sms_opt_in` on `profiles`
- ZenformedCore `GET|PATCH /users/me/settings` + app BFF `/api/internal/users-me-settings`
- Shared UI: Account profile + Notification preferences with save states

### Password

- Settings drawer shows empty password fields only (no API hydration)
- Real password change via auth provider / existing onboarding screens (TODO)

## Next backend milestone (read models)

See `organizationSettingsReadModels.ts` for TypeScript contracts.

### 1. Organization members

- Table: `organization_members` (org_id, user_id, role)
- Core: `GET /users/me/organization/members` (list for resolved org)
- UI: replace empty Team Members list

### 2. Seat limit / seats used

- Source: subscription or `organization_entitlements` seat cap
- Core: include in `GET /users/me/organization/workspace` or billing snapshot
- UI: real `Seats used: N / M` in Team Members

### 3. App access / entitlements

- Table: `organization_app_entitlements` or platform mirror + `platform_apps`
- Core: `GET /users/me/organization/apps`
- UI: App Access + Apps & Billing rows from entitlements (not demo rows)

### 4. Pending invites

- Table: `organization_invites` (email, status, sent_at, invited_by)
- Core: `GET/POST/DELETE /users/me/organization/invites` (no email send in first pass)
- UI: invite list, resend/cancel when APIs exist

### Suggested aggregated endpoint

`GET /users/me/organization/workspace` → `OrganizationWorkspaceSettingsReadModel`:

- `members`, `seatUsage`, `appAccess`, `pendingInvites`

### Not in next pass

- Invite email delivery
- Stripe billing portal
- Full role/permission matrix

## Organization profile (partial today)

- Name/logo may come from branding hooks in apps
- Industry/timezone org fields: align with `PATCH /users/me/organization/branding` or org settings API

## Permissions (later)

- Org roles vs app-level roles, audit logs, API keys, SSO, device management
