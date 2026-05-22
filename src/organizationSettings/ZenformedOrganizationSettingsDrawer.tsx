'use client';

import { useEffect } from 'react';
import { DEFAULT_ORGANIZATION_SETTINGS_LABELS } from './defaultLabels';
import {
  ZenformedOrganizationSettingsPanel,
  type ZenformedOrganizationSettingsPanelProps,
} from './ZenformedOrganizationSettingsPanel';
import type { OrganizationSettingsDrawerClassNames } from './types';

export type ZenformedOrganizationSettingsDrawerProps = ZenformedOrganizationSettingsPanelProps & {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly classNames: OrganizationSettingsDrawerClassNames;
  readonly title?: string;
  readonly closeAriaLabel?: string;
};

export function ZenformedOrganizationSettingsDrawer({
  open,
  onClose,
  classNames,
  title = DEFAULT_ORGANIZATION_SETTINGS_LABELS.drawerTitle,
  closeAriaLabel = DEFAULT_ORGANIZATION_SETTINGS_LABELS.closeAriaLabel,
  ...panelProps
}: ZenformedOrganizationSettingsDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={classNames.settingsOverlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        className={`${classNames.settingsDrawer} ${classNames.settingsDrawerWide}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="zenformed-org-settings-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={classNames.settingsHeader}>
          <h2 id="zenformed-org-settings-title" className={classNames.settingsTitle}>
            {title}
          </h2>
          <button
            type="button"
            className={classNames.settingsClose}
            onClick={onClose}
            aria-label={closeAriaLabel}
          >
            ×
          </button>
        </header>
        <div className={classNames.settingsContent}>
          <ZenformedOrganizationSettingsPanel {...panelProps} />
        </div>
      </aside>
    </div>
  );
}
