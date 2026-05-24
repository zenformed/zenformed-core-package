'use client';

import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';
import styles from './authNav.module.css';

export type ZenformedAuthLinkButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly children: ReactNode;
  readonly className?: string;
};

export function ZenformedAuthLinkButton({
  children,
  className,
  type = 'button',
  ...rest
}: ZenformedAuthLinkButtonProps): ReactElement {
  return (
    <button
      type={type}
      className={[styles.link, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
