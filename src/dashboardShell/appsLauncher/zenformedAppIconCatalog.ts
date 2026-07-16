import buildcoreIcon from '../../../assets/app-icons/buildcore.png';
import forgecoreIcon from '../../../assets/app-icons/forgecore.png';
import formcoreIcon from '../../../assets/app-icons/formcore.png';
import analyticscoreIcon from '../../../assets/app-icons/analyticscore.png';
import platformIcon from '../../../assets/app-icons/platform.png';
import type { ZenformedAppRegistryEntry } from './types';

type BundledImageModule = string | { readonly src: string };

function toBundledImageUrl(module: BundledImageModule): string {
  return typeof module === 'string' ? module : module.src;
}

/** Registry ids with bundled icons in `@zenformed/core/assets/app-icons/`. */
export const ZENFORMED_ECOSYSTEM_APP_ICON_IDS = [
  'platform',
  'buildcore',
  'forgecore',
  'formcore',
  'analyticscore',
] as const;

export type ZenformedEcosystemAppIconId = (typeof ZENFORMED_ECOSYSTEM_APP_ICON_IDS)[number];

const BUNDLED_ICON_SRC: Record<ZenformedEcosystemAppIconId, string> = {
  platform: toBundledImageUrl(platformIcon),
  buildcore: toBundledImageUrl(buildcoreIcon),
  forgecore: toBundledImageUrl(forgecoreIcon),
  formcore: toBundledImageUrl(formcoreIcon),
  analyticscore: toBundledImageUrl(analyticscoreIcon),
};

export type ZenformedAppIconPublicSrcOptions = {
  /**
   * URL prefix for static hosting fallback (default `/zenformed-app-icons`).
   * Copy PNGs from `@zenformed/core/assets/app-icons/` into `public/zenformed-app-icons/`.
   */
  basePath?: string;
  extension?: string;
};

/** Bundled icon URL resolved by Next/webpack when `transpilePackages` includes `@zenformed/core`. */
export function zenformedAppIconSrc(id: string): string | undefined {
  if (!isZenformedEcosystemAppIconId(id)) return undefined;
  return BUNDLED_ICON_SRC[id];
}

export function isZenformedEcosystemAppIconId(id: string): id is ZenformedEcosystemAppIconId {
  return (ZENFORMED_ECOSYSTEM_APP_ICON_IDS as readonly string[]).includes(id);
}

/** Public static-file URL fallback when bundler imports are unavailable. */
export function zenformedAppIconPublicSrc(
  id: string,
  options?: ZenformedAppIconPublicSrcOptions
): string | undefined {
  if (!isZenformedEcosystemAppIconId(id)) return undefined;
  const rawBase = options?.basePath ?? '/zenformed-app-icons';
  const base = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
  const ext = options?.extension ?? 'png';
  return `${base}/${encodeURIComponent(id)}.${ext}`;
}

/** Prefer explicit entry overrides, then bundled package assets, then public URL fallback. */
export function resolveZenformedAppIconSrc(
  entry: ZenformedAppRegistryEntry,
  options?: ZenformedAppIconPublicSrcOptions
): string | undefined {
  if (entry.iconSrc?.trim()) return entry.iconSrc.trim();
  if (entry.icon?.trim()) return entry.icon.trim();
  return zenformedAppIconSrc(entry.id) ?? zenformedAppIconPublicSrc(entry.id, options);
}
