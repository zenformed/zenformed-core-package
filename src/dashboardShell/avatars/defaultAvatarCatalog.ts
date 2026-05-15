/**
 * Default profile-photo picker options: offline SVGs served from each app's `public/` folder.
 * Seeds align with DiceBear `fun-emoji` downloads — see `assets/default-avatars/README.md`.
 */

export const ZENFORMED_DEFAULT_AVATAR_SEEDS = [
  'cool',
  'grin',
  'wink',
  'smile',
  'laugh',
  'joy',
  'peace',
  'happy',
  'star',
  'sun',
  'moon',
  'fire',
  'rocket',
  'rainbow',
  'sparkle',
  'coffee',
  'pizza',
  'music',
  'game',
  'robot',
] as const;

export type ZenformedDefaultAvatarSeed = (typeof ZENFORMED_DEFAULT_AVATAR_SEEDS)[number];

export type ZenformedDefaultAvatarSrcOptions = {
  /**
   * URL segment before `/seed.svg`, starting with `/`. Default `/avatars`
   * → Next.js serves files from `public/avatars/`.
   */
  basePath?: string;
  extension?: string;
};

/**
 * Public URL for a bundled default avatar image (same contract as `<Image />` / static files).
 */
export function zenformedDefaultAvatarSrc(
  seed: string,
  options?: ZenformedDefaultAvatarSrcOptions
): string {
  const rawBase = options?.basePath ?? '/avatars';
  const base = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
  const ext = options?.extension ?? 'svg';
  return `${base}/${encodeURIComponent(seed)}.${ext}`;
}

export function isZenformedDefaultAvatarSeed(s: string): s is ZenformedDefaultAvatarSeed {
  return (ZENFORMED_DEFAULT_AVATAR_SEEDS as readonly string[]).includes(s);
}
