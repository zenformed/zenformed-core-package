'use client';

import { useId, useState, type ReactNode } from 'react';
import orgStyles from '../organizationSettings.module.css';
import type { OrganizationSettingsClassNames } from '../types';

type Props = {
  readonly title: string;
  readonly defaultOpen?: boolean;
  readonly classNames: OrganizationSettingsClassNames;
  readonly children: ReactNode;
};

export function ZenformedSettingsAccordionSection({
  title,
  defaultOpen = true,
  classNames,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section
      className={`${classNames.section} ${open ? classNames.sectionOpen : ''}`.trim()}
    >
      <button
        type="button"
        className={classNames.sectionHeader}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={classNames.sectionChevron} aria-hidden>
          ›
        </span>
        {title}
      </button>
      <div className={classNames.sectionBody} id={panelId} aria-hidden={!open}>
        <div className={orgStyles.sectionBodyInner}>
          <div className={orgStyles.sectionBodyContent}>{children}</div>
        </div>
      </div>
    </section>
  );
}
