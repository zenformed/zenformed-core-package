# Dashboard shell CSS module contract

Consuming apps (ForgeCore, ZenformedTestApp, future CRM shells) pass **`import styles from '*.module.css'`** objects into `pick*` helpers from `@zenformed/core/dashboard-shell`. Each helper expects **exact camelCase export names** (matching local CSS class selectors as emitted by the bundler).

## Fallback behavior

If a key is missing from `styles`, the pick helpers substitute **`''`**. Layout **does not throw** in production.

### Dev-only diagnostics

In **`NODE_ENV === 'development'`**, missing keys (undefined **or** empty string on the CSS module object) log:

```txt
[@zenformed/core/dashboard-shell] <pickFunction>: missing or empty CSS module keys …
```

Production builds never emit these warnings.

---

## 1. `dashboard.module.css` (dashboard route)

Typical path: `app/(dashboard)/dashboard/dashboard.module.css`.

### Sidebar branding — `pickSidebarBrandingClassNames` → `ZenformedSidebarBranding`

| Key | Role |
|-----|------|
| `sidebarAppBranding` | Wrapper for app icon. |
| `sidebarLogoCircleWrap` | Icon container. |
| `sidebarLogoCircle` | Icon box (rounded square). |
| `sidebarLogoImg` | App icon `<img>`. |
| `sidebarLogoInitial` | Fallback initial when no icon. |

### Header & account menu — `pickHeaderShellClassNames` → `ZenformedDashboardHeader`, `ZenformedAccountMenu`

| Key | Role |
|-----|------|
| `header` | Outer `<header>`. |
| `headerLeft` | Left region (often empty / `aria-hidden`). |
| `headerRight` | User block + theme toggle + account menu. |
| `headerRightUserBlock` | Email + badges column. |
| `headerUserEmail` | Email line in header rail. |
| `badgeRow` | Tier + admin badges. |
| `tierBadge` | Base tier pill. |
| `tierBadgePro` | Combined with `tierBadge` for PRO. |
| `tierBadgeStandard` | Combined with `tierBadge` for non-PRO. |
| `adminBadge` | Admin label. |
| `accountMenuWrap` | Dropdown positioning context. |
| `accountMenuTrigger` | Avatar trigger button. |
| `accountMenuTriggerImg` | Trigger image. |
| `accountMenuTriggerAvatar` | Initials fallback circle on trigger. |
| `accountMenuDropdown` | Dropdown panel. |
| `accountMenuEmail` | Email in menu. |
| `accountMenuPhotoWrap` | Large avatar + camera row. |
| `accountMenuPhotoCircle` | Circle around menu avatar. |
| `accountMenuPhotoImg` | Menu avatar image. |
| `accountMenuAvatar` | Menu initials fallback. |
| `accountMenuPhotoCameraBtn` | Profile photo camera in menu. |
| `accountMenuShopName` | Company line in menu. |
| `accountMenuBtn` | Settings / sign-out rows. |
| `accountMenuBtnIcon` | Icon in menu buttons. |

### Settings drawer — `pickSettingsDrawerClassNames` → `ZenformedSettingsDrawer`

| Key | Role |
|-----|------|
| `settingsOverlay` | Full-screen click-away backdrop. |
| `settingsDrawer` | Drawer panel. |
| `settingsHeader` | Title row. |
| `settingsTitle` | Heading text. |
| `settingsClose` | × button. |
| `settingsTabs` | Tab strip `<nav>`. |
| `settingsTab` | Inactive tab. |
| `settingsTabActive` | Active tab. |
| `settingsContent` | Scrollable body. |

### App shell & sidebar row — `pickDashboardAppShellClassNames`, `pickDashboardSidebarRowClassNames`, `pickDashboardLayoutClassNames`

| Key | Role |
|-----|------|
| `appLayout` | `ZenformedDashboardAppShell` root. |
| `dashboardWithSidebar` | Row: sidebar + main. |
| `mainColumn` | Main column wrapper (header + content). |

`pickDashboardLayoutClassNames` validates **all three** in one dev warning.

### Page loading — `pickDashboardPageLoadingClassNames` → `ZenformedDashboardPageLoading`

| Key | Role |
|-----|------|
| `page` | Full-page loading container. |
| `loading` | Loading paragraph. |

---

## 2. `ConfirmModal.module.css`

Typical path: `src/presentation/components/ConfirmModal/ConfirmModal.module.css`.

### Confirm snackbar — `pickConfirmSnackbarClassNames` → `ZenformedConfirmSnackbar`

| Key | Role |
|-----|------|
| `snackbar` | Fixed bottom bar container. |
| `snackbarInner` | Inner flex row. |
| `snackbarIcon` | Icon circle. |
| `icon` | SVG color (non-danger). |
| `iconDanger` | SVG color for destructive confirms. |
| `snackbarText` | Title + message stack. |
| `snackbarTitle` | Title text. |
| `snackbarMessage` | Body text. |
| `snackbarActions` | Button group. |
| `cancelBtn` | Cancel. |
| `confirmBtn` | Primary confirm. |
| `confirmBtnDanger` | Destructive confirm. |

---

## Optional — not part of the shared pick contract

These often live in the same `dashboard.module.css` but are **app-owned** (not read by `@zenformed/core/dashboard-shell` picks):

- **ForgeCore header toolbar**: `headerSearchWrap`, `headerSearch`, `headerSearchIcon`, `headerNewOrderBtn`, …
- **ForgeCore board**: `section`, `mainContent`, `listViewWrap`, `kanbanWrapper`, actions toolbar, banners.
- **Wallboard**, upload errors modal, license lockout, etc.

---

## Source of truth (code)

Canonical arrays: **`cssModuleContract.ts`** (`ZENFORMED_*_CSS_KEYS`). Update that file when extending the shell, then align this document.
