'use client';

import type { AnchorHTMLAttributes, ReactElement, ReactNode } from 'react';
import styles from './authNav.module.css';

export type ZenformedAuthNavLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'className'
> & {
  readonly href: string;
  readonly children: ReactNode;
  readonly className?: string;
  /** When `button`, only `className` is applied (for host app button tokens). */
  readonly appearance?: 'link' | 'button';
};

export function ZenformedAuthNavLink({
  href,
  children,
  className,
  appearance = 'link',
  ...rest
}: ZenformedAuthNavLinkProps): ReactElement {
  const resolvedClassName =
    appearance === 'button'
      ? className
      : [styles.link, className].filter(Boolean).join(' ');

  return (
    <a href={href} className={resolvedClassName} {...rest}>
      {children}
    </a>
  );
}
