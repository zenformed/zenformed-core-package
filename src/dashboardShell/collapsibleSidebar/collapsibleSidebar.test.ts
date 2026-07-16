import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  resolveMobileDrawerWidthCss,
  resolveSidebarSectionLabelText,
  shouldOpenAccountPopoverOnUserBar,
  shouldOpenNotificationsAsPage,
  shouldOverlayExpandedSidebar,
  shouldReserveCollapsedSidebarWidth,
  shouldShowSidebarAppName,
  shouldUseInlineAppsSwitcher,
  shouldUseMobileDrawerPresentation,
  ZENFORMED_MOBILE_DRAWER_WIDTH_CSS,
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

describe('mobile drawer presentation rules', () => {
  it('uses ~90vw drawer width with a sensible max', () => {
    assert.equal(resolveMobileDrawerWidthCss(), 'min(90vw, 24rem)');
    assert.equal(ZENFORMED_MOBILE_DRAWER_WIDTH_CSS, 'min(90vw, 24rem)');
  });

  it('selects mobile drawer only on mobile', () => {
    assert.equal(shouldUseMobileDrawerPresentation(true), true);
    assert.equal(shouldUseMobileDrawerPresentation(false), false);
  });

  it('opens notifications as a page on mobile only', () => {
    assert.equal(shouldOpenNotificationsAsPage(true), true);
    assert.equal(shouldOpenNotificationsAsPage(false), false);
  });

  it('uses inline apps switcher on mobile only', () => {
    assert.equal(shouldUseInlineAppsSwitcher(true), true);
    assert.equal(shouldUseInlineAppsSwitcher(false), false);
  });

  it('does not open account popover from the mobile user bar', () => {
    assert.equal(shouldOpenAccountPopoverOnUserBar(true), false);
    assert.equal(shouldOpenAccountPopoverOnUserBar(false), true);
  });
});

describe('sidebar section labels', () => {
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
