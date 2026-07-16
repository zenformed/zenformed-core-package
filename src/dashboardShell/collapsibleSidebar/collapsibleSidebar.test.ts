import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  shouldOverlayExpandedSidebar,
  shouldReserveCollapsedSidebarWidth,
  ZENFORMED_SIDEBAR_COLLAPSED_WIDTH_REM,
  ZENFORMED_SIDEBAR_EXPANDED_WIDTH_REM,
} from './types';

describe('collapsible sidebar layout rules', () => {
  it('always reserves collapsed width and overlays expanded rail', () => {
    assert.equal(shouldReserveCollapsedSidebarWidth(), true);
    assert.equal(shouldOverlayExpandedSidebar(), true);
    assert.ok(ZENFORMED_SIDEBAR_COLLAPSED_WIDTH_REM < ZENFORMED_SIDEBAR_EXPANDED_WIDTH_REM);
  });
});
