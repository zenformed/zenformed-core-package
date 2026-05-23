'use client';

import {
  ZenformedOrganizationSettingsOverlay,
  type ZenformedOrganizationSettingsOverlayProps,
} from './ZenformedOrganizationSettingsOverlay';

/** @deprecated Use {@link ZenformedOrganizationSettingsOverlay}. Drawer classNames are ignored. */
export type ZenformedOrganizationSettingsDrawerProps = ZenformedOrganizationSettingsOverlayProps & {
  readonly classNames?: unknown;
};

/** @deprecated Use {@link ZenformedOrganizationSettingsOverlay}. */
export function ZenformedOrganizationSettingsDrawer({
  classNames: _classNames,
  ...props
}: ZenformedOrganizationSettingsDrawerProps) {
  return <ZenformedOrganizationSettingsOverlay {...props} />;
}
