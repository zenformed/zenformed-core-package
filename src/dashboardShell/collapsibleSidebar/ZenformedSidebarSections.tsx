'use client';

import { useState, type ReactElement } from 'react';
import type {
  ZenformedSidebarCustomSection,
  ZenformedSidebarNavSection,
  ZenformedSidebarSection,
} from './types';
import { resolveSidebarSectionLabelText } from './types';
import styles from './collapsibleSidebar.module.css';

function CaretIcon({ open }: { open: boolean }): ReactElement {
  return (
    <svg
      className={`${styles.sectionCaret} ${open ? styles.sectionCaretOpen : ''}`}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden
    >
      <path d="M2.1 4.25h7.8L6 9.1 2.1 4.25z" />
    </svg>
  );
}

function SectionLabelText({
  label,
  collapsedLabel,
  expanded,
}: {
  label?: string;
  collapsedLabel?: string;
  expanded: boolean;
}): ReactElement | null {
  const text = resolveSidebarSectionLabelText({ label, collapsedLabel, expanded });
  if (!text) return null;
  return <span>{text}</span>;
}

function NavSection({
  section,
  expanded,
  onNavigate,
}: {
  section: ZenformedSidebarNavSection;
  expanded: boolean;
  onNavigate?: () => void;
}): ReactElement {
  const labelText = resolveSidebarSectionLabelText({
    label: section.label,
    collapsedLabel: section.collapsedLabel,
    expanded,
  });

  return (
    <div className={styles.section} data-zenformed-sidebar-section={section.id}>
      {labelText ? (
        <div
          className={`${styles.sectionLabel} ${expanded ? '' : styles.sectionLabelCollapsed}`}
          role="presentation"
        >
          <SectionLabelText
            label={section.label}
            collapsedLabel={section.collapsedLabel}
            expanded={expanded}
          />
        </div>
      ) : null}
      <ul className={styles.navList}>
        {section.items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`${styles.navItem} ${item.active ? styles.navItemActive : ''}`}
              onClick={() => {
                item.onSelect();
                onNavigate?.();
              }}
              disabled={item.disabled}
              aria-current={item.active ? 'page' : undefined}
              aria-label={item.label}
              title={item.title ?? item.label}
            >
              <span className={styles.navIcon} aria-hidden>
                {item.icon}
              </span>
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CustomSection({
  section,
  expanded,
}: {
  section: ZenformedSidebarCustomSection;
  expanded: boolean;
}): ReactElement {
  const [open, setOpen] = useState(section.defaultOpen !== false);
  const collapsible = Boolean(section.collapsible);
  const labelText = resolveSidebarSectionLabelText({
    label: section.label,
    collapsedLabel: section.collapsedLabel,
    expanded,
  });

  return (
    <div className={styles.section} data-zenformed-sidebar-section={section.id}>
      {labelText ? (
        collapsible && expanded ? (
          <button
            type="button"
            className={`${styles.sectionLabel} ${styles.sectionLabelButton}`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            <span>{section.label}</span>
            <CaretIcon open={open} />
          </button>
        ) : (
          <div
            className={`${styles.sectionLabel} ${expanded ? '' : styles.sectionLabelCollapsed}`}
            role="presentation"
          >
            <SectionLabelText
              label={section.label}
              collapsedLabel={section.collapsedLabel}
              expanded={expanded}
            />
          </div>
        )
      ) : null}
      {/* Keep custom bodies mounted (hidden when accordion closed) so hosts do not refetch on toggle. */}
      <div
        className={styles.customSectionBody}
        hidden={collapsible && !open}
        aria-hidden={collapsible && !open ? true : undefined}
      >
        {section.content}
      </div>
    </div>
  );
}

export function ZenformedSidebarSections({
  sections,
  expanded,
  onNavigate,
}: {
  sections: readonly ZenformedSidebarSection[];
  expanded: boolean;
  onNavigate?: () => void;
}): ReactElement {
  return (
    <>
      {sections.map((section) =>
        section.kind === 'nav' ? (
          <NavSection
            key={section.id}
            section={section}
            expanded={expanded}
            onNavigate={onNavigate}
          />
        ) : (
          <CustomSection key={section.id} section={section} expanded={expanded} />
        )
      )}
    </>
  );
}

export function ZenformedSidebarAppChevrons(): ReactElement {
  return (
    <span className={styles.appChevrons} aria-hidden>
      <svg width="10" height="8" viewBox="0 0 10 8" fill="currentColor">
        <path d="M5 1.2 8.5 5.3H1.5L5 1.2Z" />
      </svg>
      <svg width="10" height="8" viewBox="0 0 10 8" fill="currentColor">
        <path d="M5 6.8 1.5 2.7h7L5 6.8Z" />
      </svg>
    </span>
  );
}

export function ZenformedSidebarMenuGlyph(): ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
