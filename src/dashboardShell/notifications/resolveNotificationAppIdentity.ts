import {
  zenformedAppIconPublicSrc,
  zenformedAppIconSrc,
} from '../appsLauncher/zenformedAppIconCatalog';
import { resolveNotificationAppDisplayName } from './notificationAppDisplayName';

export type ZenformedNotificationAppIdentity = {
  readonly appSlug: string;
  readonly displayName: string;
  readonly iconSrc: string | null;
};

export { resolveNotificationAppDisplayName, stripRedundantAppNameBodyPrefix } from './notificationAppDisplayName';

export function resolveNotificationAppIdentity(appSlug: string): ZenformedNotificationAppIdentity {
  const normalized = appSlug.trim().toLowerCase() || 'unknown';
  const displayName = resolveNotificationAppDisplayName(normalized);
  const iconSrc =
    zenformedAppIconSrc(normalized) ?? zenformedAppIconPublicSrc(normalized) ?? null;
  return { appSlug: normalized, displayName, iconSrc };
}
