const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

export function invalidateSessionRequestCache(key: string): void {
  cache.delete(key);
}

export async function runSessionRequestCached<T>(
  key: string,
  fn: () => Promise<T>,
  options?: { force?: boolean }
): Promise<T> {
  if (options?.force) {
    invalidateSessionRequestCache(key);
  }
  if (cache.has(key)) {
    return cache.get(key) as T;
  }
  const existing = inflight.get(key);
  if (existing) {
    return existing as Promise<T>;
  }
  const promise = fn()
    .then((result) => {
      cache.set(key, result);
      inflight.delete(key);
      return result;
    })
    .catch((e) => {
      inflight.delete(key);
      throw e;
    });
  inflight.set(key, promise);
  return promise as Promise<T>;
}
