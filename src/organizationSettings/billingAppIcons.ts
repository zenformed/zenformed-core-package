import {
  zenformedAppIconPublicSrc,
  zenformedAppIconSrc,
} from '../dashboardShell/appsLauncher/zenformedAppIconCatalog';

export function resolveBillingAppIconSrc(
  appSlug: string,
  iconBaseUrl?: string | null
): string | undefined {
  const normalized = appSlug.trim().toLowerCase();
  const bundled = zenformedAppIconSrc(normalized);
  if (bundled) return bundled;

  const publicBasePath =
    iconBaseUrl != null && iconBaseUrl.trim() !== ''
      ? `${iconBaseUrl.replace(/\/+$/, '')}/zenformed-app-icons`
      : undefined;

  return zenformedAppIconPublicSrc(normalized, publicBasePath ? { basePath: publicBasePath } : undefined);
}
