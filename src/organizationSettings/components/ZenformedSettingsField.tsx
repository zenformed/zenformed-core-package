'use client';

import type { OrganizationSettingsClassNames } from '../types';

type Props = {
  readonly label: string;
  readonly classNames: OrganizationSettingsClassNames;
  readonly id?: string;
  readonly value?: string;
  readonly placeholder?: string;
  readonly readOnly?: boolean;
  readonly type?: 'text' | 'email' | 'password';
  readonly autoComplete?: string;
  readonly name?: string;
  readonly onChange?: (value: string) => void;
};

export function ZenformedSettingsField({
  label,
  classNames,
  id,
  value = '',
  placeholder,
  readOnly,
  type = 'text',
  autoComplete,
  name,
  onChange,
}: Props) {
  const inputId = id ?? label.replace(/\s+/g, '-').toLowerCase();

  return (
    <label className={classNames.field} htmlFor={inputId}>
      <span className={classNames.fieldLabel}>{label}</span>
      <input
        id={inputId}
        name={name ?? inputId}
        className={classNames.input}
        type={type}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        autoComplete={autoComplete}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      />
    </label>
  );
}
