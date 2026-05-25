'use client';

import type { ReactElement } from 'react';
import type { CSSModuleClasses } from '../dashboardShell/types';
import type {
  BuildCorePermissionColumnId,
  BuildCorePermissionRoleKey,
  BuildCoreRolePermissionRow,
} from './buildCoreRolePermissionModel';
import { roleLabelForBuildCorePermissionKey } from './buildCoreRolePermissionModel';
import styles from './buildcorePermissions.module.css';

export type ZenformedPermissionMatrixColumn = {
  readonly id: BuildCorePermissionColumnId;
  readonly label: string;
};

export type ZenformedPermissionMatrixProps = {
  readonly classNames?: CSSModuleClasses;
  readonly columns: readonly ZenformedPermissionMatrixColumn[];
  readonly rows: readonly BuildCoreRolePermissionRow[];
  readonly canEditRow: (roleKey: BuildCorePermissionRoleKey) => boolean;
  readonly onToggle: (
    roleKey: BuildCorePermissionRoleKey,
    columnId: BuildCorePermissionColumnId,
    nextValue: boolean
  ) => void;
  readonly busyCell?: { readonly roleKey: BuildCorePermissionRoleKey; readonly columnId: BuildCorePermissionColumnId } | null;
  readonly roleColumnLabel?: string;
};

export function ZenformedPermissionMatrix({
  classNames,
  columns,
  rows,
  canEditRow,
  onToggle,
  busyCell = null,
  roleColumnLabel = 'Role',
}: ZenformedPermissionMatrixProps): ReactElement {
  const s = classNames ?? styles;

  return (
    <div className={s.matrixWrap ?? styles.matrixWrap}>
      <table className={s.matrix ?? styles.matrix}>
        <thead>
          <tr>
            <th scope="col" className={s.roleCol ?? styles.roleCol}>
              {roleColumnLabel}
            </th>
            {columns.map((col) => (
              <th key={col.id} scope="col">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const rowEditable = canEditRow(row.roleKey);
            return (
              <tr
                key={row.roleKey}
                className={rowEditable ? undefined : (s.rowLocked ?? styles.rowLocked)}
              >
                <td className={s.roleCell ?? styles.roleCell}>
                  {roleLabelForBuildCorePermissionKey(row.roleKey)}
                </td>
                {columns.map((col) => {
                  const value = row[col.id];
                  const isBusy =
                    busyCell?.roleKey === row.roleKey && busyCell.columnId === col.id;
                  const label = value ? 'On' : 'Off';
                  return (
                    <td key={col.id}>
                      <button
                        type="button"
                        className={`${s.toggle ?? styles.toggle} ${
                          value ? (s.toggleOn ?? styles.toggleOn) : (s.toggleOff ?? styles.toggleOff)
                        }`}
                        disabled={!rowEditable || isBusy}
                        aria-pressed={value}
                        aria-label={`${roleLabelForBuildCorePermissionKey(row.roleKey)} ${col.label}: ${label}`}
                        onClick={() => onToggle(row.roleKey, col.id, !value)}
                      >
                        {label}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
