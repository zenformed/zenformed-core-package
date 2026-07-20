'use client';

import { useCallback, useEffect, useRef, useState, type FocusEvent } from 'react';
import {
  ZENFORMED_SIDEBAR_HOVER_CLOSE_DELAY_MS,
  ZENFORMED_SIDEBAR_HOVER_OPEN_DELAY_MS,
} from './types';

export type UseZenformedSidebarExpandStateOptions = {
  /** When true (e.g. a dropdown is open), keep the rail expanded. */
  readonly forceExpanded?: boolean;
  /** Hover expand is disabled on coarse pointers / touch; use drawer instead. */
  readonly hoverEnabled?: boolean;
};

export type UseZenformedSidebarExpandStateResult = {
  readonly expanded: boolean;
  readonly onRailPointerEnter: () => void;
  readonly onRailPointerLeave: () => void;
  readonly onRailFocusCapture: () => void;
  readonly onRailBlurCapture: (e: FocusEvent) => void;
  readonly setExpanded: (open: boolean) => void;
};

export function useZenformedSidebarExpandState({
  forceExpanded = false,
  hoverEnabled = true,
}: UseZenformedSidebarExpandStateOptions = {}): UseZenformedSidebarExpandStateResult {
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Pointer left the rail while an overlay was forcing expand — collapse when force ends. */
  const leftWhileForcedRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const scheduleCollapse = useCallback(() => {
    clearTimers();
    closeTimer.current = setTimeout(
      () => setHoverExpanded(false),
      ZENFORMED_SIDEBAR_HOVER_CLOSE_DELAY_MS
    );
  }, [clearTimers]);

  useEffect(() => {
    if (forceExpanded) return;
    if (!leftWhileForcedRef.current) return;
    leftWhileForcedRef.current = false;
    scheduleCollapse();
  }, [forceExpanded, scheduleCollapse]);

  const onRailPointerEnter = useCallback(() => {
    if (!hoverEnabled) return;
    leftWhileForcedRef.current = false;
    clearTimers();
    openTimer.current = setTimeout(() => setHoverExpanded(true), ZENFORMED_SIDEBAR_HOVER_OPEN_DELAY_MS);
  }, [clearTimers, hoverEnabled]);

  const onRailPointerLeave = useCallback(() => {
    if (!hoverEnabled) return;
    clearTimers();
    if (forceExpanded) {
      leftWhileForcedRef.current = true;
      return;
    }
    leftWhileForcedRef.current = false;
    scheduleCollapse();
  }, [clearTimers, forceExpanded, hoverEnabled, scheduleCollapse]);

  const onRailFocusCapture = useCallback(() => {
    if (!hoverEnabled) return;
    leftWhileForcedRef.current = false;
    clearTimers();
    setHoverExpanded(true);
  }, [clearTimers, hoverEnabled]);

  const onRailBlurCapture = useCallback(
    (e: FocusEvent) => {
      if (!hoverEnabled) return;
      const next = e.relatedTarget as Node | null;
      if (next && e.currentTarget.contains(next)) return;
      clearTimers();
      if (forceExpanded) {
        leftWhileForcedRef.current = true;
        return;
      }
      leftWhileForcedRef.current = false;
      scheduleCollapse();
    },
    [clearTimers, forceExpanded, hoverEnabled, scheduleCollapse]
  );

  const setExpanded = useCallback(
    (open: boolean) => {
      leftWhileForcedRef.current = false;
      clearTimers();
      setHoverExpanded(open);
    },
    [clearTimers]
  );

  return {
    expanded: Boolean(forceExpanded || hoverExpanded),
    onRailPointerEnter,
    onRailPointerLeave,
    onRailFocusCapture,
    onRailBlurCapture,
    setExpanded,
  };
}
