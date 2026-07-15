/**
 * Relative timestamps for notification lists.
 * Invalid dates fall back to empty / "Unknown time".
 */

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function formatNotificationAbsoluteDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return d.toISOString();
  }
}

export function formatNotificationRelativeTime(
  iso: string,
  nowMs: number = Date.now()
): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Unknown time';

  const diffMs = nowMs - d.getTime();
  if (diffMs < 0) return 'Just now';

  const sec = Math.floor(diffMs / 1000);
  if (sec < 45) return 'Just now';

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;

  const startOfToday = new Date(nowMs);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (d >= startOfYesterday && d < startOfToday) {
    return 'Yesterday';
  }

  try {
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== new Date(nowMs).getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }
}
