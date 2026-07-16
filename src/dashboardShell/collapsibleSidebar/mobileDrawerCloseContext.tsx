'use client';

import { createContext, useContext } from 'react';

const MobileDrawerCloseContext = createContext<(() => void) | null>(null);

export const MobileDrawerCloseProvider = MobileDrawerCloseContext.Provider;

/** Closes the Facebook-style mobile drawer when present. */
export function useMobileDrawerClose(): (() => void) | null {
  return useContext(MobileDrawerCloseContext);
}
