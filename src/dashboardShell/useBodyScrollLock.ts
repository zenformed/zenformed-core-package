'use client';

import { useEffect } from 'react';

/**
 * Locks `document.body` scroll while `locked` is true.
 * Restores the previous overflow value on unlock / unmount.
 */
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
}
