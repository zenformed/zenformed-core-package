'use client';

import type { ReactElement, ReactNode } from 'react';
import type { ZenformedSettingsDrawerClassNames, ZenformedSettingsDrawerSection } from './types';

export type ZenformedSettingsDrawerProps = {
  classNames: ZenformedSettingsDrawerClassNames;
  open: boolean;
  onClose: () => void;
  title: string;
  closeAriaLabel: string;
  sections: ZenformedSettingsDrawerSection[];
  activeSectionId: string;
  onSectionChange: (sectionId: string) => void;
  /** When a section has requiresLicenseTier, tab is shown only if tier matches. */
  effectiveLicenseTier?: string | null | undefined;
  renderSectionContent: (sectionId: string) => unknown;
  footerSlot?: ReactNode;
};

export function ZenformedSettingsDrawer({
  classNames,
  open,
  onClose,
  title,
  closeAriaLabel,
  sections,
  activeSectionId,
  onSectionChange,
  effectiveLicenseTier,
  renderSectionContent,
  footerSlot,
}: ZenformedSettingsDrawerProps): ReactElement | null {
  if (!open) return null;

  return (
    <div className={classNames.settingsOverlay} onClick={onClose} role="presentation">
      <div className={classNames.settingsDrawer} onClick={(e) => e.stopPropagation()}>
        <div className={classNames.settingsHeader}>
          <h2 className={classNames.settingsTitle}>{title}</h2>
          <button
            type="button"
            className={classNames.settingsClose}
            onClick={onClose}
            aria-label={closeAriaLabel}
          >
            ×
          </button>
        </div>
        <nav className={classNames.settingsTabs}>
          {sections.map((section) => {
            if (
              'requiresLicenseTier' in section &&
              section.requiresLicenseTier != null &&
              effectiveLicenseTier !== section.requiresLicenseTier
            ) {
              return null;
            }
            return (
              <button
                key={section.id}
                type="button"
                className={
                  activeSectionId === section.id ? classNames.settingsTabActive : classNames.settingsTab
                }
                onClick={() => onSectionChange(section.id)}
              >
                {section.label}
              </button>
            );
          })}
        </nav>
        <div className={classNames.settingsContent}>
          {renderSectionContent(activeSectionId) as ReactNode}
        </div>
        {footerSlot}
      </div>
    </div>
  );
}
