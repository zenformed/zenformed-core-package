'use client';

import { useState, type ReactElement } from 'react';
import { useZenformedPresenceOptional } from './ZenformedPresenceProvider';
import {
  PRESENCE_STATUS_MODE_LABELS,
  PRESENCE_STATUS_MODES,
  type PresenceStatusMode,
} from './types';
import styles from './presence.module.css';

export type ZenformedPresenceStatusSelectorProps = {
  readonly className?: string;
  readonly disabled?: boolean;
};

export function ZenformedPresenceStatusSelector({
  className,
  disabled = false,
}: ZenformedPresenceStatusSelectorProps): ReactElement | null {
  const presence = useZenformedPresenceOptional();
  const [saving, setSaving] = useState(false);
  if (presence == null) return null;

  const onSelect = async (mode: PresenceStatusMode): Promise<void> => {
    if (disabled || saving || mode === presence.statusMode) return;
    setSaving(true);
    try {
      await presence.setStatusMode(mode);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={[styles.statusSelector, className].filter(Boolean).join(' ')}
      role="group"
      aria-label="Status"
    >
      {PRESENCE_STATUS_MODES.map((mode) => {
        const selected = presence.statusMode === mode;
        return (
          <button
            key={mode}
            type="button"
            role="menuitemradio"
            aria-checked={selected}
            className={`${styles.statusOption} ${selected ? styles.statusOptionSelected : ''}`}
            disabled={disabled || saving}
            onClick={(event) => {
              event.stopPropagation();
              void onSelect(mode);
            }}
          >
            <span className={styles.statusOptionLabel}>{PRESENCE_STATUS_MODE_LABELS[mode]}</span>
            {selected ? (
              <span className={styles.statusOptionCheck} aria-hidden>
                ✓
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
