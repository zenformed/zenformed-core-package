'use client';

import type { ReactElement, ReactNode } from 'react';
import type { ZenformedDashboardAppShellClassNames } from './types';

export type ZenformedDashboardAppShellProps = {
  classNames: ZenformedDashboardAppShellClassNames;
  children: ReactNode;
};

export function ZenformedDashboardAppShell({
  classNames,
  children,
}: ZenformedDashboardAppShellProps): ReactElement {
  return <div className={classNames.appLayout}>{children}</div>;
}
