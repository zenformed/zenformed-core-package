'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

export type UseAccountMenuStateOptions = {
  /**
   * When the menu panel is portaled (e.g. mobile modal), clicks inside this
   * selector are treated as inside the menu and do not close it.
   */
  readonly containSelector?: string;
};

export type UseAccountMenuStateResult = {
  accountMenuOpen: boolean;
  setAccountMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  accountMenuRef: RefObject<HTMLDivElement>;
  closeAccountMenu: () => void;
};

/**
 * Account dropdown open state with capture-phase outside-click close (ForgeCore parity).
 */
export function useAccountMenuState(
  options?: UseAccountMenuStateOptions
): UseAccountMenuStateResult {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const containSelector = options?.containSelector;

  const closeAccountMenu = useCallback(() => setAccountMenuOpen(false), []);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (accountMenuRef.current?.contains(target)) return;
      if (
        containSelector &&
        target instanceof Element &&
        target.closest(containSelector)
      ) {
        return;
      }
      setAccountMenuOpen(false);
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [accountMenuOpen, containSelector]);

  return { accountMenuOpen, setAccountMenuOpen, accountMenuRef, closeAccountMenu };
}
