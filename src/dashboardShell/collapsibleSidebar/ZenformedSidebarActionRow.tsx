'use client';

import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';
import styles from './collapsibleSidebar.module.css';

export type ZenformedSidebarActionRowProps = {
  readonly icon: ReactNode;
  readonly label?: string;
  readonly showLabel: boolean;
  /** When true, renders a `<button>` row (Settings). Default: structural `<div>` for compound controls. */
  readonly asButton?: boolean;
  readonly onClick?: () => void;
  readonly title?: string;
  readonly ariaLabel?: string;
  readonly className?: string;
  readonly children?: never;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'onClick' | 'title' | 'children' | 'type'>;

/**
 * Shared OTHER-row contract: fixed icon column + optional label.
 * Use `asButton` for Settings. Notifications/Theme wrap host controls in the icon slot (no nested buttons).
 */
export function ZenformedSidebarActionRow({
  icon,
  label,
  showLabel,
  asButton = false,
  onClick,
  title,
  ariaLabel,
  className,
  disabled,
  ...rest
}: ZenformedSidebarActionRowProps): ReactElement {
  const rowClass = [styles.actionRow, className].filter(Boolean).join(' ');
  const labelNode =
    showLabel && label ? (
      <span className={styles.actionLabel} title={label}>
        {label}
      </span>
    ) : null;
  const iconNode = (
    <span className={styles.actionIcon} aria-hidden={asButton ? true : undefined}>
      {icon}
    </span>
  );

  if (asButton) {
    return (
      <button
        type="button"
        className={rowClass}
        onClick={onClick}
        title={title ?? label}
        aria-label={ariaLabel ?? label}
        disabled={disabled}
        data-zenformed-sidebar-action-row="button"
        {...rest}
      >
        {iconNode}
        {labelNode}
      </button>
    );
  }

  return (
    <div className={rowClass} data-zenformed-sidebar-action-row="slot">
      {iconNode}
      {labelNode}
    </div>
  );
}
