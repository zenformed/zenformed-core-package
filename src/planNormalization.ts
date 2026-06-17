import { findAppPlanCatalogEntry, normalizeAppSlug, type NormalizedPlanSlug } from './appPlanCatalog';

const LEGACY_PLAN_ALIASES: Readonly<Record<string, NormalizedPlanSlug>> = {
  pro: 'pro',
  PRO: 'pro',
  starter: 'starter',
  STARTER: 'starter',
  growth: 'growth',
  GROWTH: 'growth',
  standard: 'standard',
  STANDARD: 'standard',
  single: 'single',
  SINGLE: 'single',
};

/**
 * Normalize a raw `platform_app_entitlements.plan_code` to a catalog plan slug.
 * Legacy PRO maps to `pro`. Starter/growth are never collapsed to standard.
 */
export function normalizePlanSlug(
  appSlug: string,
  planCodeOriginal: string | null | undefined
): string {
  const raw = typeof planCodeOriginal === 'string' ? planCodeOriginal.trim() : '';
  if (raw === '') return '';

  const alias = LEGACY_PLAN_ALIASES[raw];
  if (alias != null) return alias;

  const lower = raw.toLowerCase();
  const aliasLower = LEGACY_PLAN_ALIASES[lower];
  if (aliasLower != null) return aliasLower;

  const catalogMatch = findAppPlanCatalogEntry(normalizeAppSlug(appSlug), lower);
  if (catalogMatch != null) return catalogMatch.planSlug;

  return lower;
}

export function resolvePlanCodeOriginal(planCode: string | null | undefined): string {
  if (planCode == null) return '';
  return String(planCode).trim();
}
