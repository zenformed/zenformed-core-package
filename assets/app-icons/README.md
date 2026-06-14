# Zenformed ecosystem app launcher icons

PNG tiles for the shared `@zenformed/core` apps launcher popover (Google-style grid).

## Location

`@zenformed/core/assets/app-icons/` (this folder in the published package).

## Required filenames

| File | Registry `id` |
|------|----------------|
| `platform.png` | `platform` |
| `buildcore.png` | `buildcore` |
| `forgecore.png` | `forgecore` |
| `formcore.png` | `formcore` |

## Recommended size

- **96×96 px** source (displayed at ~40–48 px in the launcher tile; extra resolution keeps icons crisp on retina).
- PNG with transparency or solid background; square aspect ratio.
- Keep file size small (ideally under 50 KB per icon).

## How icons are loaded

1. **Default (Next.js apps)** — Icons are statically imported in `@zenformed/core/dashboard-shell` and bundled when `transpilePackages: ['@zenformed/core']` is set in `next.config.js`.
2. **Override per registry entry** — Set `icon` or `iconSrc` on `ZenformedAppRegistryEntry`.
3. **Public folder fallback** — `zenformedAppIconPublicSrc(id)` → `/zenformed-app-icons/{id}.png`. Copy files from this folder into each app’s `public/zenformed-app-icons/` if you cannot use bundler imports.

## Adding a new app icon

1. Add `{appId}.png` (96×96 recommended) to this folder.
2. Register the id in `ZENFORMED_ECOSYSTEM_APP_ICON_IDS` and `BUNDLED_ICON_SRC` in `src/dashboardShell/appsLauncher/zenformedAppIconCatalog.ts`.
3. Add a `ZenformedAppRegistryEntry` with matching `id` in the consuming app registry.
4. Publish `@zenformed/core` and reinstall in consuming apps.
5. Optional: copy the PNG to `public/zenformed-app-icons/` for static fallback hosting.
