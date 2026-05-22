/**
 * Product default: promotional email + SMS opt-in are on unless the user explicitly opted out (false).
 * Null/undefined from legacy rows or partial API payloads resolve to true.
 */
export function resolveNotificationOptIn(value: boolean | null | undefined): boolean {
  return value !== false;
}

export const DEFAULT_NOTIFICATION_PREFS = {
  marketingEmailOptIn: true,
  smsOptIn: true,
} as const;
