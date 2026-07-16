'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

export type UseAccountMenuStateResult = {
  accountMenuOpen: boolean;
  setAccountMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  accountMenuRef: RefObject<HTMLDivElement>;
  closeAccountMenu: () => void;
};

/**
 * Account dropdown open state with capture-phase outside-click close (ForgeCore parity).
 */
export function useAccountMenuState(): UseAccountMenuStateResult {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const closeAccountMenu = useCallback(() => setAccountMenuOpen(false), []);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [accountMenuOpen]);

  return { accountMenuOpen, setAccountMenuOpen, accountMenuRef, closeAccountMenu };
}
