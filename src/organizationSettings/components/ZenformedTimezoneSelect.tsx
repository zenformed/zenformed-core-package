'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  filterTimezones,
  formatTimezoneLabel,
  listIanaTimezones,
  resolveDefaultTimezone,
} from '../timezoneData';
import type { OrganizationSettingsClassNames } from '../types';

type Props = {
  readonly label: string;
  readonly value: string;
  readonly classNames: OrganizationSettingsClassNames;
  readonly disabled?: boolean;
  readonly onChange: (timezone: string) => void;
};

export function ZenformedTimezoneSelect({
  label,
  value,
  classNames,
  disabled,
  onChange,
}: Props) {
  const listId = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const zones = useMemo(() => listIanaTimezones(), []);
  const displayValue = value.trim() || resolveDefaultTimezone(null);

  useEffect(() => {
    setQuery(formatTimezoneLabel(displayValue));
  }, [displayValue]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const options = useMemo(
    () => filterTimezones(query, zones),
    [query, zones]
  );

  return (
    <div className={classNames.field} ref={containerRef}>
      <label className={classNames.fieldLabel} htmlFor={listId}>
        {label}
      </label>
      <input
        id={listId}
        className={classNames.input}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        disabled={disabled}
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
      />
      {open && !disabled ? (
        <ul
          className={classNames.timezoneList}
          role="listbox"
        >
          {options.map((tz) => (
            <li key={tz}>
              <button
                type="button"
                className={classNames.timezoneOption}
                role="option"
                aria-selected={tz === displayValue}
                onClick={() => {
                  onChange(tz);
                  setQuery(formatTimezoneLabel(tz));
                  setOpen(false);
                }}
              >
                {formatTimezoneLabel(tz)}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
