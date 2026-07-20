'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

export type UseAccountMenuStateOptions = {
  /** Extra roots treated as “inside” for outside-click close (e.g. portaled menus). */
  readonly extraRoots?: ReadonlyArray<RefObject<HTMLElement | null>>;
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
  const extraRootsRef = useRef(options?.extraRoots);
  extraRootsRef.current = options?.extraRoots;

  const closeAccountMenu = useCallback(() => setAccountMenuOpen(false), []);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (accountMenuRef.current?.contains(target)) return;
      if (extraRootsRef.current?.some((root) => root.current?.contains(target))) return;
      setAccountMenuOpen(false);
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [accountMenuOpen]);

  return { accountMenuOpen, setAccountMenuOpen, accountMenuRef, closeAccountMenu };
}
