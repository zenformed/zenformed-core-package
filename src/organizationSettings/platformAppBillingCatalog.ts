/** Suite apps eligible for Apps & Billing entitlement cards. */
export const PLATFORM_SUITE_APP_SLUGS = [
  'buildcore',
  'forgecore',
  'formcore',
  'analyticscore',
] as const;

export type PlatformSuiteAppSlug = (typeof PLATFORM_SUITE_APP_SLUGS)[number];

export type BillingPlanBadgeVariant = 'starter' | 'growth' | 'pro' | 'standard' | 'single' | 'default';

export type BillingStatusBadgeVariant = 'trial' | 'active' | 'inactive';

const PLATFORM_APP_DISPLAY_NAMES: Readonly<Record<string, string>> = {
  buildcore: 'BuildCore',
  forgecore: 'ForgeCore',
  formcore: 'FormCore',
  analyticscore: 'AnalyticsCore',
};

export function formatPlatformAppDisplayName(appSlug: string): string {
  const normalized = appSlug.trim().toLowerCase();
  return PLATFORM_APP_DISPLAY_NAMES[normalized] ?? normalized;
}

export function resolvePlanBadgeVariant(planSlug: string): BillingPlanBadgeVariant {
  const normalized = planSlug.trim().toLowerCase();
  if (normalized === 'starter') return 'starter';
  if (normalized === 'growth') return 'growth';
  if (normalized === 'pro') return 'pro';
  if (normalized === 'standard') return 'standard';
  if (normalized === 'single') return 'single';
  return 'default';
}

export function resolveStatusBadgeVariant(entitlementStatus: string): BillingStatusBadgeVariant {
  const normalized = entitlementStatus.trim().toLowerCase();
  if (normalized === 'trial') return 'trial';
  if (normalized === 'active') return 'active';
  return 'inactive';
}
