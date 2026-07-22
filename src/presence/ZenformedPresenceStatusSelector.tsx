'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import { ZenformedPresenceDot } from './ZenformedPresenceDot';
import { useZenformedPresenceOptional } from './ZenformedPresenceProvider';
import {
  PRESENCE_STATUS_MODE_LABELS,
  PRESENCE_STATUS_MODES,
  type PresenceEffectiveStatus,
  type PresenceStatusMode,
} from './types';
import styles from './presence.module.css';

export type ZenformedPresenceStatusSelectorProps = {
  readonly className?: string;
  readonly disabled?: boolean;
};

/** Color hint for a status-mode row (Automatic follows the live effective status). */
function statusModeDotStatus(
  mode: PresenceStatusMode,
  currentEffective: PresenceEffectiveStatus
): PresenceEffectiveStatus {
  if (mode === 'online') return 'online';
  if (mode === 'away') return 'away';
  if (mode === 'busy') return 'busy';
  if (mode === 'appear_offline') return 'offline';
  return currentEffective === 'offline' ? 'online' : currentEffective;
}

export function ZenformedPresenceStatusSelector({
  className,
  disabled = false,
}: ZenformedPresenceStatusSelectorProps): ReactElement | null {
  const presence = useZenformedPresenceOptional();
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | PointerEvent): void => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (presence == null) return null;

  const currentMode = presence.statusMode;
  const currentLabel = PRESENCE_STATUS_MODE_LABELS[currentMode];
  const triggerDotStatus = statusModeDotStatus(
    currentMode,
    presence.currentEffectiveStatus
  );

  const onSelect = async (mode: PresenceStatusMode): Promise<void> => {
    if (disabled || saving || mode === currentMode) {
      setOpen(false);
      return;
    }
    setSaving(true);
    try {
      await presence.setStatusMode(mode);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      ref={rootRef}
      className={[styles.statusSelector, className].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        className={styles.statusTrigger}
        disabled={disabled || saving}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Status: ${currentLabel}`}
        onClick={(event) => {
          event.stopPropagation();
          if (disabled || saving) return;
          setOpen((value) => !value);
        }}
      >
        <span className={styles.statusTriggerMain}>
          <ZenformedPresenceDot status={triggerDotStatus} announce={false} />
          <span className={styles.statusOptionLabel}>{currentLabel}</span>
        </span>
        <span className={styles.statusTriggerChevron} aria-hidden>
          {open ? '▴' : '▾'}
        </span>
      </button>

      {open ? (
        <div
          id={listId}
          className={styles.statusMenu}
          role="listbox"
          aria-label="Status"
        >
          {PRESENCE_STATUS_MODES.map((mode) => {
            const selected = mode === currentMode;
            const optionDot = statusModeDotStatus(
              mode,
              presence.currentEffectiveStatus
            );
            return (
              <button
                key={mode}
                type="button"
                role="option"
                aria-selected={selected}
                className={`${styles.statusOption} ${selected ? styles.statusOptionSelected : ''}`}
                disabled={disabled || saving}
                onClick={(event) => {
                  event.stopPropagation();
                  void onSelect(mode);
                }}
              >
                <span className={styles.statusOptionMain}>
                  <ZenformedPresenceDot status={optionDot} announce={false} />
                  <span className={styles.statusOptionLabel}>
                    {PRESENCE_STATUS_MODE_LABELS[mode]}
                  </span>
                </span>
                {selected ? (
                  <span className={styles.statusOptionCheck} aria-hidden>
                    ✓
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
