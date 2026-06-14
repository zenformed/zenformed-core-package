export type ZenformedOrganizationBrandingShellState = {
  shopName: string;
  logoUrl: string | null;
  hasLogo: boolean;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

export type ZenformedOrganizationBrandingProviderProps = {
  defaultDisplayNameFallback: string;
  brandingApiUrl?: string;
  brandingLogoApiUrl?: string;
  getAccessToken: () => string | null;
  sessionUserId: string | null;
  /** When true, logo fetch requires a bearer token (Core SaaS branding). */
  requireAuthForLogo?: boolean;
  /** When true, clears degraded Core unreachable state and retries meta fetch. */
  corePlatformAvailable?: boolean;
};
