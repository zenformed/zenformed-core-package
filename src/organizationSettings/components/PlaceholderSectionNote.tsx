'use client';

import type { OrganizationSettingsClassNames } from '../types';

type Props = {
  readonly message: string;
  readonly classNames: OrganizationSettingsClassNames;
};

export function PlaceholderSectionNote({ message, classNames }: Props) {
  return <p className={classNames.placeholderNote}>{message}</p>;
}
