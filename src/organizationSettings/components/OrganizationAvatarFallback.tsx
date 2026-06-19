'use client';

import type { ReactElement } from 'react';
import orgStyles from '../organizationSettings.module.css';

export type OrganizationAvatarFallbackProps = {
  readonly initial: string;
  /** `lg` matches settings sidebar (2.75rem); `md` matches organization profile preview (2.5rem). */
  readonly size?: 'md' | 'lg';
};

export function OrganizationAvatarFallback({
  initial,
  size = 'lg',
}: OrganizationAvatarFallbackProps): ReactElement {
  const sizeClass =
    size === 'md' ? orgStyles.organizationAvatarFallbackMd : undefined;

  return (
    <span
      className={[orgStyles.organizationAvatarFallback, sizeClass]
        .filter(Boolean)
        .join(' ')}
      aria-hidden
    >
      {initial}
    </span>
  );
}
