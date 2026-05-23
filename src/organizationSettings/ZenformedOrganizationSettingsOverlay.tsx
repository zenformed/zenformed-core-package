'use client';

import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_ORGANIZATION_SETTINGS_LABELS } from './defaultLabels';
import { mergeOrganizationSettingsViewModel } from './mergeViewModel';
import orgStyles from './organizationSettings.module.css';
import { SETTINGS_CATEGORY_ORDER, type SettingsCategoryId } from './settingsCategories';
import { buildSettingsSearchIndex, filterSettingsSearch } from './settingsSearch';
import {
  ZenformedOrganizationSettingsPanel,
  type ZenformedOrganizationSettingsPanelProps,
} from './ZenformedOrganizationSettingsPanel';

export type ZenformedOrganizationSettingsOverlayProps = Omit<
  ZenformedOrganizationSettingsPanelProps,
  'activeCategory' | 'passwordFormKey'
> & {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly closeAriaLabel?: string;
  readonly initialCategory?: SettingsCategoryId;
};

function categoryLabel(
  category: SettingsCategoryId,
  labels: typeof DEFAULT_ORGANIZATION_SETTINGS_LABELS
): string {
  switch (category) {
    case 'organization':
      return labels.sectionOrganization;
    case 'account':
      return labels.sectionAccount;
    case 'notifications':
      return labels.sectionNotifications;
  case 'appsBilling':
      return labels.sectionAppsBilling;
    default:
      return category;
  }
}

export function ZenformedOrganizationSettingsOverlay({
  open,
  onClose,
  title = DEFAULT_ORGANIZATION_SETTINGS_LABELS.drawerTitle,
  closeAriaLabel = DEFAULT_ORGANIZATION_SETTINGS_LABELS.closeAriaLabel,
  initialCategory = 'organization',
  shellContext,
  viewModelOverrides,
  persistence,
  labels: labelOverrides,
  showMockNote,
}: ZenformedOrganizationSettingsOverlayProps) {
  const labels = { ...DEFAULT_ORGANIZATION_SETTINGS_LABELS, ...labelOverrides };
  const [activeCategory, setActiveCategory] = useState<SettingsCategoryId>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');

  const viewModel = useMemo(
    () => mergeOrganizationSettingsViewModel(shellContext, viewModelOverrides),
    [shellContext, viewModelOverrides]
  );

  const publicDisplayName =
    viewModel.organization.displayName.trim() ||
    viewModel.organization.legalName.trim() ||
    shellContext?.organizationName?.trim() ||
    'Organization';
  const legalName =
    viewModel.organization.legalName.trim() ||
    shellContext?.organizationName?.trim() ||
    publicDisplayName;
  const logoUrl = viewModel.organization.logoUrl ?? shellContext?.logoUrl ?? null;
  const logoInitial = publicDisplayName.trim().charAt(0).toUpperCase() || 'O';

  const searchIndex = useMemo(() => buildSettingsSearchIndex(labels), [labels]);
  const searchResults = useMemo(
    () => filterSettingsSearch(searchIndex, searchQuery),
    [searchIndex, searchQuery]
  );
  const searching = searchQuery.trim().length > 0;

  useEffect(() => {
    if (!open) return;
    setActiveCategory(initialCategory);
    setSearchQuery('');
  }, [open, initialCategory]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className={orgStyles.overlayRoot} role="presentation">
      <div
        className={orgStyles.overlayShell}
        role="dialog"
        aria-modal="true"
        aria-labelledby="zenformed-settings-overlay-title"
      >
        <header className={orgStyles.overlayTopBar}>
          <h1 id="zenformed-settings-overlay-title" className={orgStyles.overlayTitle}>
            {title}
          </h1>
          <button
            type="button"
            className={orgStyles.overlayClose}
            onClick={onClose}
            aria-label={closeAriaLabel}
          >
            ×
          </button>
        </header>

        <div className={orgStyles.overlayBody}>
          <aside className={orgStyles.overlaySidebar} aria-label="Settings navigation">
            <div className={orgStyles.sidebarIdentity}>
              <div className={orgStyles.sidebarLogo}>
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="" />
                ) : (
                  logoInitial
                )}
              </div>
              <div className={orgStyles.sidebarIdentityText}>
                <p className={orgStyles.sidebarDisplayName}>{publicDisplayName}</p>
                <p className={orgStyles.sidebarLegalName}>{legalName}</p>
              </div>
            </div>

            <label className={orgStyles.searchField}>
              <span className={orgStyles.visuallyHidden}>{labels.settingsSearchPlaceholder}</span>
              <input
                type="search"
                className={orgStyles.searchInput}
                placeholder={labels.settingsSearchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
            </label>

            {searching ? (
              <nav className={orgStyles.sidebarNav} aria-label="Search results">
                {searchResults.length === 0 ? (
                  <p className={orgStyles.searchEmpty}>{labels.settingsSearchNoResults}</p>
                ) : (
                  <ul className={orgStyles.searchResults}>
                    {searchResults.map((entry) => (
                      <li key={entry.id}>
                        <button
                          type="button"
                          className={orgStyles.searchResultBtn}
                          onClick={() => {
                            setActiveCategory(entry.category);
                            setSearchQuery('');
                          }}
                        >
                          <span className={orgStyles.searchResultLabel}>{entry.label}</span>
                          <span className={orgStyles.searchResultCategory}>
                            {categoryLabel(entry.category, labels)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </nav>
            ) : (
              <nav className={orgStyles.sidebarNav} aria-label="Settings categories">
                <ul className={orgStyles.categoryList}>
                  {SETTINGS_CATEGORY_ORDER.map((category) => {
                    const active = category === activeCategory;
                    return (
                      <li key={category}>
                        <button
                          type="button"
                          className={`${orgStyles.categoryBtn} ${active ? orgStyles.categoryBtnActive : ''}`.trim()}
                          aria-current={active ? 'page' : undefined}
                          onClick={() => setActiveCategory(category)}
                        >
                          {categoryLabel(category, labels)}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            )}
          </aside>

          <main className={orgStyles.overlayContent}>
            <h2 className={orgStyles.contentCategoryTitle}>
              {categoryLabel(activeCategory, labels)}
            </h2>
            <ZenformedOrganizationSettingsPanel
              shellContext={shellContext}
              viewModelOverrides={viewModelOverrides}
              persistence={persistence}
              labels={labelOverrides}
              showMockNote={showMockNote}
              activeCategory={activeCategory}
              passwordFormKey={open ? 'open' : 'closed'}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
