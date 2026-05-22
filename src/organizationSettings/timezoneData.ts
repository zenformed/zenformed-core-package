export const DEFAULT_ORGANIZATION_TIMEZONE = 'America/Chicago';

/** Fallback when `Intl.supportedValuesOf('timeZone')` is unavailable. */
const FALLBACK_IANA_TIMEZONES: readonly string[] = [
  'UTC',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'America/Anchorage',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/New_York',
  'America/Phoenix',
  'America/Toronto',
  'America/Vancouver',
  'Asia/Dubai',
  'Asia/Hong_Kong',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Europe/Berlin',
  'Europe/London',
  'Europe/Paris',
  'Pacific/Auckland',
  'Pacific/Honolulu',
];

let cachedTimezones: string[] | null = null;

export function listIanaTimezones(): string[] {
  if (cachedTimezones != null) return cachedTimezones;
  try {
    const supportedValuesOf = (
      Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] }
    ).supportedValuesOf;
    if (typeof supportedValuesOf === 'function') {
      const zones = supportedValuesOf('timeZone').slice().sort();
      cachedTimezones = zones;
      return zones;
    }
  } catch {
    /* use fallback */
  }
  cachedTimezones = [...FALLBACK_IANA_TIMEZONES].sort();
  return cachedTimezones;
}

export function formatTimezoneLabel(timezone: string): string {
  const normalized = timezone.trim();
  if (normalized.length === 0) return timezone;
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: normalized,
      timeZoneName: 'longOffset',
    });
    const offsetPart = formatter.formatToParts(new Date()).find((p) => p.type === 'timeZoneName');
    const offset = offsetPart?.value ?? '';
    const label = normalized.replace(/_/g, ' ');
    return offset ? `${label} (${offset})` : label;
  } catch {
    return normalized.replace(/_/g, ' ');
  }
}

export function resolveDefaultTimezone(saved: string | null | undefined): string {
  const trimmed = saved?.trim();
  if (trimmed) {
    const zones = listIanaTimezones();
    if (zones.includes(trimmed)) return trimmed;
  }
  try {
    const browser = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (browser && listIanaTimezones().includes(browser)) {
      return browser;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_ORGANIZATION_TIMEZONE;
}

export function filterTimezones(query: string, zones: readonly string[]): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return zones.slice(0, 80);
  return zones
    .filter((z) => {
      const label = formatTimezoneLabel(z).toLowerCase();
      return z.toLowerCase().includes(q) || label.includes(q);
    })
    .slice(0, 80);
}
