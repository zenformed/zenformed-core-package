'use client';

import { createContext, useContext } from 'react';

export type ZenformedSidebarPresentation = 'desktop' | 'mobile';

const ZenformedSidebarPresentationContext =
  createContext<ZenformedSidebarPresentation>('desktop');

export const ZenformedSidebarPresentationProvider =
  ZenformedSidebarPresentationContext.Provider;

/** Desktop rail vs Facebook-style mobile drawer presentation. */
export function useZenformedSidebarPresentation(): ZenformedSidebarPresentation {
  return useContext(ZenformedSidebarPresentationContext);
}
