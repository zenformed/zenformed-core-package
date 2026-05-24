'use client';

import type { ReactElement } from 'react';
import { resolveAuthLabels, type ZenformedAuthLabels } from './authLabels';
import { ZenformedAuthNavLink } from './ZenformedAuthNavLink';
import { ZenformedAuthPageLinks } from './ZenformedAuthPageLinks';
import styles from './authNav.module.css';

export type ZenformedForgotPasswordPlaceholderProps = {
  readonly labels?: Partial<ZenformedAuthLabels> | null;
  readonly loginHref?: string | null;
};

export function ZenformedForgotPasswordPlaceholder({
  labels,
  loginHref,
}: ZenformedForgotPasswordPlaceholderProps): ReactElement {
  const resolvedLabels = resolveAuthLabels(labels);

  return (
    <>
      <p className={styles.placeholderBody}>{resolvedLabels.forgotPasswordNotWiredYet}</p>
      {loginHref ? (
        <ZenformedAuthPageLinks align="center">
          <ZenformedAuthNavLink href={loginHref}>{resolvedLabels.backToSignIn}</ZenformedAuthNavLink>
        </ZenformedAuthPageLinks>
      ) : null}
    </>
  );
}
