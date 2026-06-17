/**
 * Central app plan catalog for store-ready entitlements (no DB migration required).
 * Each suite app defines purchasable plans with optional capability placeholders.
 */

export type NormalizedPlanSlug = 'starter' | 'growth' | 'pro' | 'standard' | 'single';

export type AppPlanCapabilityKey =
  | 'kanbanBoard'
  | 'databaseWorkOrderCreate'
  | 'databaseWorkOrderEdit';

export type AppPlanCatalogEntry = {
  readonly appSlug: string;
  readonly planSlug: NormalizedPlanSlug;
  readonly displayName: string;
  /** Placeholder for future billing; null when price is not yet defined. */
  readonly monthlyPriceCents: number | null;
  readonly capabilities: Readonly<Partial<Record<AppPlanCapabilityKey, boolean>>>;
};

const FORGECORE_PLANS: readonly AppPlanCatalogEntry[] = [
  {
    appSlug: 'forgecore',
    planSlug: 'starter',
    displayName: 'Starter',
    monthlyPriceCents: null,
    capabilities: {},
  },
  {
    appSlug: 'forgecore',
    planSlug: 'growth',
    displayName: 'Growth',
    monthlyPriceCents: null,
    capabilities: { databaseWorkOrderCreate: true },
  },
  {
    appSlug: 'forgecore',
    planSlug: 'pro',
    displayName: 'Pro',
    monthlyPriceCents: null,
    capabilities: {
      kanbanBoard: true,
      databaseWorkOrderCreate: true,
      databaseWorkOrderEdit: true,
    },
  },
];

const BUILDCORE_PLANS: readonly AppPlanCatalogEntry[] = [
  {
    appSlug: 'buildcore',
    planSlug: 'starter',
    displayName: 'Starter',
    monthlyPriceCents: null,
    capabilities: {},
  },
  {
    appSlug: 'buildcore',
    planSlug: 'growth',
    displayName: 'Growth',
    monthlyPriceCents: null,
    capabilities: {},
  },
  {
    appSlug: 'buildcore',
    planSlug: 'pro',
    displayName: 'Pro',
    monthlyPriceCents: null,
    capabilities: {},
  },
];

const FORMCORE_PLANS: readonly AppPlanCatalogEntry[] = [
  {
    appSlug: 'formcore',
    planSlug: 'standard',
    displayName: 'Standard',
    monthlyPriceCents: null,
    capabilities: {},
  },
  {
    appSlug: 'formcore',
    planSlug: 'single',
    displayName: 'Single',
    monthlyPriceCents: null,
    capabilities: {},
  },
];

export const PLATFORM_APP_PLAN_CATALOG: readonly AppPlanCatalogEntry[] = [
  ...BUILDCORE_PLANS,
  ...FORGECORE_PLANS,
  ...FORMCORE_PLANS,
];

export function normalizeAppSlug(appSlug: string | null | undefined): string {
  return typeof appSlug === 'string' ? appSlug.trim().toLowerCase() : '';
}

export function getAppPlanCatalogEntries(appSlug: string): AppPlanCatalogEntry[] {
  const slug = normalizeAppSlug(appSlug);
  return PLATFORM_APP_PLAN_CATALOG.filter((entry) => entry.appSlug === slug);
}

export function findAppPlanCatalogEntry(
  appSlug: string,
  planSlug: string
): AppPlanCatalogEntry | undefined {
  const normalizedApp = normalizeAppSlug(appSlug);
  const normalizedPlan = planSlug.trim().toLowerCase();
  return PLATFORM_APP_PLAN_CATALOG.find(
    (entry) => entry.appSlug === normalizedApp && entry.planSlug === normalizedPlan
  );
}

/** Plans not currently owned — for future store/cart surfacing. */
export function listPurchasablePlansForApp(
  appSlug: string,
  activePlanSlug: string | null | undefined
): AppPlanCatalogEntry[] {
  const active = activePlanSlug?.trim().toLowerCase() ?? '';
  return getAppPlanCatalogEntries(appSlug).filter((entry) => entry.planSlug !== active);
}

export function hasAppPlanCapability(
  appSlug: string,
  planSlugNormalized: string,
  capability: AppPlanCapabilityKey
): boolean {
  const entry = findAppPlanCatalogEntry(appSlug, planSlugNormalized);
  return entry?.capabilities[capability] === true;
}
