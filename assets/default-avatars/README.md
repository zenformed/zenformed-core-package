# Zenformed default profile avatars (static SVG)

Canonical offline copies of the DiceBear **fun-emoji** picker tiles used by `ProfilePhotoModal` (“Browse avatars”).

## Asset contract for consuming apps

1. **Catalog** — Seeds and URL helpers live in `@zenformed/core/dashboard-shell`:
   - `ZENFORMED_DEFAULT_AVATAR_SEEDS`
   - `zenformedDefaultAvatarSrc(seed)` → default `/avatars/{seed}.svg`

2. **Hosting** — Each Next.js app must expose matching files under:

   `public/avatars/<seed>.svg`

   for every seed in `ZENFORMED_DEFAULT_AVATAR_SEEDS`.

3. **Keeping files in sync** — Source-of-truth for SVG bytes is this folder
   (`packages/zenformed-core/assets/default-avatars/`). When regenerating:

   ```bash
   # From ForgeCore (example — downloads into ForgeCore public/)
   node scripts/download-avatars.js
   cp public/avatars/*.svg ../../packages/zenformed-core/assets/default-avatars/
   ```

   Then copy from here into any consumer app’s `public/avatars/` (or symlink if your toolchain supports it).

4. **Why TestApp broke before** — `ZenformedTestApp` had no `public/avatars/` folder; URLs `/avatars/*.svg` 404’d.

Do **not** change Core avatar APIs when touching these files; uploads still go through each app’s `/api/auth/me/photo`.
