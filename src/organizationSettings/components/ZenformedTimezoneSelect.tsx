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
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const zones = useMemo(() => listIanaTimezones(), []);
  const displayValue = value.trim() || resolveDefaultTimezone(null);
  const selectedLabel = formatTimezoneLabel(displayValue);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return;
      setOpen(false);
      setSearchQuery('');
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const options = useMemo(
    () => filterTimezones(open ? searchQuery : '', zones),
    [open, searchQuery, zones]
  );

  const inputValue = open ? searchQuery : selectedLabel;

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
        aria-controls={`${listId}-listbox`}
        disabled={disabled}
        value={inputValue}
        placeholder={selectedLabel}
        onFocus={() => {
          setOpen(true);
          setSearchQuery('');
        }}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false);
            setSearchQuery('');
          }
        }}
      />
      {open && !disabled ? (
        <ul
          id={`${listId}-listbox`}
          className={classNames.timezoneList}
          role="listbox"
        >
          {options.length === 0 ? (
            <li className={classNames.hint}>No matching timezones</li>
          ) : (
            options.map((tz) => (
              <li key={tz}>
                <button
                  type="button"
                  className={classNames.timezoneOption}
                  role="option"
                  aria-selected={tz === displayValue}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(tz);
                    setSearchQuery('');
                    setOpen(false);
                  }}
                >
                  {formatTimezoneLabel(tz)}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
