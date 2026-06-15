'use client';

import type { ReactElement, ReactNode } from 'react';
import type { ZenformedDashboardSidebarRowClassNames } from './types';

export type ZenformedDashboardSidebarRowProps = {
  classNames: ZenformedDashboardSidebarRowClassNames;
  sidebar: ReactNode;
  mainColumn: ReactNode;
};

/**
 * Standard dashboard row: primary sidebar + main column (header + content live in `mainColumn`).
 */
export function ZenformedDashboardSidebarRow({
  classNames,
  sidebar,
  mainColumn,
}: ZenformedDashboardSidebarRowProps): ReactElement {
  return (
    <div className={classNames.dashboardWithSidebar}>
      <div className={classNames.sidebarRail}>{sidebar}</div>
      <div className={classNames.mainColumn}>{mainColumn}</div>
    </div>
  );
}
