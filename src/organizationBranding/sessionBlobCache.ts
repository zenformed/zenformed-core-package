const blobByKey = new Map<string, string>();
const absentKeys = new Set<string>();
const inflightByKey = new Map<string, Promise<string | null>>();

/** Undefined = not loaded yet; null = known absent. */
export function peekSessionBlobUrl(cacheKey: string): string | null | undefined {
  if (absentKeys.has(cacheKey)) return null;
  if (blobByKey.has(cacheKey)) return blobByKey.get(cacheKey) ?? null;
  return undefined;
}

export function invalidateSessionBlob(cacheKey: string): void {
  const existing = blobByKey.get(cacheKey);
  if (existing) URL.revokeObjectURL(existing);
  blobByKey.delete(cacheKey);
  absentKeys.delete(cacheKey);
  inflightByKey.delete(cacheKey);
}

export async function loadSessionBlob(
  cacheKey: string,
  fetchBlob: () => Promise<Blob | null>
): Promise<string | null> {
  const peek = peekSessionBlobUrl(cacheKey);
  if (peek !== undefined) return peek;

  const inflight = inflightByKey.get(cacheKey);
  if (inflight) return inflight;

  const promise = (async () => {
    try {
      const blob = await fetchBlob();
      if (!blob) {
        absentKeys.add(cacheKey);
        return null;
      }
      const url = URL.createObjectURL(blob);
      blobByKey.set(cacheKey, url);
      return url;
    } catch {
      return null;
    } finally {
      inflightByKey.delete(cacheKey);
    }
  })();

  inflightByKey.set(cacheKey, promise);
  return promise;
}

export function brandingLogoCacheKey(userId: string | null, version: number): string {
  return `branding-logo:${userId ?? 'anonymous'}:${version}`;
}
