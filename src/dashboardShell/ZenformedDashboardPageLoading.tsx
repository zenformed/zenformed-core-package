'use client';

import type { ReactElement } from 'react';
import type { ZenformedDashboardPageLoadingClassNames } from './types';

export type ZenformedDashboardPageLoadingProps = {
  classNames: ZenformedDashboardPageLoadingClassNames;
  message: string;
};

/** Full-page loading line inside dashboard `page` region (copy from app content). */
export function ZenformedDashboardPageLoading({
  classNames,
  message,
}: ZenformedDashboardPageLoadingProps): ReactElement {
  return (
    <div className={classNames.page}>
      <p className={classNames.loading}>{message}</p>
    </div>
  );
}
