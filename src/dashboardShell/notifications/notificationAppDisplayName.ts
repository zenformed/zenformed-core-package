const KNOWN_APP_DISPLAY_NAMES: Readonly<Record<string, string>> = {
  platform: 'Zenformed Home',
  buildcore: 'BuildCore',
  forgecore: 'ForgeCore',
  formcore: 'FormCore',
  analyticscore: 'AnalyticsCore',
};

function humanizeUnknownSlug(slug: string): string {
  const cleaned = slug.trim().toLowerCase();
  if (!cleaned) return 'Zenformed app';
  const parts = cleaned.split(/[_-]+/).filter(Boolean);
  if (parts.length > 1) {
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  }
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function resolveNotificationAppDisplayName(appSlug: string): string {
  const normalized = appSlug.trim().toLowerCase();
  return KNOWN_APP_DISPLAY_NAMES[normalized] ?? humanizeUnknownSlug(normalized);
}

/**
 * Presentation-only: strip a redundant leading "AppName — " / "AppName - " from body
 * when it exactly matches the resolved display name. Does not rewrite otherwise.
 */
export function stripRedundantAppNameBodyPrefix(
  body: string,
  appDisplayName: string
): string {
  const name = appDisplayName.trim();
  if (!name) return body;
  const prefixes = [`${name} — `, `${name} - `, `${name} – `];
  for (const prefix of prefixes) {
    if (body.startsWith(prefix)) {
      return body.slice(prefix.length);
    }
  }
  return body;
}
