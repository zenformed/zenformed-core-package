/**
 * Dev-only: warn when a CSS module object is missing keys required by dashboard-shell pick helpers.
 * Production leaves behavior unchanged (still falls back to '').
 */

function shouldWarnMissingCssKeys(): boolean {
  return typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
}

/**
 * @param context — e.g. `pickSidebarBrandingClassNames` so logs are searchable
 * @param styles — object from `import styles from '...module.css'`
 * @param keys — required export names from that CSS module
 */
export function warnMissingDashboardShellCssKeys(
  context: string,
  styles: Record<string, string>,
  keys: readonly string[]
): void {
  if (!shouldWarnMissingCssKeys()) return;
  const missing = keys.filter((k) => styles[k] === undefined || styles[k] === '');
  if (missing.length === 0) return;
  // eslint-disable-next-line no-console -- intentional dev diagnostic
  console.warn(
    `[@zenformed/core/dashboard-shell] ${context}: missing or empty CSS module keys — UI may be unstyled:\n  ${missing.join('\n  ')}\nSee packages/zenformed-core/src/dashboardShell/CSS_MODULE_CONTRACT.md`
  );
}
