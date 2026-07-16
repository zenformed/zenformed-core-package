import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  resolveSidebarSectionLabelText,
  shouldOverlayExpandedSidebar,
  shouldReserveCollapsedSidebarWidth,
  shouldShowSidebarAppName,
  ZENFORMED_SIDEBAR_COLLAPSED_WIDTH_REM,
  ZENFORMED_SIDEBAR_EXPANDED_WIDTH_REM,
  ZENFORMED_SIDEBAR_ICON_COLUMN_REM,
  ZENFORMED_SIDEBAR_ROW_HEIGHT_REM,
} from './types';

describe('collapsible sidebar layout rules', () => {
  it('always reserves collapsed width and overlays expanded rail', () => {
    assert.equal(shouldReserveCollapsedSidebarWidth(), true);
    assert.equal(shouldOverlayExpandedSidebar(), true);
    assert.ok(ZENFORMED_SIDEBAR_COLLAPSED_WIDTH_REM < ZENFORMED_SIDEBAR_EXPANDED_WIDTH_REM);
    assert.equal(ZENFORMED_SIDEBAR_ICON_COLUMN_REM, ZENFORMED_SIDEBAR_ROW_HEIGHT_REM);
  });
});

describe('sidebar app name visibility', () => {
  it('shows app name only when expanded', () => {
    assert.equal(shouldShowSidebarAppName(true), true);
    assert.equal(shouldShowSidebarAppName(false), false);
  });
});

describe('resolveSidebarSectionLabelText', () => {
  it('uses full label when expanded', () => {
    assert.equal(
      resolveSidebarSectionLabelText({
        label: 'Organization',
        collapsedLabel: 'ORG',
        expanded: true,
      }),
      'Organization'
    );
  });

  it('uses collapsedLabel when collapsed', () => {
    assert.equal(
      resolveSidebarSectionLabelText({
        label: 'Organization',
        collapsedLabel: 'ORG',
        expanded: false,
      }),
      'ORG'
    );
  });

  it('falls back to short full label when collapsedLabel omitted', () => {
    assert.equal(
      resolveSidebarSectionLabelText({
        label: 'Team',
        expanded: false,
      }),
      'Team'
    );
  });

  it('hides long labels without collapsedLabel rather than clipping', () => {
    assert.equal(
      resolveSidebarSectionLabelText({
        label: 'Organization',
        expanded: false,
      }),
      null
    );
  });

  it('returns null when no label', () => {
    assert.equal(resolveSidebarSectionLabelText({ expanded: true }), null);
    assert.equal(resolveSidebarSectionLabelText({ label: '  ', expanded: true }), null);
  });
});
