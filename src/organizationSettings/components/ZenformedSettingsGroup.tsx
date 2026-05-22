'use client';

import { useId, useState, type ReactNode } from 'react';
import orgStyles from '../organizationSettings.module.css';
import type { OrganizationSettingsClassNames } from '../types';

type Props = {
  readonly title: string;
  readonly classNames: OrganizationSettingsClassNames;
  readonly children: ReactNode;
  readonly defaultOpen?: boolean;
};

export function ZenformedSettingsGroup({
  title,
  classNames,
  children,
  defaultOpen = true,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div
      className={`${classNames.group} ${open ? classNames.groupOpen : ''}`.trim()}
    >
      <button
        type="button"
        className={classNames.groupHeader}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={classNames.groupChevron} aria-hidden>
          ›
        </span>
        <span className={classNames.groupTitle}>{title}</span>
      </button>
      <div className={classNames.groupBody} id={panelId} aria-hidden={!open}>
        <div className={orgStyles.groupBodyInner}>
          <div className={orgStyles.groupBodyContent}>{children}</div>
        </div>
      </div>
    </div>
  );
}
