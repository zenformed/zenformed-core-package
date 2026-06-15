'use client';

import type { ReactElement } from 'react';
import { useAccountMenuState } from './useAccountMenuState';
import { ZenformedSidebarBranding } from './ZenformedSidebarBranding';
import type { ZenformedAppIconNavMenuProps } from './types';

export function ZenformedAppIconNavMenu({
  brandingClassNames,
  menuClassNames,
  appName,
  appIconSrc,
  appAltText,
  menuAriaLabel,
  triggerAriaLabel,
  items,
}: ZenformedAppIconNavMenuProps): ReactElement {
  const { accountMenuOpen, setAccountMenuOpen, accountMenuRef, closeAccountMenu } =
    useAccountMenuState();

  return (
    <div className={menuClassNames.appIconNavWrap} ref={accountMenuRef}>
      <button
        type="button"
        className={menuClassNames.appIconNavTrigger}
        aria-label={triggerAriaLabel}
        aria-expanded={accountMenuOpen}
        aria-haspopup="menu"
        onClick={() => setAccountMenuOpen((open) => !open)}
      >
        <ZenformedSidebarBranding
          classNames={brandingClassNames}
          appName={appName}
          appIconSrc={appIconSrc}
          appAltText={appAltText}
        />
      </button>
      {accountMenuOpen ? (
        <div className={menuClassNames.appIconNavMenu} role="menu" aria-label={menuAriaLabel}>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className={[
                menuClassNames.appIconNavMenuItem,
                item.active ? menuClassNames.appIconNavMenuItemActive : '',
                item.disabled ? menuClassNames.appIconNavMenuItemDisabled : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={item.disabled}
              aria-current={item.active ? 'page' : undefined}
              onClick={() => {
                if (item.disabled) return;
                closeAccountMenu();
                item.onSelect();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
