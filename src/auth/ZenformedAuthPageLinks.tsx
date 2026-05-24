'use client';

import type { ReactElement, ReactNode } from 'react';
import styles from './authNav.module.css';

export type ZenformedAuthPageLinksProps = {
  readonly children: ReactNode;
  readonly align?: 'space-between' | 'center';
  readonly className?: string;
};

export function ZenformedAuthPageLinks({
  children,
  align = 'space-between',
  className,
}: ZenformedAuthPageLinksProps): ReactElement {
  const layoutClass = align === 'center' ? styles.linksCenter : styles.links;
  return (
    <div className={[layoutClass, className].filter(Boolean).join(' ')}>{children}</div>
  );
}
